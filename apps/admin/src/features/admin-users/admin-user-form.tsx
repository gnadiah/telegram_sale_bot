"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import type { AdminRole } from "@/lib/auth";

type AdminUserFormProps = {
  onSubmit: (input: { isActive: boolean; password: string; role: AdminRole; username: string }) => Promise<void>;
};

export function AdminUserForm({ onSubmit }: AdminUserFormProps) {
  const [errorMessage, setErrorMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<AdminRole>("admin");
  const [isActive, setIsActive] = useState(true);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErrorMessage("");

    if (!username.trim() || !password) {
      setErrorMessage("Username and password are required.");
      return;
    }

    setIsSubmitting(true);

    try {
      await onSubmit({ isActive, password, role, username: username.trim() });
      setUsername("");
      setPassword("");
      setRole("admin");
      setIsActive(true);
    } catch {
      setErrorMessage("We could not create the admin account right now.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Create admin account</CardTitle>
        <CardDescription>Add a new operational account and choose its role before it signs in.</CardDescription>
      </CardHeader>
      <CardContent>
        <form className="grid gap-4 md:grid-cols-2 xl:grid-cols-4" onSubmit={handleSubmit}>
          <div className="space-y-2">
            <Label htmlFor="admin-username">Username</Label>
            <Input
              id="admin-username"
              aria-label="Username"
              disabled={isSubmitting}
              value={username}
              onChange={(event) => setUsername(event.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="admin-password">Password</Label>
            <Input
              id="admin-password"
              aria-label="Password"
              disabled={isSubmitting}
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="admin-role">Role</Label>
            <Select
              id="admin-role"
              aria-label="Role"
              disabled={isSubmitting}
              value={role}
              onChange={(event) => setRole(event.target.value as AdminRole)}
            >
              <option value="admin">Admin</option>
              <option value="super_admin">Super admin</option>
            </Select>
          </div>
          <div className="flex items-end">
            <label className="inline-flex items-center gap-3 rounded-xl border border-border bg-slate-50 px-4 py-3">
              <Switch
                aria-label="Active"
                checked={isActive}
                disabled={isSubmitting}
                onCheckedChange={setIsActive}
              />
              <span className="text-sm font-medium text-slate-700">Active</span>
            </label>
          </div>
          {errorMessage ? (
            <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700 md:col-span-2 xl:col-span-4">
              {errorMessage}
            </div>
          ) : null}
          <div className="md:col-span-2 xl:col-span-4">
            <Button disabled={isSubmitting} type="submit">
              {isSubmitting ? "Creating..." : "Create Admin"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
