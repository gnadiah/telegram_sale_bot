import { afterAll, beforeAll } from "vitest";
import { PlatformTest } from "@tsed/platform-http/testing";
import SuperTest from "supertest";
import { resetDatabase, setDbContextForTests } from "../../src/config/db";
import { resetEnv } from "../../src/config/env";
import { bootstrapTestSchema } from "../../src/db/test-schema-bootstrap";
import { Server } from "../../src/server";

const adminCredentials = {
  password: "secret123",
  username: "admin"
} as const;

export function setupIntegrationTestServer() {
  const bootstrapServer = PlatformTest.bootstrap(Server);

  beforeAll(async () => {
    setDbContextForTests(await bootstrapTestSchema());
    await bootstrapServer();
  });

  afterAll(async () => {
    await PlatformTest.reset();
    await resetDatabase();
    resetEnv();
  });
}

export function createTestRequest() {
  return SuperTest(PlatformTest.callback());
}

export function createTestAgent() {
  return SuperTest.agent(PlatformTest.callback());
}

export async function loginAsAdmin(request = createTestAgent()) {
  const response = await request
    .post("/admin/auth/login")
    .send(adminCredentials)
    .expect(200);

  return {
    accessToken: response.body.accessToken as string,
    authorization: `Bearer ${response.body.accessToken as string}`,
    refreshCookie: cookieValue(response.headers["set-cookie"][0]),
    request,
    response
  };
}

export async function createAuthenticatedAdminRequest() {
  const login = await loginAsAdmin();

  return {
    accessToken: login.accessToken,
    login,
    request: withBearerAuth(login.request, login.accessToken)
  };
}

export function withBearerAuth(request: ReturnType<typeof SuperTest.agent>, accessToken: string) {
  const authorization = `Bearer ${accessToken}`;

  return {
    delete: (path: string) => request.delete(path).set("Authorization", authorization),
    get: (path: string) => request.get(path).set("Authorization", authorization),
    head: (path: string) => request.head(path).set("Authorization", authorization),
    options: (path: string) => request.options(path).set("Authorization", authorization),
    patch: (path: string) => request.patch(path).set("Authorization", authorization),
    post: (path: string) => request.post(path).set("Authorization", authorization),
    put: (path: string) => request.put(path).set("Authorization", authorization)
  };
}

export function cookieValue(setCookieHeader: string) {
  return setCookieHeader.split(";")[0];
}
