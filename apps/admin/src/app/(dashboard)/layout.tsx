"use client";

import { LayoutGrid, LogOut, Menu, Package, ReceiptText, Shield, Tags } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { type ReactNode, useEffect, useMemo, useState } from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogClose,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Sheet, SheetContent, SheetDescription, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/components/ui/toast";
import type { AuthenticatedAdminUser } from "@/lib/auth";
import { authStore } from "@/lib/auth-store";
import { getAdminSession, logoutAdmin, logoutAllAdminSessions, restoreAdminSession } from "@/lib/api";
import { cn } from "@/lib/utils";

type NavItem = {
  href: string;
  icon: typeof LayoutGrid;
  label: string;
  requiresSuperAdmin?: boolean;
};

const navItems: NavItem[] = [
  { href: "/categories", icon: Tags, label: "Categories" },
  { href: "/products", icon: Package, label: "Products" },
  { href: "/orders", icon: ReceiptText, label: "Orders" },
  { href: "/admins", icon: Shield, label: "Admins", requiresSuperAdmin: true }
];

export default function DashboardLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { toast } = useToast();
  const [currentUser, setCurrentUser] = useState<AuthenticatedAdminUser | null>(null);
  const [actionError, setActionError] = useState("");
  const [isReady, setIsReady] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [isLoggingOutAll, setIsLoggingOutAll] = useState(false);
  const [isLogoutAllDialogOpen, setIsLogoutAllDialogOpen] = useState(false);
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);

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

  const visibleNavItems = useMemo(
    () => navItems.filter((item) => !item.requiresSuperAdmin || currentUser?.role === "super_admin"),
    [currentUser?.role]
  );

  if (!isReady) {
    return (
      <main className="grid min-h-screen bg-slate-100 p-4 lg:grid-cols-[260px_minmax(0,1fr)] lg:p-6">
        <aside className="hidden rounded-3xl border border-border bg-white p-6 shadow-soft lg:block">
          <Skeleton className="mb-6 h-8 w-32" />
          <div className="space-y-3">
            <Skeleton className="h-11 w-full" />
            <Skeleton className="h-11 w-full" />
            <Skeleton className="h-11 w-full" />
          </div>
        </aside>
        <section className="space-y-4 lg:pl-6">
          <Skeleton className="h-16 w-full rounded-3xl" />
          <Skeleton className="h-[60vh] w-full rounded-3xl" />
        </section>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-100">
      <div className="mx-auto grid min-h-screen max-w-[1600px] lg:grid-cols-[260px_minmax(0,1fr)] lg:p-6">
        <aside className="hidden rounded-3xl border border-border bg-white px-5 py-6 shadow-soft lg:flex lg:flex-col">
          <SidebarContent currentUser={currentUser} navItems={visibleNavItems} pathname={pathname} />
        </aside>
        <section className="flex min-h-screen flex-col lg:pl-6">
          <header className="sticky top-0 z-20 border-b border-border/70 bg-slate-100/90 px-4 py-4 backdrop-blur lg:px-0">
            <div className="space-y-3 rounded-3xl border border-border bg-white px-4 py-3 shadow-soft lg:px-6">
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="lg:hidden">
                    <Sheet open={isMobileNavOpen} onOpenChange={setIsMobileNavOpen}>
                      <SheetTrigger asChild>
                        <Button variant="outline" size="icon" aria-label="Open navigation">
                          <Menu className="h-4 w-4" />
                        </Button>
                      </SheetTrigger>
                      <SheetContent aria-describedby="mobile-navigation-description">
                        <SheetTitle>Admin navigation</SheetTitle>
                        <SheetDescription id="mobile-navigation-description">
                          Move between categories, products, orders, and admin tools.
                        </SheetDescription>
                        <div className="mt-6">
                          <SidebarContent
                            currentUser={currentUser}
                            navItems={visibleNavItems}
                            pathname={pathname}
                            onNavigate={() => setIsMobileNavOpen(false)}
                          />
                        </div>
                      </SheetContent>
                    </Sheet>
                  </div>
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Admin console</p>
                    <h1 className="text-lg font-semibold text-slate-950">{resolvePageTitle(pathname)}</h1>
                  </div>
                </div>
                <div className="flex flex-wrap items-center justify-end gap-2">
                  <Badge variant={currentUser?.role === "super_admin" ? "default" : "outline"}>
                    {currentUser?.role === "super_admin" ? "Super admin" : "Admin"}
                  </Badge>
                  <span className="hidden text-sm text-slate-600 sm:inline">{currentUser?.username}</span>
                  <Button
                    variant="outline"
                    disabled={isLoggingOut || isLoggingOutAll}
                    onClick={() => {
                      void (async () => {
                        setActionError("");
                        setIsLoggingOut(true);
                        try {
                          await logoutAdmin();
                          toast({
                            title: "Logged out",
                            variant: "success"
                          });
                          router.replace("/login");
                        } catch {
                          setActionError("We could not end the current session right now. Try again.");
                          toast({
                            description: "The current admin session is still active. Please try again.",
                            title: "Logout failed",
                            variant: "error"
                          });
                        } finally {
                          setIsLoggingOut(false);
                        }
                      })();
                    }}
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    {isLoggingOut ? "Logging out..." : "Logout"}
                  </Button>
                  <Button
                    variant="ghost"
                    disabled={isLoggingOut || isLoggingOutAll}
                    onClick={() => setIsLogoutAllDialogOpen(true)}
                  >
                    Logout all sessions
                  </Button>
                </div>
              </div>
              {actionError ? (
                <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
                  {actionError}
                </div>
              ) : null}
            </div>
          </header>
          <AlertDialog open={isLogoutAllDialogOpen} onOpenChange={setIsLogoutAllDialogOpen}>
            <AlertDialogContent>
              <div className="flex items-start justify-between gap-4">
                <AlertDialogHeader className="flex-1">
                  <AlertDialogTitle>End all admin sessions?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This will revoke every active admin session for your account and return this browser to the login
                    screen.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogClose />
              </div>
              <AlertDialogFooter>
                <AlertDialogCancel disabled={isLoggingOutAll} onClick={() => setIsLogoutAllDialogOpen(false)}>
                  Cancel
                </AlertDialogCancel>
                <AlertDialogAction
                  aria-label="Confirm logout all sessions"
                  disabled={isLoggingOutAll}
                  onClick={() => {
                    void (async () => {
                      setActionError("");
                      setIsLoggingOutAll(true);
                      try {
                        await logoutAllAdminSessions();
                        toast({
                          title: "All sessions revoked",
                          variant: "success"
                        });
                        setIsLogoutAllDialogOpen(false);
                        router.replace("/login");
                      } catch {
                        setActionError("We could not revoke every session right now. Try again.");
                        toast({
                          description: "No sessions were revoked. Please try again.",
                          title: "Logout all failed",
                          variant: "error"
                        });
                      } finally {
                        setIsLoggingOutAll(false);
                      }
                    })();
                  }}
                >
                  {isLoggingOutAll ? "Processing..." : "Confirm logout all sessions"}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
          <div className="flex-1 px-4 py-6 lg:px-0">{children}</div>
        </section>
      </div>
    </main>
  );
}

