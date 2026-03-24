import { describe, expect, it } from "vitest";
import { PlatformTest } from "@tsed/platform-http/testing";
import SuperTest from "supertest";
import { createAuthenticatedAdminRequest, setupIntegrationTestServer } from "../helpers/integration";

describe("bot orders", () => {
  setupIntegrationTestServer();

  it("creates an order and exposes a delivery file", async () => {
    const { request: admin } = await createAuthenticatedAdminRequest();
    const bot = SuperTest(PlatformTest.callback());

    const categoryResponse = await admin
      .post("/admin/categories")
      .send({ name: "VEO Ultra", slug: "veo-ultra", sortOrder: 1, isActive: true })
      .expect(201);

    const productResponse = await admin
      .post("/admin/products")
      .send({
        categoryId: categoryResponse.body.category.id,
        isActive: true,
        name: "VEO3 ULTRA 25K",
        price: 80000,
        slug: "veo3-ultra-25k",
        sortOrder: 1
      })
      .expect(201);

    await admin
      .post(`/admin/products/${productResponse.body.product.id}/import-text`)
      .send({ text: "line-1\nline-2\nline-3" })
      .expect(200);

    const orderResponse = await bot
      .post("/bot/orders")
      .set("x-bot-token", "test-bot-token")
      .send({
        productId: productResponse.body.product.id,
        quantity: 2,
        telegramUserId: "123456",
        telegramUsername: "salebuyer"
      })
      .expect(201);

    expect(orderResponse.body.order).toMatchObject({
      quantity: 2,
      totalPriceSnapshot: 160000,
      unitPriceSnapshot: 80000
    });

    const fileResponse = await bot
      .get(`/bot/orders/${orderResponse.body.order.id}/delivery-file`)
      .set("x-bot-token", "test-bot-token")
      .expect(200);

    expect(fileResponse.text.split("\n")).toEqual(["line-1", "line-2"]);
  });
});
