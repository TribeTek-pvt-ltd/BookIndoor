"use client";

import Image from "next/image";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";

interface Admin {
  _id: string;
  name: string;
  email: string;
  phone_no?: string;
  nic_no?: string;
  address?: string;
  bank_name?: string;
  account_no?: string;
  branch?: string;
  image?: string;
  managingGround?: string;
}

export default function AdminProfile() {
  const { id } = useParams();
  const [admin, setAdmin] = useState<Admin | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAdmin = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          setError("Unauthorized. Please log in as super admin.");
          setLoading(false);
          return;
        }

        const res = await fetch(`/api/admins/${id}?token=${token}`);
        if (!res.ok) {
          const data = await res.json();
          throw new Error(data.error || "Failed to fetch admin");
        }

        const data = await res.json();

        // ✅ Clean up backend response: remove sensitive fields if any
        if (data?.admin) {
          const { passwordHash, ...safeAdmin } = data.admin;
          setAdmin(safeAdmin);
        } else {
          setAdmin(null);
        }
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchAdmin();
  }, [id]);

  if (loading)
    return <div className="text-center text-gray-500 mt-10">Loading...</div>;
  if (error)
    return <div className="text-center text-red-500 mt-10">{error}</div>;
  if (!admin)
    return (
      <div className="text-center text-gray-500 mt-10">Admin not found.</div>
    );

  // ✅ Helper: render a line only if value exists
  const renderField = (label: string, value?: string) => {
    if (!value) return null;
    return (
      <p>
        <strong>{label}:</strong> {value}
      </p>
    );
  };

  // Check if personal/bank details exist
  const hasPersonalDetails =
    admin.phone_no || admin.nic_no || admin.address || admin.managingGround;
  const hasBankDetails = admin.bank_name || admin.account_no || admin.branch;

  return (
    <div className="bg-white p-6 rounded-lg shadow-md max-w-2xl mx-auto mt-10">
      <div className="flex flex-col items-center mb-6">
        <Image
          src={admin.image || "/default-avatar.png"}
          alt={admin.name}
          width={96}
          height={96}
          className="w-24 h-24 rounded-full border border-gray-300 shadow-md mb-3 object-cover"
        />
        <h1 className="text-2xl font-bold text-indigo-700">{admin.name}</h1>
        <p className="text-gray-500">{admin.email}</p>
      </div>

      {/* 🧍 Personal Info Section */}
      <div className="space-y-2 text-gray-700 mb-6">
        <h3 className="text-lg font-semibold text-indigo-700 mb-1">
          Personal Details
        </h3>
        {hasPersonalDetails ? (
          <>
            {renderField("Phone", admin.phone_no)}
            {renderField("NIC", admin.nic_no)}
            {renderField("Address", admin.address)}
            {renderField("Managing Ground", admin.managingGround)}
          </>
        ) : (
          <p className="text-gray-400 italic">No personal details provided</p>
        )}
      </div>

      {/* 🏦 Bank Info Section */}
      <div className="border-t pt-4">
        <h3 className="text-lg font-semibold mb-2 text-indigo-700">
          Bank Details
        </h3>
        {hasBankDetails ? (
          <>
            {renderField("Bank Name", admin.bank_name)}
            {renderField("Account No", admin.account_no)}
            {renderField("Branch", admin.branch)}
          </>
        ) : (
          <p className="text-gray-400 italic">No bank details provided</p>
        )}
      </div>
    </div>
  );
}
