import { Controller, Get, Req } from "@tsed/common";
import type { Request } from "express";
import { requireAdminRequest } from "../auth/admin-auth.guard";
import { getOrderDetail, listOrdersForAdmin } from "./order.service";
import { getSingleParam } from "../shared/http";

@Controller("/admin/orders")
export class AdminOrdersController {
  @Get("/")
  async list(@Req() request: Request) {
    await requireAdminRequest(request);

    return listOrdersForAdmin();
  }

  @Get("/:id")
  async detail(@Req() request: Request) {
    await requireAdminRequest(request);

    return getOrderDetail(getSingleParam(request.params.id, "id"));
  }
}
