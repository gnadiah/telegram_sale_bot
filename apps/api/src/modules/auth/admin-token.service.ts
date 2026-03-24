import { createHash, createSecretKey, randomBytes } from "node:crypto";
import { Injectable } from "@tsed/di";
import { jwtVerify, SignJWT } from "jose";
import { getEnv } from "../../config/env";

@Injectable()
export class AdminTokenService {
  async createAccessToken(input: { adminUserId: string; role: string; sessionId: string }) {
    const env = getEnv();

    return new SignJWT({
      role: input.role,
      sessionId: input.sessionId
    })
      .setProtectedHeader({ alg: "HS256", typ: "JWT" })
      .setSubject(input.adminUserId)
      .setIssuedAt()
      .setExpirationTime(`${env.adminAuth.accessTokenTtlMinutes}m`)
      .sign(createSecretKey(Buffer.from(env.adminAuth.accessTokenSecret)));
  }

  async verifyAccessToken(accessToken: string) {
    const env = getEnv();
    const result = await jwtVerify(accessToken, createSecretKey(Buffer.from(env.adminAuth.accessTokenSecret)));
    const payload = result.payload;

    if (
      typeof payload.sub !== "string" ||
      typeof payload.role !== "string" ||
      typeof payload.sessionId !== "string"
    ) {
      throw new Error("Invalid access token payload");
    }

    return {
      adminUserId: payload.sub,
      role: payload.role,
      sessionId: payload.sessionId
    };
  }

  createRefreshToken() {
    return randomBytes(48).toString("base64url");
  }

  hashRefreshToken(refreshToken: string) {
    return createHash("sha256").update(refreshToken).digest("hex");
  }

  getRefreshTokenExpiresAt() {
    const env = getEnv();
    return new Date(Date.now() + env.adminAuth.refreshTokenDays * 24 * 60 * 60 * 1000);
  }

  getAccessTokenExpiresInSeconds() {
    return getEnv().adminAuth.accessTokenTtlMinutes * 60;
  }
}

export const adminTokenService = new AdminTokenService();
