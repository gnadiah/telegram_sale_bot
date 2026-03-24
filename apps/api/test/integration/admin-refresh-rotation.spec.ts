import { afterEach, describe, expect, it } from "vitest";
import { eq } from "drizzle-orm";
import { getDb } from "../../src/config/db";
import { getEnv } from "../../src/config/env";
import { adminRefreshSessions, adminUsers } from "../../src/db/schema";
import {
  cookieValue,
  createTestRequest,
  setupIntegrationTestServer
} from "../helpers/integration";

describe("admin refresh rotation", () => {
  setupIntegrationTestServer();

  afterEach(async () => {
    const db = await getDb();
    const env = getEnv();

    await db.delete(adminRefreshSessions);
    await db
      .update(adminUsers)
      .set({ isActive: true, role: "super_admin", updatedAt: new Date() })
      .where(eq(adminUsers.username, env.adminUsername));
  });

  it("revokes the token family when a rotated refresh token is reused", async () => {
    const request = createTestRequest();
    const firstLogin = await request
      .post("/admin/auth/login")
      .send({ username: "admin", password: "secret123" })
      .expect(200);
    const firstCookie = cookieValue(firstLogin.headers["set-cookie"][0]);

    const secondLogin = await request
      .post("/admin/auth/refresh")
      .set("Cookie", firstCookie)
      .expect(200);
    const secondCookie = cookieValue(secondLogin.headers["set-cookie"][0]);

    await request
      .post("/admin/auth/refresh")
      .set("Cookie", firstCookie)
      .expect(401);

    await request
      .post("/admin/auth/refresh")
      .set("Cookie", secondCookie)
      .expect(401);
  });

  it("does not allow two concurrent refreshes to mint two live child sessions", async () => {
    const requestA = createTestRequest();
    const requestB = createTestRequest();
    const login = await requestA
      .post("/admin/auth/login")
      .send({ username: "admin", password: "secret123" })
      .expect(200);
    const originalCookie = cookieValue(login.headers["set-cookie"][0]);

    const [first, second] = await Promise.all([
      requestA.post("/admin/auth/refresh").set("Cookie", originalCookie),
      requestB.post("/admin/auth/refresh").set("Cookie", originalCookie)
    ]);
    const statuses = [first.status, second.status].sort();

    expect(statuses).toEqual([200, 401]);

    const successfulRefresh = [first, second].find((response) => response.status === 200);

    expect(successfulRefresh).toBeTruthy();

    await requestA
      .post("/admin/auth/refresh")
      .set("Cookie", cookieValue(successfulRefresh!.headers["set-cookie"][0]))
      .expect(401);
  });
});
