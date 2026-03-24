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
      const response = await fetch(`${env.apiBaseUrl}/bot/orders`, {
        body: JSON.stringify(input),
        headers,
        method: "POST"
      });

      if (!response.ok) {
        throw new Error(`BOT_ORDER_FAILED:${response.status}`);
      }

      return response.json();
    },
    async getCategories(): Promise<BotCategory[]> {
      const response = await fetch(`${env.apiBaseUrl}/bot/categories`, { headers });

      if (!response.ok) {
        throw new Error(`BOT_CATEGORIES_FAILED:${response.status}`);
      }

      return response.json();
    },
    async getDeliveryFile(orderId: string): Promise<{ buffer: Buffer; filename: string }> {
      const response = await fetch(`${env.apiBaseUrl}/bot/orders/${orderId}/delivery-file`, { headers });

      if (!response.ok) {
        throw new Error(`BOT_DELIVERY_FAILED:${response.status}`);
      }

      const contentDisposition = response.headers.get("content-disposition");
      const filenameMatch = contentDisposition?.match(/filename=\"?([^"]+)\"?/);

      return {
        buffer: Buffer.from(await response.arrayBuffer()),
        filename: filenameMatch?.[1] ?? `${orderId}.txt`
      };
    },
    async getProducts(categoryId: string): Promise<BotProduct[]> {
      const response = await fetch(`${env.apiBaseUrl}/bot/categories/${categoryId}/products`, { headers });

      if (!response.ok) {
        throw new Error(`BOT_PRODUCTS_FAILED:${response.status}`);
      }

      return response.json();
    }
  };
}
