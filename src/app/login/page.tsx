"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { EnvelopeIcon, LockClosedIcon } from "@heroicons/react/24/outline";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Login failed");
        setLoading(false);
        return;
      }

      // ✅ Save token and user info (localStorage or cookies)
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user.role));

      // Redirect based on role
      if (data.user.role === "admin") {
        router.push("/admin");
      } else if (data.user.role === "super_admin") {
        router.push("/superadmin");
      } else {
        router.push("/"); // Default route
      }
    } catch (err) {
      console.error(err);
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen px-4 bg-green-50/20 backdrop-blur-sm">
      <div className="bg-green-100/20 backdrop-blur-md border border-green-700/30 shadow-lg rounded-2xl p-8 sm:p-10 w-full max-w-md mx-2">
        <div className="text-center mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-green-900">
            Login
          </h1>
        </div>

        <form onSubmit={handleLogin} className="space-y-4 sm:space-y-6">
          <div className="relative">
            <EnvelopeIcon className="w-5 h-5 text-green-700 absolute left-3 top-3.5" />
            <input
              type="email"
              placeholder=""
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full pl-12 pr-4 py-3 border border-green-400 rounded-xl bg-white/50 backdrop-blur-sm text-green-900 focus:outline-none focus:ring-2 focus:ring-green-600 transition"
            />
          </div>

          <div className="relative">
            <LockClosedIcon className="w-5 h-5 text-green-700 absolute left-3 top-3.5" />
            <input
              type="password"
              placeholder=""
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full pl-12 pr-4 py-3 border border-green-400 rounded-xl bg-white/50 backdrop-blur-sm text-green-900 focus:outline-none focus:ring-2 focus:ring-green-600 transition"
            />
          </div>

          {error && (
            <p className="text-red-600 text-sm font-medium text-center">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-green-700 text-white rounded-xl font-semibold hover:bg-green-800 transition shadow-md"
          >
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>

        <div className="text-center mt-4 sm:mt-6">
          <p className="text-green-900 text-sm sm:text-base">
            Don't have an account?{" "}
            <a
              href="/signup"
              className="text-green-700 font-medium hover:underline"
            >
              Sign Up
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
