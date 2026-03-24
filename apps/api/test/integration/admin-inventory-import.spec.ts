import { describe, expect, it } from "vitest";
import { createAuthenticatedAdminRequest, setupIntegrationTestServer } from "../helpers/integration";

describe("admin inventory import", () => {
  setupIntegrationTestServer();

  it("imports pasted inventory lines and reports stock", async () => {
    const { request } = await createAuthenticatedAdminRequest();

    const categoryResponse = await request
      .post("/admin/categories")
      .send({ name: "Veo", slug: "veo", sortOrder: 1, isActive: true })
      .expect(201);

    const productResponse = await request
      .post("/admin/products")
      .send({
        categoryId: categoryResponse.body.category.id,
        isActive: true,
        name: "VEO Ultra 1T",
        price: 120000,
        slug: "veo-ultra-1t",
        sortOrder: 1
      })
      .expect(201);

    await request
      .post(`/admin/products/${productResponse.body.product.id}/import-text`)
      .send({ text: "acc1\nacc2\n\nacc3" })
      .expect(200);

    const response = await request
      .get(`/admin/products/${productResponse.body.product.id}/stock-summary`)
      .expect(200);

    expect(response.body.availableStock).toBe(3);
  });

  it("imports txt payload content as inventory", async () => {
    const { request } = await createAuthenticatedAdminRequest();

    const categoryResponse = await request
      .post("/admin/categories")
      .send({ name: "Chat GPT", slug: "chatgpt", sortOrder: 1, isActive: true })
      .expect(201);

    const productResponse = await request
      .post("/admin/products")
      .send({
        categoryId: categoryResponse.body.category.id,
        isActive: true,
        name: "GPT Plus Team",
        price: 30000,
        slug: "gpt-plus-team",
        sortOrder: 1
      })
      .expect(201);

    const response = await request
      .post(`/admin/products/${productResponse.body.product.id}/import-txt`)
      .send({ filename: "stock.txt", text: "line-a\nline-b\n" })
      .expect(200);

    expect(response.body.importBatch).toMatchObject({
      originalFilename: "stock.txt",
      totalAccepted: 2,
      totalReceived: 2
    });
  });

  it("includes available stock in the admin product list", async () => {
    const { request } = await createAuthenticatedAdminRequest();

    const categoryResponse = await request
      .post("/admin/categories")
      .send({ name: "Stock Category", slug: "stock-category", sortOrder: 10, isActive: true })
      .expect(201);

    const productResponse = await request
      .post("/admin/products")
      .send({
        categoryId: categoryResponse.body.category.id,
        isActive: true,
        name: "Stock Product",
        price: 10000,
        slug: "stock-product",
        sortOrder: 10
      })
      .expect(201);

    await request
      .post(`/admin/products/${productResponse.body.product.id}/import-text`)
      .send({ text: "line-1\nline-2" })
      .expect(200);

    const response = await request.get("/admin/products").expect(200);

    const listedProduct = response.body.find((product: { id: string }) => product.id === productResponse.body.product.id);

    expect(listedProduct).toMatchObject({
      availableStock: 2,
      id: productResponse.body.product.id,
      name: "Stock Product"
    });
  });

  it("lists available stock items for a product", async () => {
    const { request } = await createAuthenticatedAdminRequest();

    const categoryResponse = await request
      .post("/admin/categories")
      .send({ name: "Inventory Category", slug: "inventory-category", sortOrder: 10, isActive: true })
      .expect(201);

    const productResponse = await request
      .post("/admin/products")
      .send({
        categoryId: categoryResponse.body.category.id,
        isActive: true,
        name: "Inventory Product",
        price: 10000,
        slug: "inventory-product",
        sortOrder: 10
      })
      .expect(201);

    await request
      .post(`/admin/products/${productResponse.body.product.id}/import-text`)
      .send({ text: "line-1\nline-2\nline-3" })
      .expect(200);

    const response = await request
      .get(`/admin/products/${productResponse.body.product.id}/stock-items`)
      .expect(200);

    expect(response.body.items).toHaveLength(3);
    expect(response.body.items).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          content: "line-1",
          productId: productResponse.body.product.id,
          status: "available"
        }),
        expect.objectContaining({
          content: "line-2",
          productId: productResponse.body.product.id,
          status: "available"
        }),
        expect.objectContaining({
          content: "line-3",
          productId: productResponse.body.product.id,
          status: "available"
        })
      ])
    );
  });
});
