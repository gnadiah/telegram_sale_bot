import { Controller, Get, Post, Req, Res } from "@tsed/common";
import type { Request, Response } from "express";
import { requireBotRequest } from "../bot/bot-auth.guard";
import { getSingleParam } from "../shared/http";
import { getDeliveryFile } from "./delivery-file.service";
import { createOrder } from "./order.service";

@Controller("/bot/orders")
export class BotOrdersController {
  @Post("/")
  async create(@Req() request: Request, @Res() response: Response) {
    requireBotRequest(request);

    const orderResult = await createOrder(request.body as Parameters<typeof createOrder>[0]);
    response.status(201);

    return orderResult;
  }

  @Get("/:id/delivery-file")
  async deliveryFile(@Req() request: Request, @Res() response: Response) {
    requireBotRequest(request);

    const { content, delivery } = await getDeliveryFile(getSingleParam(request.params.id, "id"));
    response.type("text/plain");
    response.setHeader("Content-Disposition", `attachment; filename=\"${delivery.filename}\"`);

    return content;
  }
}
