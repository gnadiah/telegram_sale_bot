"use client";

import { useState } from "react";
import type { AdminRole } from "../../lib/auth";

type AdminUserFormProps = {
  onSubmit: (input: { isActive: boolean; password: string; role: AdminRole; username: string }) => Promise<void>;
};

export function AdminUserForm({ onSubmit }: AdminUserFormProps) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<AdminRole>("admin");
  const [isActive, setIsActive] = useState(true);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    await onSubmit({ isActive, password, role, username });
    setUsername("");
    setPassword("");
    setRole("admin");
    setIsActive(true);
  }

  return (
    <form onSubmit={handleSubmit}>
      <label>
        Username
        <input aria-label="Username" value={username} onChange={(event) => setUsername(event.target.value)} />
      </label>
      <label>
        Password
        <input
          aria-label="Password"
          type="password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
        />
      </label>
      <label>
        Role
        <select aria-label="Role" value={role} onChange={(event) => setRole(event.target.value as AdminRole)}>
          <option value="admin">admin</option>
          <option value="super_admin">super_admin</option>
        </select>
      </label>
      <label>
        Active
        <input
          aria-label="Active"
          checked={isActive}
          type="checkbox"
          onChange={(event) => setIsActive(event.target.checked)}
        />
      </label>
      <button type="submit">Create Admin</button>
    </form>
  );
}
