import { randomUUID } from "node:crypto";
import { compare, hash } from "bcryptjs";
import { and, eq, gt, isNull } from "drizzle-orm";
import { Injectable } from "@tsed/di";
import { Unauthorized } from "@tsed/exceptions";
import { getDb } from "../../config/db";
import { getEnv } from "../../config/env";
import { adminRefreshSessions, adminUsers } from "../../db/schema";
import { adminTokenService } from "./admin-token.service";

type SessionMetadata = {
  ipAddress: string;
  userAgent: string;
};

@Injectable()
export class AdminAuthService {
  async ensureDefaultAdmin() {
    return ensureDefaultAdminUser();
  }

  async login(input: { password: string; username: string }, metadata?: SessionMetadata) {
    return loginAdmin(input, metadata);
  }
}

export async function ensureDefaultAdminUser() {
  const env = getEnv();
  const db = await getDb();
  const existingUser = await db.query.adminUsers.findFirst({
    where: eq(adminUsers.username, env.adminUsername)
  });

  if (existingUser) {
    return existingUser;
  }

  const passwordHash = await hash(env.adminPassword, 10);
  const [createdUser] = await db
    .insert(adminUsers)
    .values({
      id: randomUUID(),
      isActive: true,
      passwordHash,
      role: "super_admin",
      username: env.adminUsername
    })
    .returning();

  return createdUser;
}

export async function loginAdmin(input: { password: string; username: string }, metadata?: SessionMetadata) {
  const db = await getDb();
  const user = await db.query.adminUsers.findFirst({
    where: eq(adminUsers.username, input.username)
  });

  if (!user || !user.isActive) {
    return null;
  }

  const isValidPassword = await compare(input.password, user.passwordHash);

  if (!isValidPassword) {
    return null;
  }

  return createSessionForUser(user, metadata);
}

export async function getAdminById(userId: string) {
  const db = await getDb();

  return db.query.adminUsers.findFirst({
    where: eq(adminUsers.id, userId)
  });
}

export async function getAdminFromAccessToken(accessToken: string) {
  const payload = await adminTokenService.verifyAccessToken(accessToken);
  const user = await getAdminById(payload.adminUserId);

  if (!user || !user.isActive) {
    throw new Unauthorized("Authentication required");
  }

  return {
    sessionId: payload.sessionId,
    user
  };
}

export async function refreshAdminSession(refreshToken: string, metadata?: SessionMetadata) {
  const db = await getDb();
  const tokenHash = adminTokenService.hashRefreshToken(refreshToken);
  const now = new Date();
  const outcome = await db.transaction(async (tx: Awaited<ReturnType<typeof getDb>>) => {
    const [session] = await tx
      .update(adminRefreshSessions)
      .set({
        lastUsedAt: now,
        revokedAt: now
      })
      .where(
        and(
          eq(adminRefreshSessions.tokenHash, tokenHash),
          isNull(adminRefreshSessions.revokedAt),
          gt(adminRefreshSessions.expiresAt, now)
        )
      )
      .returning();

    if (!session) {
      const existingSession = await tx.query.adminRefreshSessions.findFirst({
        where: eq(adminRefreshSessions.tokenHash, tokenHash)
      });

      if (existingSession?.revokedAt && existingSession.replacedBySessionId) {
        return {
          familyId: existingSession.familyId,
          status: "replay" as const
        };
      }

      return {
        status: "unauthorized" as const
      };
    }

    const user = await tx.query.adminUsers.findFirst({
      where: eq(adminUsers.id, session.adminUserId)
    });

    if (!user || !user.isActive) {
      return {
        status: "unauthorized" as const
      };
    }

    const nextSessionId = randomUUID();
    const nextRefreshToken = adminTokenService.createRefreshToken();
    const nextTokenHash = adminTokenService.hashRefreshToken(nextRefreshToken);
    const nextExpiresAt = adminTokenService.getRefreshTokenExpiresAt();

    await tx.insert(adminRefreshSessions).values({
      adminUserId: user.id,
      familyId: session.familyId,
      expiresAt: nextExpiresAt,
      id: nextSessionId,
      ipAddress: metadata?.ipAddress ?? "unknown",
      lastUsedAt: null,
      tokenHash: nextTokenHash,
      userAgent: metadata?.userAgent ?? "unknown"
    });

    await tx
      .update(adminRefreshSessions)
      .set({
        replacedBySessionId: nextSessionId
      })
      .where(eq(adminRefreshSessions.id, session.id));

    const accessToken = await adminTokenService.createAccessToken({
      adminUserId: user.id,
      role: user.role,
      sessionId: nextSessionId
    });

    return {
      accessToken,
      expiresIn: adminTokenService.getAccessTokenExpiresInSeconds(),
      refreshToken: nextRefreshToken,
      status: "success" as const,
      user
    };
  });

  if (outcome.status === "replay") {
    await revokeRefreshTokenFamily(outcome.familyId);
    throw new Unauthorized("Authentication required");
  }

  if (outcome.status === "unauthorized") {
    throw new Unauthorized("Authentication required");
  }

  return outcome;
}

export async function logoutAdminSession(refreshToken: string) {
  const db = await getDb();
  const tokenHash = adminTokenService.hashRefreshToken(refreshToken);

  await db
    .update(adminRefreshSessions)
    .set({ revokedAt: new Date() })
    .where(and(eq(adminRefreshSessions.tokenHash, tokenHash), isNull(adminRefreshSessions.revokedAt)));
}

export async function logoutAllAdminSessions(adminUserId: string) {
  const db = await getDb();

  await db
    .update(adminRefreshSessions)
    .set({ revokedAt: new Date() })
    .where(and(eq(adminRefreshSessions.adminUserId, adminUserId), isNull(adminRefreshSessions.revokedAt)));
}

async function revokeRefreshTokenFamily(
  familyId: string,
  dbOrTx?: Awaited<ReturnType<typeof getDb>>
) {
  const database = dbOrTx ?? (await getDb());

  await database
    .update(adminRefreshSessions)
    .set({ revokedAt: new Date() })
    .where(and(eq(adminRefreshSessions.familyId, familyId), isNull(adminRefreshSessions.revokedAt)));
}

async function createSessionForUser(
  user: { id: string; role: string; username: string },
  metadata?: SessionMetadata
) {
  const db = await getDb();
  const sessionId = randomUUID();
  const familyId = randomUUID();
  const refreshToken = adminTokenService.createRefreshToken();
  const expiresAt = adminTokenService.getRefreshTokenExpiresAt();
  const tokenHash = adminTokenService.hashRefreshToken(refreshToken);

  await db.insert(adminRefreshSessions).values({
    adminUserId: user.id,
    familyId,
    expiresAt,
    id: sessionId,
    ipAddress: metadata?.ipAddress ?? "unknown",
    lastUsedAt: null,
    tokenHash,
    userAgent: metadata?.userAgent ?? "unknown"
  });

  const accessToken = await adminTokenService.createAccessToken({
    adminUserId: user.id,
    role: user.role,
    sessionId
  });

  return {
    accessToken,
    expiresIn: adminTokenService.getAccessTokenExpiresInSeconds(),
    refreshToken,
    user
  };
}
