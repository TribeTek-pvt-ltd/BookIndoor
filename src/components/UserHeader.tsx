"use client";

import Link from "next/link";
import { UserIcon } from "@heroicons/react/24/solid";

export default function UserHeader() {
  return (
    <header className="w-full bg-gray-600 shadow-md px-6 py-4 flex justify-between items-center">
      <h1 className="text-2xl font-bold text-white">BookIndoor</h1>
      <Link href="/login">
        <UserIcon className="w-8 h-8 text-gray-800 hover:text-blue-600 cursor-pointer transition" />
      </Link>
    </header>
  );
}
