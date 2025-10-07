import type { Metadata } from "next";
import Link from "next/link";
import { UserIcon } from "@heroicons/react/24/solid";
import "./globals.css";

export const metadata: Metadata = {
  title: "BookIndoor",
  description: "Book indoor grounds easily",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-gray-50 text-gray-900 min-h-screen flex flex-col">
        {/* UserHeader */}
        <header className="bg-white shadow-md sticky top-0 z-10">
          <div className="max-w-6xl mx-auto flex items-center justify-between px-6 py-4">
            <h1 className="text-2xl font-bold text-indigo-600">BookIndoor</h1>
            <Link href="/login">
              <UserIcon className="w-8 h-8 text-gray-800 hover:text-indigo-600 cursor-pointer transition" />
            </Link>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 max-w-6xl mx-auto px-6 py-10">
          {children}
        </main>

        {/* Footer */}
        <footer className="bg-gray-100 text-center py-4 text-sm text-gray-600 mt-10">
          © {new Date().getFullYear()} BookIndoor. All rights reserved.
        </footer>
      </body>
    </html>
  );
}
