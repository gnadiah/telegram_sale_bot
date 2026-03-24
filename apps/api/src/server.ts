import "@tsed/platform-express";
import cookieParser from "cookie-parser";
import express from "express";
import { Configuration, Injectable } from "@tsed/di";
import { initializeDatabase } from "./config/db";
import { ensureDefaultAdminUser } from "./modules/auth/admin-auth.service";
import { HealthController } from "./modules/health/health.controller";
import { AdminAuthController } from "./modules/auth/admin-auth.controller";
import { AdminUsersController } from "./modules/admin-users/admin-users.controller";
import { AdminCategoriesController } from "./modules/catalog/admin-categories.controller";
import { AdminProductsController } from "./modules/catalog/admin-products.controller";
import { BotCatalogController } from "./modules/bot/bot-catalog.controller";
import { BotOrdersController } from "./modules/orders/bot-orders.controller";
import { AdminOrdersController } from "./modules/orders/admin-orders.controller";

@Configuration({
  acceptMimes: ["application/json"],
  httpPort: process.env.PORT ? Number(process.env.PORT) : 8080,
  middlewares: [
    express.json(),
    express.urlencoded({ extended: true }),
    cookieParser()
  ],
  mount: {
    "/": [
      HealthController,
      AdminAuthController,
      AdminUsersController,
      AdminCategoriesController,
      AdminProductsController,
      AdminOrdersController,
      BotCatalogController,
      BotOrdersController
    ]
  },
  logger: {
    level: "off"
  }
})
@Injectable()
export class Server {
  async $onInit() {
    await initializeDatabase();
    await ensureDefaultAdminUser();
  }
}
