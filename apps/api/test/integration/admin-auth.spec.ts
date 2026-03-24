import { afterEach, describe, expect, it } from "vitest";
import { PlatformTest } from "@tsed/platform-http/testing";
import SuperTest from "supertest";
import { eq } from "drizzle-orm";
import { adminRefreshSessions, adminUsers } from "../../src/db/schema";
import { getDb } from "../../src/config/db";
import { getEnv } from "../../src/config/env";
import { setupIntegrationTestServer } from "../helpers/integration";

describe("admin auth", () => {
  setupIntegrationTestServer();

  afterEach(async () => {
    const db = await getDb();
    const env = getEnv();

    await db.delete(adminRefreshSessions);
    await db
      .update(adminUsers)
      .set({ isActive: true })
      .where(eq(adminUsers.username, env.adminUsername));
  });

  it("returns health status", async () => {
    const request = SuperTest(PlatformTest.callback());
    const response = await request.get("/health").expect(200);

    expect(response.body).toEqual({ ok: true });
  });

  it("logs in with valid admin credentials", async () => {
    const request = SuperTest(PlatformTest.callback());
    const response = await request
      .post("/admin/auth/login")
      .send({ username: "admin", password: "secret123" })
      .expect(200);

    const env = getEnv();

    expect(response.body.accessToken).toEqual(expect.any(String));
    expect(response.body.expiresIn).toEqual(expect.any(Number));
    expect(response.body.user).toEqual({
      id: expect.any(String),
      role: "super_admin",
      username: "admin"
    });
    expect(response.headers["set-cookie"]).toEqual(
      expect.arrayContaining([expect.stringContaining(env.adminAuth.refreshCookieName)])
    );
    expect(response.headers["set-cookie"]).not.toEqual(
      expect.arrayContaining([expect.stringContaining("tsb_admin_session")])
    );

    const db = await getDb();
    const [session] = await db.select().from(adminRefreshSessions);

    expect(session).toMatchObject({
      adminUserId: expect.any(String),
      familyId: expect.any(String),
      tokenHash: expect.any(String),
      userAgent: expect.any(String)
    });
    expect(session?.expiresAt).toBeInstanceOf(Date);
  });

  it("allows credentialed admin requests from the configured web origin", async () => {
    const request = SuperTest(PlatformTest.callback());
    const origin = "http://localhost:3000";

    const preflight = await request
      .options("/admin/auth/login")
      .set("Origin", origin)
      .set("Access-Control-Request-Method", "POST")
      .set("Access-Control-Request-Headers", "content-type")
      .expect(204);

    expect(preflight.headers["access-control-allow-origin"]).toBe(origin);
    expect(preflight.headers["access-control-allow-credentials"]).toBe("true");
    expect(preflight.headers["vary"]).toContain("Origin");

    const login = await request
      .post("/admin/auth/login")
      .set("Origin", origin)
      .send({ username: "admin", password: "secret123" })
      .expect(200);

    expect(login.headers["access-control-allow-origin"]).toBe(origin);
    expect(login.headers["access-control-allow-credentials"]).toBe("true");
  });

  it("returns me from a bearer access token", async () => {
    const request = SuperTest(PlatformTest.callback());
    const login = await request
      .post("/admin/auth/login")
      .send({ username: "admin", password: "secret123" })
      .expect(200);

    const me = await request
      .get("/admin/auth/me")
      .set("Authorization", `Bearer ${login.body.accessToken}`)
      .expect(200);

    expect(me.body).toEqual({
      user: {
        id: expect.any(String),
        role: "super_admin",
        username: "admin"
      }
    });
  });

  it("rotates refresh tokens on refresh", async () => {
    const request = SuperTest(PlatformTest.callback());
    const login = await request
      .post("/admin/auth/login")
      .send({ username: "admin", password: "secret123" })
      .expect(200);
    const refreshCookie = cookieValue(login.headers["set-cookie"][0]);

    const refreshed = await request
      .post("/admin/auth/refresh")
      .set("Cookie", refreshCookie)
      .expect(200);

    expect(refreshed.body.accessToken).toEqual(expect.any(String));
    expect(refreshed.body.expiresIn).toEqual(expect.any(Number));
    expect(refreshed.body.user).toEqual({
      id: expect.any(String),
      role: "super_admin",
      username: "admin"
    });
    expect(refreshed.headers["set-cookie"]).toEqual(
      expect.arrayContaining([expect.stringContaining(getEnv().adminAuth.refreshCookieName)])
    );

    await request
      .post("/admin/auth/refresh")
      .set("Cookie", refreshCookie)
      .expect(401);
  });

  it("logs out the current refresh session", async () => {
    const request = SuperTest(PlatformTest.callback());
    const login = await request
      .post("/admin/auth/login")
      .send({ username: "admin", password: "secret123" })
      .expect(200);
    const refreshCookie = cookieValue(login.headers["set-cookie"][0]);

    const logout = await request
      .post("/admin/auth/logout")
      .set("Cookie", refreshCookie)
      .expect(200);

    expect(logout.headers["set-cookie"]).toEqual(
      expect.arrayContaining([
        expect.stringContaining(`${getEnv().adminAuth.refreshCookieName}=`),
        expect.stringContaining("Expires=")
      ])
    );

    await request
      .post("/admin/auth/refresh")
      .set("Cookie", refreshCookie)
      .expect(401);
  });

  it("logs out all refresh sessions for the current admin", async () => {
    const requestA = SuperTest(PlatformTest.callback());
    const requestB = SuperTest(PlatformTest.callback());

    const loginA = await requestA
      .post("/admin/auth/login")
      .send({ username: "admin", password: "secret123" })
      .expect(200);
    const loginB = await requestB
      .post("/admin/auth/login")
      .send({ username: "admin", password: "secret123" })
      .expect(200);
    const refreshCookieA = cookieValue(loginA.headers["set-cookie"][0]);
    const refreshCookieB = cookieValue(loginB.headers["set-cookie"][0]);

    await requestA
      .post("/admin/auth/logout-all")
      .set("Authorization", `Bearer ${loginA.body.accessToken}`)
      .expect(200);

    await requestA
      .post("/admin/auth/refresh")
      .set("Cookie", refreshCookieA)
      .expect(401);
    await requestB
      .post("/admin/auth/refresh")
      .set("Cookie", refreshCookieB)
      .expect(401);

    const db = await getDb();
    const sessions = await db.select().from(adminRefreshSessions);

    expect(sessions).toHaveLength(2);
    expect(
      sessions.every((session: { revokedAt: Date | null }) => session.revokedAt instanceof Date)
    ).toBe(true);
  });

  it("blocks inactive accounts at login and refresh", async () => {
    const request = SuperTest(PlatformTest.callback());
    const login = await request
      .post("/admin/auth/login")
      .send({ username: "admin", password: "secret123" })
      .expect(200);
    const refreshCookie = cookieValue(login.headers["set-cookie"][0]);

    const db = await getDb();
    await db
      .update(adminUsers)
      .set({ isActive: false })
      .where(eq(adminUsers.username, "admin"));

    await request
      .post("/admin/auth/login")
      .send({ username: "admin", password: "secret123" })
      .expect(401);

    await request
      .post("/admin/auth/refresh")
      .set("Cookie", refreshCookie)
      .expect(401);
  });

  it("rejects malformed login payloads", async () => {
    const request = SuperTest(PlatformTest.callback());

    await request
      .post("/admin/auth/login")
      .send({ username: 123, password: null })
      .expect(400);
  });
});

function cookieValue(setCookieHeader: string) {
  return setCookieHeader.split(";")[0];
}
