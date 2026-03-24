import { randomUUID } from "node:crypto";
import { hash } from "bcryptjs";
import { and, asc, eq, ne } from "drizzle-orm";
import { BadRequest, Conflict, NotFound } from "@tsed/exceptions";
import { getDb } from "../../config/db";
import { adminUsers } from "../../db/schema";
import type { AdminRole } from "../auth/admin-role.guard";

type CreateAdminUserInput = {
  isActive: boolean;
  password: string;
  role: AdminRole;
  username: string;
};

type UpdateAdminUserInput = Partial<{
  isActive: boolean;
  password: string;
  role: AdminRole;
}>;

export async function listAdminUsers() {
  const db = await getDb();
  const users = await db.query.adminUsers.findMany({
    orderBy: [asc(adminUsers.createdAt)]
  });

  return users.map(sanitizeAdminUser);
}

export async function createAdminUser(input: CreateAdminUserInput) {
  validateRole(input.role);
  validatePassword(input.password);
  validateIsActive(input.isActive);

  const normalizedUsername = validateUsername(input.username);

  const db = await getDb();
  const existingUser = await db.query.adminUsers.findFirst({
    where: eq(adminUsers.username, normalizedUsername)
  });

  if (existingUser) {
    throw new Conflict("Admin user already exists");
  }

  const passwordHash = await hash(input.password, 10);
  const [user] = await db
    .insert(adminUsers)
    .values({
      id: randomUUID(),
      isActive: input.isActive,
      passwordHash,
      role: input.role,
      username: normalizedUsername
    })
    .returning();

  return sanitizeAdminUser(user);
}

export async function updateAdminUser(adminUserId: string, input: UpdateAdminUserInput) {
  if (input.role !== undefined) {
    validateRole(input.role);
  }

  if (input.password !== undefined) {
    validatePassword(input.password);
  }

  if (input.isActive !== undefined) {
    validateIsActive(input.isActive);
  }

  const db = await getDb();
  const existingUser = await db.query.adminUsers.findFirst({
    where: eq(adminUsers.id, adminUserId)
  });

  if (!existingUser) {
    throw new NotFound("Admin user not found");
  }

  await ensureSuperAdminSurvives(existingUser, input, db);

  const [user] = await db
    .update(adminUsers)
    .set({
      ...(input.isActive === undefined ? {} : { isActive: input.isActive }),
      ...(input.password === undefined ? {} : { passwordHash: await hash(input.password, 10) }),
      ...(input.role === undefined ? {} : { role: input.role }),
      updatedAt: new Date()
    })
    .where(eq(adminUsers.id, adminUserId))
    .returning();

  return sanitizeAdminUser(user);
}

function sanitizeAdminUser(user: typeof adminUsers.$inferSelect) {
  return {
    createdAt: user.createdAt,
    id: user.id,
    isActive: user.isActive,
    role: user.role,
    updatedAt: user.updatedAt,
    username: user.username
  };
}

function validateRole(role: string) {
  if (role !== "admin" && role !== "super_admin") {
    throw new BadRequest("Invalid admin role");
  }
}

function validatePassword(password: unknown) {
  if (typeof password !== "string" || password.length < 8 || password.length > 255) {
    throw new BadRequest("Password must be at least 8 characters");
  }
}

function validateUsername(username: unknown) {
  if (typeof username !== "string") {
    throw new BadRequest("Username is required");
  }

  const normalizedUsername = username.trim();

  if (!normalizedUsername || normalizedUsername.length > 255) {
    throw new BadRequest("Username is required");
  }

  return normalizedUsername;
}

function validateIsActive(isActive: unknown) {
  if (typeof isActive !== "boolean") {
    throw new BadRequest("isActive must be a boolean");
  }
}

async function ensureSuperAdminSurvives(
  existingUser: typeof adminUsers.$inferSelect,
  input: UpdateAdminUserInput,
  db: Awaited<ReturnType<typeof getDb>>
) {
  const nextRole = input.role ?? existingUser.role;
  const nextIsActive = input.isActive ?? existingUser.isActive;

  if (existingUser.role !== "super_admin" || !existingUser.isActive) {
    return;
  }

  if (nextRole === "super_admin" && nextIsActive) {
    return;
  }

  const remainingSuperAdmin = await db.query.adminUsers.findFirst({
    where: and(eq(adminUsers.role, "super_admin"), eq(adminUsers.isActive, true), ne(adminUsers.id, existingUser.id))
  });

  if (!remainingSuperAdmin) {
    throw new Conflict("At least one active super_admin is required");
  }
}
