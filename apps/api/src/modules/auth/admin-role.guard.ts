import { Forbidden } from "@tsed/exceptions";
import type { Request } from "express";
import { requireAdminRequest } from "./admin-auth.guard";

export const ADMIN_ROLES = ["admin", "super_admin"] as const;

export type AdminRole = (typeof ADMIN_ROLES)[number];

export async function requireAdminRole(request: Request, allowedRoles: AdminRole[]) {
  const adminRequest = await requireAdminRequest(request);

  if (!allowedRoles.includes(adminRequest.user.role as AdminRole)) {
    throw new Forbidden("Forbidden");
  }

  return adminRequest;
}

export async function requireSuperAdminRequest(request: Request) {
  return requireAdminRole(request, ["super_admin"]);
}
