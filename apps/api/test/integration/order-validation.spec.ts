import { describe, expect, it } from "vitest";
import { PlatformTest } from "@tsed/platform-http/testing";
import SuperTest from "supertest";
import { createAuthenticatedAdminRequest, setupIntegrationTestServer } from "../helpers/integration";

describe("order validation", () => {
  setupIntegrationTestServer();

  it("rejects non-positive quantity", async () => {
    const { request: admin } = await createAuthenticatedAdminRequest();
    const bot = SuperTest(PlatformTest.callback());

    const categoryResponse = await admin
      .post("/admin/categories")
      .send({ name: "Validation", slug: "validation", sortOrder: 1, isActive: true })
      .expect(201);

    const productResponse = await admin
      .post("/admin/products")
      .send({
        categoryId: categoryResponse.body.category.id,
        isActive: true,
        name: "Validation Product",
        price: 10000,
        slug: "validation-product",
        sortOrder: 1
      })
      .expect(201);

    await admin
      .post(`/admin/products/${productResponse.body.product.id}/import-text`)
      .send({ text: "acc-a\nacc-b" })
      .expect(200);

    await bot
      .post("/bot/orders")
      .set("x-bot-token", "test-bot-token")
      .send({
        productId: productResponse.body.product.id,
        quantity: 0,
        telegramUserId: "42",
        telegramUsername: "validator"
      })
      .expect(400);
  });
});
