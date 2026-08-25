"use client";

import { useState } from "react";
import { useAuth } from "@/contexts/auth-context";
import { fetchClient } from "@/lib/api-client";
import { Button } from "@/components/ui/button";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const { login } = useAuth();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const data = await fetchClient("/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({
          username: email,
          password: password,
        }),
      });

      // Fetch user profile
      const user = await fetchClient("/auth/me", {
        headers: { Authorization: `Bearer ${data.access_token}` },
      });

      login(data.access_token, user);
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message || "Failed to login");
      } else {
        setError("Failed to login");
      }
    }
  };

  return (
    <div className="flex h-screen items-center justify-center bg-gray-50">
      <form onSubmit={handleLogin} className="flex flex-col gap-4 bg-white p-8 rounded-md shadow-md w-96">
        <h1 className="text-2xl font-semibold mb-4">Login</h1>
        {error && <div className="text-red-500 text-sm">{error}</div>}
        <input
          type="email"
          placeholder="Email"
          className="border p-2 rounded"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Password"
          className="border p-2 rounded"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <Button type="submit">Login</Button>
      </form>
    </div>
  );
}
