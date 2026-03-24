"use client";

import { useEffect, useState } from "react";
import { PageHeader } from "@/components/admin/page-header";
import { StatusPanel } from "@/components/admin/status-panel";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/components/ui/toast";
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
  const { toast } = useToast();
  const [adminUsers, setAdminUsers] = useState<AdminUser[]>([]);
  const [errorMessage, setErrorMessage] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const currentUser = getCurrentAdminUser();

  async function refresh() {
    setIsLoading(true);
    setErrorMessage("");
    try {
      setAdminUsers(await getAdminUsers());
      return true;
    } catch {
      setErrorMessage("We could not load admin accounts right now. Try again in a moment.");
      return false;
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    if (currentUser?.role !== "super_admin") {
      setIsLoading(false);
      return;
    }

    void refresh();
  }, [currentUser?.role]);

  async function retryRefresh() {
    const didLoad = await refresh();

    if (didLoad) {
      toast({
        description: "Admin account data has been refreshed.",
        title: "Admins loaded",
        variant: "success"
      });
      return;
    }

    toast({
      description: "We still could not load admin accounts. Please try again.",
      title: "Retry failed",
      variant: "error"
    });
  }

  if (currentUser?.role !== "super_admin") {
    return (
      <StatusPanel
        tone="error"
        title="Access restricted"
        description="Only super admins can manage operational accounts and role assignments."
      />
    );
  }

  return (
    <section className="space-y-6">
      <PageHeader
        title="Admins"
        description="Create operational accounts, promote super admins, and control access status for each user."
      />
      <AdminUserForm
        onSubmit={async (input) => {
          try {
            await createAdminUser(input);
            toast({
              description: "The new admin account can now sign in with the assigned role.",
              title: "Admin created",
              variant: "success"
            });
            await refresh();
          } catch {
            toast({
              description: "The admin account was not created. Please try again.",
              title: "Create admin failed",
              variant: "error"
            });
            throw new Error("CREATE_ADMIN_FAILED");
          }
        }}
      />
      {isLoading ? (
        <div className="space-y-4 rounded-2xl border border-border bg-white p-6 shadow-soft">
          <Skeleton className="h-6 w-40" />
          <Skeleton className="h-14 w-full" />
          <Skeleton className="h-14 w-full" />
        </div>
      ) : errorMessage ? (
        <StatusPanel
          tone="error"
          title="Admin accounts are temporarily unavailable"
          description={errorMessage}
          actionLabel="Retry"
          onAction={() => {
            void retryRefresh();
          }}
        />
      ) : (
        <AdminUserTable
          adminUsers={adminUsers}
          currentUserRole={currentUser.role}
          onUpdate={async (adminUserId, input) => {
            try {
              await updateAdminUser(adminUserId, input);
              toast({
                description: "Role and account status changes have been saved.",
                title: "Admin updated",
                variant: "success"
              });
              await refresh();
            } catch {
              toast({
                description: "The admin account changes were not saved. Please try again.",
                title: "Update admin failed",
                variant: "error"
              });
              throw new Error("UPDATE_ADMIN_FAILED");
            }
          }}
        />
      )}
    </section>
  );
}
