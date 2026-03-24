import { Controller, Get, Patch, Post, Req, Res } from "@tsed/common";
import type { Request, Response } from "express";
import { requireSuperAdminRequest, type AdminRole } from "../auth/admin-role.guard";
import { getSingleParam } from "../shared/http";
import { createAdminUser, listAdminUsers, updateAdminUser } from "./admin-users.service";

type CreateAdminUserRequest = {
  isActive: boolean;
  password: string;
  role: AdminRole;
  username: string;
};

type PatchAdminUserRequest = Partial<{
  isActive: boolean;
  password: string;
  role: AdminRole;
}>;

@Controller("/admin/admin-users")
export class AdminUsersController {
  @Get("/")
  async list(@Req() request: Request) {
    await requireSuperAdminRequest(request);

    return listAdminUsers();
  }

  @Post("/")
  async create(@Req() request: Request, @Res() response: Response) {
    await requireSuperAdminRequest(request);

    const user = await createAdminUser(request.body as CreateAdminUserRequest);

    response.status(201);

    return {
      user
    };
  }

  @Patch("/:id")
  async patch(@Req() request: Request) {
    await requireSuperAdminRequest(request);

    const user = await updateAdminUser(
      getSingleParam(request.params.id, "id"),
      request.body as PatchAdminUserRequest
    );

    return {
      user
    };
  }
}
