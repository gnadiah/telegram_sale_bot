"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Shield } from "lucide-react";
import { LoginForm } from "../../features/auth/login-form";
import { authStore } from "../../lib/auth-store";
import { loginAdmin, restoreAdminSession } from "../../lib/api";

export default function LoginPage() {
  const router = useRouter();

  useEffect(() => {
    void (async () => {
      try {
        if (authStore.getAccessToken()) {
          router.replace("/categories");
          return;
        }

        await restoreAdminSession();
        router.replace("/categories");
      } catch {
        // Stay on login if no valid refresh session exists.
      }
    })();
  }, [router]);

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-100 px-4 py-12">
      <div className="grid w-full max-w-6xl gap-10 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
        <section className="hidden rounded-[2rem] bg-slate-950 p-10 text-slate-50 shadow-soft lg:block">
          <div className="mb-8 inline-flex items-center gap-3 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-slate-200">
            <Shield className="h-4 w-4" />
            Telegram Sale Bot
          </div>
          <h1 className="max-w-xl text-4xl font-semibold leading-tight">
            Clean operations for catalog, stock, orders, and admin control.
          </h1>
          <p className="mt-4 max-w-xl text-base text-slate-300">
            Sign in to a focused operations workspace for catalog management, account inventory, order audit, and
            multi-admin access control.
          </p>
          <div className="mt-10 grid gap-4 sm:grid-cols-2">
            {[
              "Manage categories and products",
              "Import stock with text or TXT",
              "Review order delivery audit",
              "Control admin sessions"
            ].map((item) => (
              <div key={item} className="rounded-2xl border border-white/10 bg-white/5 px-4 py-4 text-sm text-slate-100">
                {item}
              </div>
            ))}
          </div>
        </section>
        <div className="flex justify-center lg:justify-end">
          <LoginForm
            onSubmit={async (input) => {
              await loginAdmin(input);
              router.replace("/categories");
            }}
          />
        </div>
      </div>
    </main>
  );
}
