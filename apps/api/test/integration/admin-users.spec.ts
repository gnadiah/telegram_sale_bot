import { afterEach, describe, expect, it } from "vitest";
import { and, eq, ne } from "drizzle-orm";
import { Forbidden } from "@tsed/exceptions";
import { getDb } from "../../src/config/db";
import { getEnv } from "../../src/config/env";
import { adminRefreshSessions, adminUsers } from "../../src/db/schema";
import {
  createTestRequest,
  loginAsAdmin,
  setupIntegrationTestServer
} from "../helpers/integration";

describe("admin users", () => {
  setupIntegrationTestServer();

  afterEach(async () => {
    const db = await getDb();
    const env = getEnv();

    await db.delete(adminRefreshSessions);
    await db.delete(adminUsers).where(ne(adminUsers.username, env.adminUsername));
    await db
      .update(adminUsers)
      .set({ isActive: true, role: "super_admin", updatedAt: new Date() })
      .where(eq(adminUsers.username, env.adminUsername));
  });

  it("allows super_admin to create, list, and patch admin users", async () => {
    const request = createTestRequest();
    const { authorization } = await loginAsAdmin(request);

    const create = await request
      .post("/admin/admin-users")
      .set("Authorization", authorization)
      .send({ username: "staff1", password: "secret123", role: "admin", isActive: true })
      .expect(201);

    expect(create.body.user).toMatchObject({
      id: expect.any(String),
      isActive: true,
      role: "admin",
      username: "staff1"
    });

    const list = await request
      .get("/admin/admin-users")
      .set("Authorization", authorization)
      .expect(200);

    expect(list.body).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ role: "super_admin", username: "admin" }),
        expect.objectContaining({ role: "admin", username: "staff1" })
      ])
    );

    const patch = await request
      .patch(`/admin/admin-users/${create.body.user.id}`)
      .set("Authorization", authorization)
      .send({ isActive: false, password: "new-secret123", role: "super_admin" })
      .expect(200);

    expect(patch.body.user).toMatchObject({
      id: create.body.user.id,
      isActive: false,
      role: "super_admin",
      username: "staff1"
    });

    await request
      .post("/admin/auth/login")
      .send({ username: "staff1", password: "secret123" })
      .expect(401);
    await request
      .post("/admin/auth/login")
      .send({ username: "staff1", password: "new-secret123" })
      .expect(401);
  });

  it("blocks normal admin from admin-user management", async () => {
    const superAdmin = createTestRequest();
    const { authorization: superAuthorization } = await loginAsAdmin(superAdmin);

    await superAdmin
      .post("/admin/admin-users")
      .set("Authorization", superAuthorization)
      .send({ username: "staff2", password: "secret123", role: "admin", isActive: true })
      .expect(201);

    const normalAdmin = createTestRequest();
    const login = await normalAdmin
      .post("/admin/auth/login")
      .send({ username: "staff2", password: "secret123" })
      .expect(200);

    const response = await normalAdmin
      .get("/admin/admin-users")
      .set("Authorization", `Bearer ${login.body.accessToken}`)
      .expect(403);

    expect(response.body.message).toBe(new Forbidden("Forbidden").message);
  });

  it("rejects malformed admin-user payloads", async () => {
    const request = createTestRequest();
    const { authorization } = await loginAsAdmin(request);

    await request
      .post("/admin/admin-users")
      .set("Authorization", authorization)
      .send({ username: 123, password: null, role: "owner", isActive: "yes" })
      .expect(400);
  });

  it("prevents removing the last active super_admin", async () => {
    const request = createTestRequest();
    const { authorization } = await loginAsAdmin(request);
    const env = getEnv();
    const db = await getDb();
    const defaultAdmin = await db.query.adminUsers.findFirst({
      where: eq(adminUsers.username, env.adminUsername)
    });

    expect(defaultAdmin).toBeTruthy();

    await request
      .patch(`/admin/admin-users/${defaultAdmin!.id}`)
      .set("Authorization", authorization)
      .send({ role: "admin" })
      .expect(409);

    await request
      .patch(`/admin/admin-users/${defaultAdmin!.id}`)
      .set("Authorization", authorization)
      .send({ isActive: false })
      .expect(409);
  });
});
