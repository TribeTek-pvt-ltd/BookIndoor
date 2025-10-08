"use client";

import { useParams } from "next/navigation";
import { useEffect, useState } from "react";

interface Admin {
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

export default function AdminProfile() {
  const { id } = useParams();
  const [admin, setAdmin] = useState<Admin | null>(null);

  useEffect(() => {
    const storedAdmins = localStorage.getItem("admins");
    if (storedAdmins) {
      const allAdmins: Admin[] = JSON.parse(storedAdmins);
      const foundAdmin = allAdmins.find(
        (a) => a.id.toString() === id?.toString()
      );
      if (foundAdmin) setAdmin(foundAdmin);
    }
  }, [id]);

  if (!admin) {
    return (
      <div className="text-center text-gray-500 mt-10">Admin not found.</div>
    );
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow-md max-w-2xl mx-auto mt-10">
      <div className="flex flex-col items-center mb-6">
        <img
          src={admin.image || "/default-avatar.png"}
          alt={admin.name}
          className="w-24 h-24 rounded-full border border-gray-300 shadow-md mb-3 object-cover"
        />
        <h1 className="text-2xl font-bold text-indigo-700">{admin.name}</h1>
        <p className="text-gray-500">{admin.email}</p>
      </div>

      <div className="space-y-2 text-gray-700">
        <p>
          <strong>Phone:</strong> {admin.phone_no}
        </p>
        <p>
          <strong>NIC:</strong> {admin.nic_no}
        </p>
        <p>
          <strong>Address:</strong> {admin.address}
        </p>
        <p>
          <strong>Managing Ground:</strong> {admin.managingGround}
        </p>
      </div>

      <div className="mt-6 border-t pt-4">
        <h3 className="text-lg font-semibold mb-2 text-indigo-700">
          Bank Details
        </h3>
        <p>
          <strong>Bank Name:</strong> {admin.bank_name}
        </p>
        <p>
          <strong>Account No:</strong> {admin.account_no}
        </p>
        <p>
          <strong>Branch:</strong> {admin.branch}
        </p>
      </div>
    </div>
  );
}
