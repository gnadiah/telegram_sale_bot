export type LoginPayload = {
  password: string;
  username: string;
};

export type AdminRole = "admin" | "super_admin";

export type AuthenticatedAdminUser = {
  id: string;
  role: AdminRole;
  username: string;
};

export type AuthSuccessPayload = {
  accessToken: string;
  expiresIn: number;
  user: AuthenticatedAdminUser;
};
