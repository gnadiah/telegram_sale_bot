import { describe, expect, it } from "vitest";
import { PlatformTest } from "@tsed/platform-http/testing";
import SuperTest from "supertest";
import { createAuthenticatedAdminRequest, setupIntegrationTestServer } from "../helpers/integration";

describe("bot catalog", () => {
  setupIntegrationTestServer();

  it("returns products for a category with visible stock", async () => {
    const { request: admin } = await createAuthenticatedAdminRequest();
    const bot = SuperTest(PlatformTest.callback());

    const categoryResponse = await admin
      .post("/admin/categories")
      .send({ name: "Chat GPT", slug: "chat-gpt-bot", sortOrder: 1, isActive: true })
      .expect(201);

    const productResponse = await admin
      .post("/admin/products")
      .send({
        categoryId: categoryResponse.body.category.id,
        isActive: true,
        name: "GPT PLUS 1T",
        price: 30000,
        slug: "gpt-plus-1t",
        sortOrder: 1
      })
      .expect(201);

    await admin
      .post(`/admin/products/${productResponse.body.product.id}/import-text`)
      .send({ text: "acc1\nacc2\nacc3\nacc4\nacc5" })
      .expect(200);

    const response = await bot
      .get(`/bot/categories/${categoryResponse.body.category.id}/products`)
      .set("x-bot-token", "test-bot-token")
      .expect(200);

    expect(response.body[0]).toMatchObject({
      name: "GPT PLUS 1T",
      price: 30000,
      stock: 5
    });
  });

  it("hides inactive categories and products from bot listings", async () => {
    const { request: admin } = await createAuthenticatedAdminRequest();
    const bot = SuperTest(PlatformTest.callback());

    const categoryResponse = await admin
      .post("/admin/categories")
      .send({ name: "Visible Category", slug: "visible-category", sortOrder: 1, isActive: true })
      .expect(201);

    const productResponse = await admin
      .post("/admin/products")
      .send({
        categoryId: categoryResponse.body.category.id,
        isActive: true,
        name: "Visible Product",
        price: 30000,
        slug: "visible-product",
        sortOrder: 1
      })
      .expect(201);

    await admin
      .patch(`/admin/products/${productResponse.body.product.id}`)
      .send({ isActive: false })
      .expect(200);

    const productsResponse = await bot
      .get(`/bot/categories/${categoryResponse.body.category.id}/products`)
      .set("x-bot-token", "test-bot-token")
      .expect(200);

    expect(productsResponse.body).toEqual([]);

    await admin
      .patch(`/admin/categories/${categoryResponse.body.category.id}`)
      .send({ isActive: false })
      .expect(200);

    const categoriesResponse = await bot
      .get("/bot/categories")
      .set("x-bot-token", "test-bot-token")
      .expect(200);

    expect(
      categoriesResponse.body.some((category: { id: string }) => category.id === categoryResponse.body.category.id)
    ).toBe(false);
  });
});
