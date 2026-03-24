import { Controller, Get, Patch, Post, Req, Res } from "@tsed/common";
import type { Request, Response } from "express";
import { requireAdminRequest } from "../auth/admin-auth.guard";
import { createProduct, listProductsForAdmin, updateProduct } from "./catalog.service";
import { importInventory } from "../inventory/inventory-import.service";
import { getStockSummary } from "../inventory/stock-summary.service";
import { getSingleParam } from "../shared/http";

type CreateProductRequest = {
  categoryId: string;
  isActive: boolean;
  name: string;
  price: number;
  slug: string;
  sortOrder: number;
};

@Controller("/admin/products")
export class AdminProductsController {
  @Get("/")
  async list(@Req() request: Request) {
    await requireAdminRequest(request);

    return listProductsForAdmin();
  }

  @Post("/")
  async create(@Req() request: Request, @Res() response: Response) {
    await requireAdminRequest(request);

    const payload = request.body as CreateProductRequest;
    const product = await createProduct(payload);

    response.status(201);

    return {
      product
    };
  }

  @Patch("/:id")
  async patch(@Req() request: Request) {
    await requireAdminRequest(request);

    const product = await updateProduct(
      getSingleParam(request.params.id, "id"),
      request.body as Partial<CreateProductRequest>
    );

    return {
      product
    };
  }

  @Post("/:id/import-text")
  async importText(@Req() request: Request) {
    await requireAdminRequest(request);

    const importBatch = await importInventory({
      productId: getSingleParam(request.params.id, "id"),
      sourceType: "paste",
      text: (request.body as { text: string }).text
    });

    return {
      importBatch
    };
  }

  @Post("/:id/import-txt")
  async importTxt(@Req() request: Request) {
    await requireAdminRequest(request);

    const body = request.body as { filename?: string; text: string };
    const importBatch = await importInventory({
      originalFilename: body.filename,
      productId: getSingleParam(request.params.id, "id"),
      sourceType: "txt_upload",
      text: body.text
    });

    return {
      importBatch
    };
  }

  @Get("/:id/stock-summary")
  async stockSummary(@Req() request: Request) {
    await requireAdminRequest(request);

    return getStockSummary(getSingleParam(request.params.id, "id"));
  }
}
