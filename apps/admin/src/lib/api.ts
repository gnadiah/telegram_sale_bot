import { authStore } from "./auth-store";
import type { AdminRole, AuthSuccessPayload } from "./auth";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8080";

type CategoryInput = {
  isActive: boolean;
  name: string;
  slug: string;
  sortOrder: number;
};

type ProductInput = {
  categoryId: string;
  isActive: boolean;
  name: string;
  price: number;
  slug: string;
  sortOrder: number;
};

type AdminUserInput = {
  isActive: boolean;
  password: string;
  role: AdminRole;
  username: string;
};

async function fetchJson<T>(
  path: string,
  init: RequestInit & {
    authenticated?: boolean;
    retryOnUnauthorized?: boolean;
  } = {}
): Promise<T> {
  const { authenticated = true, retryOnUnauthorized = true, ...requestInit } = init;
  const headers = new Headers(requestInit.headers);
  const accessToken = authenticated ? authStore.getAccessToken() : null;

  if (authenticated && accessToken) {
    headers.set("Authorization", `Bearer ${accessToken}`);
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...requestInit,
    credentials: "include",
    headers
  });

  if (response.status === 401 && authenticated && retryOnUnauthorized) {
    const restoredSession = await restoreAdminSession().catch(() => null);

    if (!restoredSession) {
      throw new Error("AUTH_REQUIRED");
    }

    return fetchJson<T>(path, {
      ...init,
      retryOnUnauthorized: false
    });
  }

  if (!response.ok) {
    throw new Error(`REQUEST_FAILED:${response.status}`);
  }

  return response.json() as Promise<T>;
}

export async function getAdminSession() {
  const response = await fetchJson<{ user: { id: string; role: AdminRole; username: string } }>("/admin/auth/me");
  authStore.setCurrentUser(response.user);

  return response;
}

export async function loginAdmin(input: { password: string; username: string }) {
  const response = await fetchJson<AuthSuccessPayload>("/admin/auth/login", {
    authenticated: false,
    body: JSON.stringify(input),
    headers: {
      "Content-Type": "application/json"
    },
    method: "POST"
  });

  authStore.setSession({
    accessToken: response.accessToken,
    user: response.user
  });

  return response;
}

export async function restoreAdminSession() {
  const response = await fetchJson<AuthSuccessPayload>("/admin/auth/refresh", {
    authenticated: false,
    method: "POST",
    retryOnUnauthorized: false
  });

  authStore.setSession({
    accessToken: response.accessToken,
    user: response.user
  });

  return response;
}

export async function logoutAdmin() {
  await fetchJson<{ ok: true }>("/admin/auth/logout", {
    authenticated: false,
    method: "POST",
    retryOnUnauthorized: false
  });
  authStore.clear();
}

export async function logoutAllAdminSessions() {
  await fetchJson<{ ok: true }>("/admin/auth/logout-all", {
    method: "POST"
  });
  authStore.clear();
}

export async function getCategories() {
  return fetchJson<
    Array<{ id: string; isActive: boolean; name: string; slug: string; sortOrder: number }>
  >("/admin/categories");
}

export async function createCategory(input: {
  isActive: boolean;
  name: string;
  slug: string;
  sortOrder: number;
}) {
  return fetchJson<{
    category: { id: string; isActive: boolean; name: string; slug: string; sortOrder: number };
  }>("/admin/categories", {
    body: JSON.stringify(input),
    headers: {
      "Content-Type": "application/json"
    },
    method: "POST"
  });
}

export async function updateCategory(categoryId: string, input: Partial<CategoryInput>) {
  return fetchJson<{
    category: { id: string; isActive: boolean; name: string; slug: string; sortOrder: number };
  }>(`/admin/categories/${categoryId}`, {
    body: JSON.stringify(input),
    headers: {
      "Content-Type": "application/json"
    },
    method: "PATCH"
  });
}

export async function getProducts() {
  return fetchJson<
    Array<{
      availableStock: number;
      categoryId: string;
      id: string;
      isActive: boolean;
      name: string;
      price: number;
      slug: string;
      sortOrder: number;
    }>
  >("/admin/products");
}

export async function createProduct(input: ProductInput) {
  return fetchJson<{
    product: {
      categoryId: string;
      id: string;
      isActive: boolean;
      name: string;
      price: number;
      slug: string;
      sortOrder: number;
    };
  }>("/admin/products", {
    body: JSON.stringify(input),
    headers: {
      "Content-Type": "application/json"
    },
    method: "POST"
  });
}

export async function updateProduct(productId: string, input: Partial<ProductInput>) {
  return fetchJson<{
    product: {
      categoryId: string;
      id: string;
      isActive: boolean;
      name: string;
      price: number;
      slug: string;
      sortOrder: number;
    };
  }>(`/admin/products/${productId}`, {
    body: JSON.stringify(input),
    headers: {
      "Content-Type": "application/json"
    },
    method: "PATCH"
  });
}

export async function getOrders() {
  return fetchJson<
    Array<{
      id: string;
      quantity: number;
      telegramUsername?: string;
      totalPriceSnapshot: number;
    }>
  >("/admin/orders");
}

export async function getOrderDetail(orderId: string) {
  return fetchJson<{
    id: string;
    items: string[];
    quantity: number;
    telegramUsername?: string;
    totalPriceSnapshot: number;
  }>(`/admin/orders/${orderId}`);
}

export async function importInventoryText(input: { productId: string; text: string }) {
  return fetchJson<{
    importBatch: {
      id: string;
      originalFilename?: string | null;
      totalAccepted: number;
      totalReceived: number;
    };
  }>(`/admin/products/${input.productId}/import-text`, {
    body: JSON.stringify({ text: input.text }),
    headers: {
      "Content-Type": "application/json"
    },
    method: "POST"
  });
}

export async function importInventoryFile(input: { filename: string; productId: string; text: string }) {
  return fetchJson<{
    importBatch: {
      id: string;
      originalFilename?: string | null;
      totalAccepted: number;
      totalReceived: number;
    };
  }>(`/admin/products/${input.productId}/import-txt`, {
    body: JSON.stringify({ filename: input.filename, text: input.text }),
    headers: {
      "Content-Type": "application/json"
    },
    method: "POST"
  });
}

export async function getAdminUsers() {
  return fetchJson<
    Array<{ createdAt?: string; id: string; isActive: boolean; role: AdminRole; updatedAt?: string; username: string }>
  >("/admin/admin-users");
}

export async function createAdminUser(input: AdminUserInput) {
  return fetchJson<{
    user: { id: string; isActive: boolean; role: AdminRole; username: string };
  }>("/admin/admin-users", {
    body: JSON.stringify(input),
    headers: {
      "Content-Type": "application/json"
    },
    method: "POST"
  });
}

export async function updateAdminUser(
  adminUserId: string,
  input: Partial<Pick<AdminUserInput, "isActive" | "password" | "role">>
) {
  return fetchJson<{
    user: { id: string; isActive: boolean; role: AdminRole; username: string };
  }>(`/admin/admin-users/${adminUserId}`, {
    body: JSON.stringify(input),
    headers: {
      "Content-Type": "application/json"
    },
    method: "PATCH"
  });
}
