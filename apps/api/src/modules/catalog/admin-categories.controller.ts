import { Controller, Get, Patch, Post, Req, Res } from "@tsed/common";
import type { Request, Response } from "express";
import { requireAdminRequest } from "../auth/admin-auth.guard";
import { createCategory, listCategoriesForAdmin, updateCategory } from "./catalog.service";
import { getSingleParam } from "../shared/http";

type CreateCategoryRequest = {
  isActive: boolean;
  name: string;
  slug: string;
  sortOrder: number;
};

@Controller("/admin/categories")
export class AdminCategoriesController {
  @Get("/")
  async list(@Req() request: Request) {
    await requireAdminRequest(request);

    return listCategoriesForAdmin();
  }

  @Post("/")
  async create(@Req() request: Request, @Res() response: Response) {
    await requireAdminRequest(request);

    const payload = request.body as CreateCategoryRequest;
    const category = await createCategory(payload);

    response.status(201);

    return {
      category
    };
  }

  @Patch("/:id")
  async patch(@Req() request: Request) {
    await requireAdminRequest(request);

    const category = await updateCategory(
      getSingleParam(request.params.id, "id"),
      request.body as Partial<CreateCategoryRequest>
    );

    return {
      category
    };
  }
}
