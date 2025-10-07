"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { EnvelopeIcon, LockClosedIcon } from "@heroicons/react/24/outline";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Login", { email, password });
    router.push("/"); // redirect to home after login
  };

  return (
    <div className=" flex items-center justify-center  px-4">
      <div className="bg-white shadow-lg rounded-2xl p-10 w-full max-w-md">
        {/* Logo / Branding */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-indigo-600">BookIndoor</h1>
        </div>

        <form onSubmit={handleLogin} className="space-y-6">
          {/* Email Input */}
          <div className="relative">
            <EnvelopeIcon className="w-5 h-5 text-gray-400 absolute left-3 top-3.5" />
            <input
              type="email"
              
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 transition text-gray-800"
            />
          </div>

          {/* Password Input */}
          <div className="relative">
            <LockClosedIcon className="w-5 h-5 text-gray-400 absolute left-3 top-3.5" />
            <input
              type="password"
              
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 transition text-gray-800"
            />
          </div>

          {/* Login Button */}
          <button
            type="submit"
            className="w-full py-3 bg-indigo-600 text-white rounded-xl font-semibold hover:bg-indigo-700 transition shadow-md"
          >
            Login
          </button>
        </form>

        {/* Extra Links */}
        <div className="text-center mt-6">
          <p className="text-gray-900 text-sm">
            Don't have an account?{" "}
            <a
              href="/signup"
              className="text-indigo-600 font-medium hover:underline"
            >
              Sign Up
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