function SidebarContent({
  currentUser,
  navItems,
  onNavigate,
  pathname
}: {
  currentUser: AuthenticatedAdminUser | null;
  navItems: NavItem[];
  onNavigate?: () => void;
  pathname: string;
}) {
  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center gap-3 px-2">
        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-blue-600 text-white shadow-soft">
          <LayoutGrid className="h-5 w-5" />
        </div>
        <div>
          <p className="text-sm font-semibold text-slate-950">Telegram Sale Bot</p>
          <p className="text-xs text-slate-500">Operations dashboard</p>
        </div>
      </div>
      <Separator className="my-6" />
      <nav className="space-y-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);

          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onNavigate}
              className={cn(
                "flex items-center gap-3 rounded-2xl px-3 py-3 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-100 hover:text-slate-950",
                isActive && "bg-slate-900 text-white hover:bg-slate-900 hover:text-white"
              )}
            >
              <Icon className="h-4 w-4" />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>
      <div className="mt-auto rounded-2xl border border-border bg-slate-50 p-4">
        <p className="text-sm font-medium text-slate-900">{currentUser?.username}</p>
        <p className="text-xs text-slate-500">
          {currentUser?.role === "super_admin" ? "Full access to admin tools" : "Catalog and order operations"}
        </p>
      </div>
    </div>
  );
}

function resolvePageTitle(pathname: string) {
  if (pathname.startsWith("/products")) {
    return "Products";
  }

  if (pathname.startsWith("/orders")) {
    return pathname === "/orders" ? "Orders" : "Order detail";
  }

  if (pathname.startsWith("/admins")) {
    return "Admins";
  }

  return "Categories";
}
