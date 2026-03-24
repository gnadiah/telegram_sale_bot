"use client";

import { useState } from "react";
import type { LoginPayload } from "../../lib/auth";

type LoginFormProps = {
  onSubmit: (input: LoginPayload) => Promise<void>;
};

export function LoginForm({ onSubmit }: LoginFormProps) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErrorMessage("");

    try {
      await onSubmit({ password, username });
    } catch {
      setErrorMessage("Dang nhap that bai");
    }
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
      <button type="submit">Dang nhap</button>
      {errorMessage ? <p>{errorMessage}</p> : null}
    </form>
  );
}
