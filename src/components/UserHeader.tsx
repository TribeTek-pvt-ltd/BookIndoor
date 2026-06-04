"use client";

import Link from "next/link";
import Image from "next/image";
import { UserIcon } from "@heroicons/react/24/solid";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import LoginForm from "./LoginForm";
import { XMarkIcon } from "@heroicons/react/24/outline";

export default function Header() {
  const [role, setRole] = useState<string | null>(null);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const userRole = localStorage.getItem("userRole");
    setRole(userRole);

    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("userRole");
    window.location.href = "/login";
  };

  return (
    <>
      {/* Floating Header */}
      <header 
        className={`fixed top-0 left-0 right-0 z-50 flex justify-center transition-all duration-500 ease-in-out px-4 ${
          scrolled ? "pt-4" : "pt-6"
        }`}
      >
        <div 
          className={`glass-nav-pill flex items-center justify-between px-6 sm:px-8 py-3 w-full max-w-6xl transition-all duration-500 ${
            scrolled ? "py-2 shadow-lg" : "py-4"
          }`}
        >
          {/* Logo / Brand */}
          <Link href="/" className="flex items-center group">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center shadow-lg shadow-emerald-500/20 transition-transform">
                <span className="text-white text-lg sm:text-xl font-black font-outfit tracking-tighter">B</span>
              </div>
              <span className="text-xl sm:text-2xl font-black font-outfit text-slate-800 tracking-tighter hidden sm:block group-hover:text-emerald-600 transition-colors">
                BookIndoor
              </span>
            </div>
          </Link>

          {/* User or Logout button */}
          <div className="flex items-center gap-6">
            {(role === "admin" || role === "superadmin") ? (
              <button
                onClick={handleLogout}
                className="px-6 py-2.5 bg-slate-900 text-white font-bold rounded-full hover:bg-slate-800 transition-all duration-300 shadow-md active:scale-95 text-sm"
              >
                Logout
              </button>
            ) : (
              <div className="flex items-center gap-4">
                <Link href="/user" className="text-slate-600 hover:text-emerald-600 font-semibold transition-colors hidden sm:block text-sm">
                  Explore Arenas
                </Link>
                <button
                  onClick={() => setShowLoginModal(true)}
                  className="flex items-center justify-center w-10 h-10 sm:w-11 sm:h-11 bg-slate-100 rounded-full hover:bg-emerald-500 hover:text-white transition-all duration-300 group cursor-pointer shadow-sm text-slate-600"
                >
                  <UserIcon className="w-5 h-5 sm:w-6 sm:h-6 group-hover:text-white transition-colors" />
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Login Modal */}
      <AnimatePresence>
        {showLoginModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowLoginModal(false)}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-md"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="relative w-full max-w-md max-h-[90vh] overflow-y-auto custom-scrollbar bg-white rounded-[2rem] shadow-2xl p-6 sm:p-8 border border-slate-100"
            >
              <button
                onClick={() => setShowLoginModal(false)}
                className="absolute top-6 right-6 w-10 h-10 flex items-center justify-center bg-slate-50 hover:bg-slate-100 text-slate-400 rounded-2xl transition-all"
              >
                <XMarkIcon className="w-5 h-5" />
              </button>
              <LoginForm onSuccess={() => setShowLoginModal(false)} />
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
