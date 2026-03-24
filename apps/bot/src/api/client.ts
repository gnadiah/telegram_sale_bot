import type { BotEnv } from "../config/env";

export type BotCategory = {
  id: string;
  name: string;
};

export type BotProduct = {
  id: string;
  name: string;
  price: number;
  stock: number;
};

export type CreateOrderInput = {
  productId: string;
  quantity: number;
  telegramUserId: string;
  telegramUsername?: string;
};

export function createApiClient(env: BotEnv) {
  const headers = {
    "Content-Type": "application/json",
    "x-bot-token": env.botApiToken
  };

  return {
    async createOrder(input: CreateOrderInput): Promise<{ order: { id: string } }> {
      return fetchBotJson(env.apiBaseUrl, "POST", "/bot/orders", {
        body: JSON.stringify(input),
        headers
      });
    },
    async getCategories(): Promise<BotCategory[]> {
      return fetchBotJson(env.apiBaseUrl, "GET", "/bot/categories", { headers });
    },
    async getDeliveryFile(orderId: string): Promise<{ buffer: Buffer; filename: string }> {
      const endpoint = `/bot/orders/${orderId}/delivery-file`;
      const response = await fetchWithContext(env.apiBaseUrl, "GET", endpoint, { headers }, "BOT_DELIVERY_FAILED");

      const contentDisposition = response.headers.get("content-disposition");
      const filenameMatch = contentDisposition?.match(/filename=\"?([^"]+)\"?/);

      return {
        buffer: Buffer.from(await response.arrayBuffer()),
        filename: filenameMatch?.[1] ?? `${orderId}.txt`
      };
    },
    async getProducts(categoryId: string): Promise<BotProduct[]> {
      return fetchBotJson(env.apiBaseUrl, "GET", `/bot/categories/${categoryId}/products`, { headers });
    }
  };
}

async function fetchBotJson<T>(
  apiBaseUrl: string,
  method: "GET" | "POST",
  endpoint: string,
  init: RequestInit
): Promise<T> {
  const response = await fetchWithContext(apiBaseUrl, method, endpoint, init, errorCodeFor(endpoint));

  return response.json() as Promise<T>;
}

async function fetchWithContext(
  apiBaseUrl: string,
  method: "GET" | "POST",
  endpoint: string,
  init: RequestInit,
  errorCode: string
) {
  let response: Response;

  try {
    response = await fetch(`${apiBaseUrl}${endpoint}`, {
      ...init,
      method
    });
  } catch (error) {
    throw new Error(
      `${errorCode} ${method} ${endpoint} -> network error: ${error instanceof Error ? error.message : String(error)}`
    );
  }

  if (!response.ok) {
    const details = await readResponseDetails(response);
    throw new Error(`${errorCode} ${method} ${endpoint} -> ${response.status} ${details}`);
  }

  return response;
}

async function readResponseDetails(response: Response) {
  try {
    const body = await response.text();
    return body || "<empty body>";
  } catch {
    return "<unreadable body>";
  }
}

function errorCodeFor(endpoint: string) {
  if (endpoint === "/bot/categories") {
    return "BOT_CATEGORIES_FAILED";
  }

  if (endpoint.startsWith("/bot/categories/")) {
    return "BOT_PRODUCTS_FAILED";
  }

  if (endpoint === "/bot/orders") {
    return "BOT_ORDER_FAILED";
  }

  return "BOT_API_FAILED";
}
