"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { type ReactNode, useEffect, useState } from "react";
import type { AuthenticatedAdminUser } from "../../lib/auth";
import { authStore } from "../../lib/auth-store";
import { getAdminSession, logoutAdmin, logoutAllAdminSessions, restoreAdminSession } from "../../lib/api";

export default function DashboardLayout({ children }: { children: ReactNode }) {
  const router = useRouter();
  const [isReady, setIsReady] = useState(false);
  const [currentUser, setCurrentUser] = useState<AuthenticatedAdminUser | null>(null);

  useEffect(() => {
    void (async () => {
      try {
        const session = authStore.getAccessToken() ? await getAdminSession() : await restoreAdminSession();
        setCurrentUser(session.user);
        setIsReady(true);
      } catch {
        authStore.clear();
        router.replace("/login");
      }
    })();
  }, [router]);

  if (!isReady) {
    return <main>Checking session...</main>;
  }

  return (
    <main>
      <nav>
        <Link href="/categories">Categories</Link>
        {" | "}
        <Link href="/products">Products</Link>
        {" | "}
        <Link href="/orders">Orders</Link>
        {currentUser?.role === "super_admin" ? (
          <>
            {" | "}
            <Link href="/admins">Admins</Link>
          </>
        ) : null}
        {" | "}
        <button
          type="button"
          onClick={() => {
            void logoutAdmin().finally(() => {
              router.replace("/login");
            });
          }}
        >
          Logout
        </button>
        {" | "}
        <button
          type="button"
          onClick={() => {
            void logoutAllAdminSessions().finally(() => {
              router.replace("/login");
            });
          }}
        >
          Logout all sessions
        </button>
      </nav>
      {children}
    </main>
  );
}
