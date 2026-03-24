"use client";

import { useEffect, useState } from "react";
import { AdminUserForm } from "../../../features/admin-users/admin-user-form";
import { AdminUserTable } from "../../../features/admin-users/admin-user-table";
import { getCurrentAdminUser } from "../../../lib/auth-store";
import { createAdminUser, getAdminUsers, updateAdminUser } from "../../../lib/api";

type AdminUser = {
  id: string;
  isActive: boolean;
  role: "admin" | "super_admin";
  username: string;
};

export default function AdminsPage() {
  const [adminUsers, setAdminUsers] = useState<AdminUser[]>([]);
  const currentUser = getCurrentAdminUser();

  async function refresh() {
    setAdminUsers(await getAdminUsers());
  }

  useEffect(() => {
    void refresh();
  }, []);

  if (currentUser?.role !== "super_admin") {
    return <p>Khong co quyen truy cap</p>;
  }

  return (
    <section>
      <AdminUserForm
        onSubmit={async (input) => {
          await createAdminUser(input);
          await refresh();
        }}
      />
      <AdminUserTable
        adminUsers={adminUsers}
        currentUserRole={currentUser.role}
        onUpdate={async (adminUserId, input) => {
          await updateAdminUser(adminUserId, input);
          await refresh();
        }}
      />
    </section>
  );
}
