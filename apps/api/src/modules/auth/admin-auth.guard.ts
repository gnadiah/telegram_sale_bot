import { Middleware, Next, Req, Res } from "@tsed/common";
import type { NextFunction, Request, Response } from "express";
import { Unauthorized } from "@tsed/exceptions";
import { getAdminFromAccessToken } from "./admin-auth.service";

@Middleware()
export class AdminAuthGuard {
  async use(@Req() request: Request, @Res() _response: Response, @Next() next: NextFunction) {
    await requireAdminRequest(request);

    next();
  }
}

export async function requireAdminRequest(request: Request) {
  const authorization = request.headers.authorization;

  if (!authorization?.startsWith("Bearer ")) {
    throw new Unauthorized("Authentication required");
  }

  const accessToken = authorization.slice("Bearer ".length).trim();

  if (!accessToken) {
    throw new Unauthorized("Authentication required");
  }

  return getAdminFromAccessToken(accessToken);
}
