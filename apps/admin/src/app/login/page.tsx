"use client";

import { useRouter } from "next/navigation";
import { LoginForm } from "../../features/auth/login-form";
import { loginAdmin } from "../../lib/api";

export default function LoginPage() {
  const router = useRouter();

  return (
    <LoginForm
      onSubmit={async (input) => {
        await loginAdmin(input);
        router.push("/categories");
      }}
    />
  );
}
