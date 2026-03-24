import { describe, expect, it } from "vitest";
import { PlatformTest } from "@tsed/platform-http/testing";
import SuperTest from "supertest";
import { createAuthenticatedAdminRequest, setupIntegrationTestServer } from "../helpers/integration";

describe("admin orders", () => {
  setupIntegrationTestServer();

  it("lists orders and returns sold items in order detail", async () => {
    const { request: admin } = await createAuthenticatedAdminRequest();
    const bot = SuperTest(PlatformTest.callback());

    const categoryResponse = await admin
      .post("/admin/categories")
      .send({ name: "Orders", slug: "orders", sortOrder: 1, isActive: true })
      .expect(201);

    const productResponse = await admin
      .post("/admin/products")
      .send({
        categoryId: categoryResponse.body.category.id,
        isActive: true,
        name: "Orders Product",
        price: 33000,
        slug: "orders-product",
        sortOrder: 1
      })
      .expect(201);

    await admin
      .post(`/admin/products/${productResponse.body.product.id}/import-text`)
      .send({ text: "account-a\naccount-b" })
      .expect(200);

    const orderResponse = await bot
      .post("/bot/orders")
      .set("x-bot-token", "test-bot-token")
      .send({
        productId: productResponse.body.product.id,
        quantity: 2,
        telegramUserId: "999",
        telegramUsername: "adminviewer"
      })
      .expect(201);

    const ordersResponse = await admin.get("/admin/orders").expect(200);
    const detailResponse = await admin.get(`/admin/orders/${orderResponse.body.order.id}`).expect(200);

    expect(ordersResponse.body[0].id).toBe(orderResponse.body.order.id);
    expect(detailResponse.body.items).toEqual(["account-a", "account-b"]);
  });
});
