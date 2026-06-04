"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { EnvelopeIcon, LockClosedIcon } from "@heroicons/react/24/outline";
import { motion } from "framer-motion";

interface LoginFormProps {
    onSuccess?: () => void;
    onClose?: () => void;
}

export default function LoginForm({ onSuccess }: LoginFormProps) {
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

            // ✅ Save token and user info
            localStorage.setItem("token", data.token);
            localStorage.setItem("userRole", data.user.role);
            localStorage.setItem("userId", data.user._id);
            localStorage.setItem("user", data.user.role); // Backward compatibility
            localStorage.setItem("id", data.user._id); // Backward compatibility

            if (onSuccess) {
                onSuccess();
            }

            // ✅ Redirect based on role
            if (data.user.role === "admin") {
                router.push("/admin");
            } else if (data.user.role === "super_admin") {
                router.push("/superadmin");
            } else {
                router.push("/");
                if (!onSuccess) window.location.reload();
            }
        } catch (err) {
            console.error(err);
            setError("Something went wrong. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="w-full">
            <div className="text-center mb-8">
                <h2 className="text-3xl font-black font-outfit text-slate-800 tracking-tight">Admin Access</h2>
                <p className="text-slate-500 text-sm font-medium mt-2">Please sign in to manage your facility</p>
            </div>

            <form onSubmit={handleLogin} className="space-y-6">
                <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-emerald-500 transition-colors z-10">
                        <EnvelopeIcon className="w-5 h-5" />
                    </div>
                    <input
                        type="email"
                        id="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        className="input peer pl-12 pt-6 pb-2"
                        placeholder=" "
                    />
                    <label 
                        htmlFor="email"
                        className="absolute text-sm text-slate-500 duration-300 transform -translate-y-3 scale-75 top-4 z-10 origin-[0] left-12 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-3 peer-focus:text-emerald-600 font-medium"
                    >
                        Email Address
                    </label>
                </div>

                <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-emerald-500 transition-colors z-10">
                        <LockClosedIcon className="w-5 h-5" />
                    </div>
                    <input
                        type="password"
                        id="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        className="input peer pl-12 pt-6 pb-2"
                        placeholder=" "
                    />
                    <label 
                        htmlFor="password"
                        className="absolute text-sm text-slate-500 duration-300 transform -translate-y-3 scale-75 top-4 z-10 origin-[0] left-12 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-3 peer-focus:text-emerald-600 font-medium"
                    >
                        Password
                    </label>
                </div>

                {error && (
                    <motion.p
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-red-500 text-xs font-bold text-center bg-red-50 py-3 rounded-xl border border-red-100"
                    >
                        {error}
                    </motion.p>
                )}

                <button
                    type="submit"
                    disabled={loading}
                    className="w-full btn-premium py-4 mt-2"
                >
                    {loading ? "Authenticating..." : "Sign In"}
                </button>
            </form>
        </div>
    );
}
