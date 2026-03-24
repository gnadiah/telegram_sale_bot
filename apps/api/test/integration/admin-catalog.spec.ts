import { describe, expect, it } from "vitest";
import { createAuthenticatedAdminRequest, setupIntegrationTestServer } from "../helpers/integration";

describe("admin catalog", () => {
  setupIntegrationTestServer();

  it("creates a category with sort order", async () => {
    const { request } = await createAuthenticatedAdminRequest();

    const response = await request
      .post("/admin/categories")
      .send({ name: "Chat GPT", slug: "chat-gpt", sortOrder: 10, isActive: true })
      .expect(201);

    expect(response.body.category).toMatchObject({
      isActive: true,
      name: "Chat GPT",
      slug: "chat-gpt",
      sortOrder: 10
    });
  });

  it("creates a product linked to a category", async () => {
    const { request } = await createAuthenticatedAdminRequest();

    const categoryResponse = await request
      .post("/admin/categories")
      .send({ name: "Claude", slug: "claude", sortOrder: 20, isActive: true })
      .expect(201);

    const response = await request
      .post("/admin/products")
      .send({
        categoryId: categoryResponse.body.category.id,
        isActive: true,
        name: "Claude Pro 1T",
        price: 80000,
        slug: "claude-pro-1t",
        sortOrder: 5
      })
      .expect(201);

    expect(response.body.product).toMatchObject({
      categoryId: categoryResponse.body.category.id,
      isActive: true,
      name: "Claude Pro 1T",
      price: 80000,
      slug: "claude-pro-1t",
      sortOrder: 5
    });
  });

  it("lists categories and products for admin views", async () => {
    const { request } = await createAuthenticatedAdminRequest();

    const categoryResponse = await request
      .post("/admin/categories")
      .send({ name: "List Category", slug: "list-category", sortOrder: 2, isActive: true })
      .expect(201);

    await request
      .post("/admin/products")
      .send({
        categoryId: categoryResponse.body.category.id,
        isActive: true,
        name: "List Product",
        price: 45000,
        slug: "list-product",
        sortOrder: 4
      })
      .expect(201);

    const categoriesResponse = await request.get("/admin/categories").expect(200);
    const productsResponse = await request.get("/admin/products").expect(200);

    expect(categoriesResponse.body[0].name).toBe("List Category");
    expect(productsResponse.body[0].name).toBe("List Product");
  });

  it("patches a category field-by-field", async () => {
    const { request } = await createAuthenticatedAdminRequest();

    const categoryResponse = await request
      .post("/admin/categories")
      .send({ name: "Original Category", slug: "original-category", sortOrder: 1, isActive: true })
      .expect(201);

    const response = await request
      .patch(`/admin/categories/${categoryResponse.body.category.id}`)
      .send({ isActive: false, name: "Updated Category", sortOrder: 22 })
      .expect(200);

    expect(response.body.category).toMatchObject({
      id: categoryResponse.body.category.id,
      isActive: false,
      name: "Updated Category",
      slug: "original-category",
      sortOrder: 22
    });
  });

  it("patches a product including category reassignment", async () => {
    const { request } = await createAuthenticatedAdminRequest();

    const firstCategory = await request
      .post("/admin/categories")
      .send({ name: "First Category", slug: "first-category", sortOrder: 1, isActive: true })
      .expect(201);
    const secondCategory = await request
      .post("/admin/categories")
      .send({ name: "Second Category", slug: "second-category", sortOrder: 2, isActive: true })
      .expect(201);

    const productResponse = await request
      .post("/admin/products")
      .send({
        categoryId: firstCategory.body.category.id,
        isActive: true,
        name: "Original Product",
        price: 30000,
        slug: "original-product",
        sortOrder: 3
      })
      .expect(201);

    const response = await request
      .patch(`/admin/products/${productResponse.body.product.id}`)
      .send({
        categoryId: secondCategory.body.category.id,
        isActive: false,
        name: "Updated Product",
        price: 45000,
        sortOrder: 7
      })
      .expect(200);

    expect(response.body.product).toMatchObject({
      categoryId: secondCategory.body.category.id,
      id: productResponse.body.product.id,
      isActive: false,
      name: "Updated Product",
      price: 45000,
      slug: "original-product",
      sortOrder: 7
    });
  });

  it("returns 404 when patching a missing product", async () => {
    const { request } = await createAuthenticatedAdminRequest();

    await request
      .patch("/admin/products/missing-product")
      .send({ name: "Nope" })
      .expect(404);
  });
});
