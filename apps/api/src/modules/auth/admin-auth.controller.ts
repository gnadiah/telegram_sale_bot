import { Controller, Get, Post, Req, Res } from "@tsed/common";
import { BadRequest, Unauthorized } from "@tsed/exceptions";
import type { Request, Response } from "express";
import { getEnv } from "../../config/env";
import {
  loginAdmin,
  logoutAdminSession,
  logoutAllAdminSessions,
  refreshAdminSession
} from "./admin-auth.service";
import { requireAdminRequest } from "./admin-auth.guard";

type LoginPayload = {
  password: string;
  username: string;
};

@Controller("/admin/auth")
export class AdminAuthController {
  @Get("/me")
  async me(@Req() request: Request) {
    const { user } = await requireAdminRequest(request);

    return {
      user: {
        id: user.id,
        role: user.role,
        username: user.username
      }
    };
  }

  @Post("/login")
  async login(@Req() request: Request, @Res() response: Response) {
    const { password, username } = getLoginPayload(request.body);
    const result = await loginAdmin(
      { password, username },
      {
        ipAddress: request.ip || request.socket.remoteAddress || "unknown",
        userAgent: request.headers["user-agent"]?.toString() || "unknown"
      }
    );

    if (!result) {
      throw new Unauthorized("Invalid username or password");
    }

    const env = getEnv();
    const secureCookie = env.nodeEnv === "production";

    response.cookie(env.adminAuth.refreshCookieName, result.refreshToken, {
      httpOnly: true,
      maxAge: env.adminAuth.refreshTokenDays * 24 * 60 * 60 * 1000,
      sameSite: "lax",
      secure: secureCookie
    });

    return {
      accessToken: result.accessToken,
      expiresIn: result.expiresIn,
      user: {
        id: result.user.id,
        role: result.user.role,
        username: result.user.username
      }
    };
  }

  @Post("/refresh")
  async refresh(@Req() request: Request, @Res() response: Response) {
    const env = getEnv();
    const refreshToken = request.cookies?.[env.adminAuth.refreshCookieName] as string | undefined;

    if (!refreshToken) {
      throw new Unauthorized("Authentication required");
    }

    const result = await refreshAdminSession(refreshToken, {
      ipAddress: request.ip || request.socket.remoteAddress || "unknown",
      userAgent: request.headers["user-agent"]?.toString() || "unknown"
    });
    const secureCookie = env.nodeEnv === "production";

    response.cookie(env.adminAuth.refreshCookieName, result.refreshToken, {
      httpOnly: true,
      maxAge: env.adminAuth.refreshTokenDays * 24 * 60 * 60 * 1000,
      sameSite: "lax",
      secure: secureCookie
    });

    return {
      accessToken: result.accessToken,
      expiresIn: result.expiresIn,
      user: {
        id: result.user.id,
        role: result.user.role,
        username: result.user.username
      }
    };
  }

  @Post("/logout")
  async logout(@Req() request: Request, @Res() response: Response) {
    const env = getEnv();
    const refreshToken = request.cookies?.[env.adminAuth.refreshCookieName] as string | undefined;

    if (refreshToken) {
      await logoutAdminSession(refreshToken);
    }

    response.clearCookie(env.adminAuth.refreshCookieName, {
      httpOnly: true,
      sameSite: "lax",
      secure: env.nodeEnv === "production"
    });

    return { ok: true };
  }

  @Post("/logout-all")
  async logoutAll(@Req() request: Request, @Res() response: Response) {
    const { user } = await requireAdminRequest(request);
    const env = getEnv();

    await logoutAllAdminSessions(user.id);
    response.clearCookie(env.adminAuth.refreshCookieName, {
      httpOnly: true,
      sameSite: "lax",
      secure: env.nodeEnv === "production"
    });

    return { ok: true };
  }
}

function getLoginPayload(body: unknown): LoginPayload {
  if (!body || typeof body !== "object") {
    throw new BadRequest("Invalid login payload");
  }

  const { password, username } = body as Partial<LoginPayload>;

  if (typeof username !== "string" || typeof password !== "string") {
    throw new BadRequest("Invalid login payload");
  }

  const normalizedUsername = username.trim();

  if (!normalizedUsername || normalizedUsername.length > 255 || password.length === 0) {
    throw new BadRequest("Invalid login payload");
  }

  return {
    password,
    username: normalizedUsername
  };
}
