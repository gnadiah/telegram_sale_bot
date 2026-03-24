import { Controller, Get, Req } from "@tsed/common";
import type { Request } from "express";
import { listActiveCategories, listActiveProductsByCategory } from "../catalog/catalog.service";
import { getSingleParam } from "../shared/http";
import { requireBotRequest } from "./bot-auth.guard";

@Controller("/bot")
export class BotCatalogController {
  @Get("/categories")
  async categories(@Req() request: Request) {
    requireBotRequest(request);

    return listActiveCategories();
  }

  @Get("/categories/:id/products")
  async products(@Req() request: Request) {
    requireBotRequest(request);

    return listActiveProductsByCategory(getSingleParam(request.params.id, "id"));
  }
}
