"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

interface AdminProfile {
  id: number;
  name: string;
  email: string;
  phone_no: string;
  nic_no: string;
  address: string;
  bank_name: string;
  account_no: string;
  branch: string;
  image?: string;
  managingGround: string;
}

export default function AdminProfilePage({ params }: { params: { id: string } }) {
  const [admin, setAdmin] = useState<AdminProfile | null>(null);

  useEffect(() => {
    const storedAdmins = localStorage.getItem("admins");
    if (storedAdmins) {
      const admins = JSON.parse(storedAdmins);
      const foundAdmin = admins.find((a: AdminProfile) => a.id === Number(params.id));
      setAdmin(foundAdmin);
    }
  }, [params.id]);

  if (!admin) return <p className="text-center mt-10">Loading admin profile...</p>;

  return (
    <div className="max-w-3xl mx-auto bg-white p-8 shadow-md rounded-lg mt-10">
      <div className="flex items-center gap-6 mb-6">
        <img
          src={admin.image || "/default-avatar.png"}
          alt={admin.name}
          className="w-32 h-32 rounded-full object-cover"
        />
        <div>
          <h2 className="text-2xl font-bold">{admin.name}</h2>
          <p className="text-gray-500">{admin.email}</p>
          <p className="text-gray-500">{admin.phone_no}</p>
        </div>
      </div>

      <div className="space-y-3 text-gray-700">
        <p><strong>NIC:</strong> {admin.nic_no}</p>
        <p><strong>Address:</strong> {admin.address}</p>
        <p><strong>Managing Ground:</strong> {admin.managingGround}</p>
        <p><strong>Bank:</strong> {admin.bank_name}</p>
        <p><strong>Account No:</strong> {admin.account_no}</p>
        <p><strong>Branch:</strong> {admin.branch}</p>
      </div>
    </div>
  );
}
