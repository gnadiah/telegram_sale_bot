import { describe, expect, it } from "vitest";
import { PlatformTest } from "@tsed/platform-http/testing";
import SuperTest from "supertest";
import { createAuthenticatedAdminRequest, setupIntegrationTestServer } from "../helpers/integration";

describe("order race", () => {
  setupIntegrationTestServer();

  it("rejects the second order when stock is no longer sufficient", async () => {
    const { request: admin } = await createAuthenticatedAdminRequest();
    const bot = SuperTest(PlatformTest.callback());

    const categoryResponse = await admin
      .post("/admin/categories")
      .send({ name: "Race", slug: "race", sortOrder: 1, isActive: true })
      .expect(201);

    const productResponse = await admin
      .post("/admin/products")
      .send({
        categoryId: categoryResponse.body.category.id,
        isActive: true,
        name: "Race Product",
        price: 10000,
        slug: "race-product",
        sortOrder: 1
      })
      .expect(201);

    await admin
      .post(`/admin/products/${productResponse.body.product.id}/import-text`)
      .send({ text: "acc-a\nacc-b" })
      .expect(200);

    const createOrder = () =>
      bot
        .post("/bot/orders")
        .set("x-bot-token", "test-bot-token")
        .send({
          productId: productResponse.body.product.id,
          quantity: 2,
          telegramUserId: crypto.randomUUID(),
          telegramUsername: "racer"
        })
        .then((response) => {
          if (response.status !== 201) {
            throw new Error(`unexpected-status:${response.status}`);
          }

          return response;
        });

    const [first, second] = await Promise.allSettled([createOrder(), createOrder()]);

    expect([first.status, second.status].sort()).toEqual(["fulfilled", "rejected"]);
  });
});
