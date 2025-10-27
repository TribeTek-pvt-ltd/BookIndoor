"use client";

import { useParams } from "next/navigation";
import { useEffect, useState } from "react";

interface AdminProfile {
  _id: string;
  name: string;
  email: string;
  role: string;
  createdAt?: string;
}

export default function AdminProfilePage() {
  const params = useParams();
  const id = Array.isArray(params.id) ? params.id[0] : params.id;

  const [admin, setAdmin] = useState<AdminProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAdmin = async (): Promise<void> => {
      if (!id) return;
      try {
        const res = await fetch(`/api/admin/${id}`);
        const data: AdminProfile = await res.json();

        if (res.ok) {
          setAdmin(data);
        } else {
          console.error("Error fetching admin:", data);
        }
      } catch (error: unknown) {
        if (error instanceof Error) {
          console.error("Fetch admin error:", error.message);
        } else {
          console.error("Unknown error:", error);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchAdmin();
  }, [id]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen text-gray-600">
        Loading admin profile...
      </div>
    );
  }

  if (!admin) {
    return (
      <div className="flex justify-center items-center h-screen text-gray-600">
        Admin not found.
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto p-8">
      <h1 className="text-3xl font-semibold text-green-900 mb-6">
        Admin Profile
      </h1>
      <div className="bg-white shadow-md rounded-xl p-6 space-y-3 border border-green-200">
        <p>
          <span className="font-medium text-green-800">Name:</span> {admin.name}
        </p>
        <p>
          <span className="font-medium text-green-800">Email:</span>{" "}
          {admin.email}
        </p>
        <p>
          <span className="font-medium text-green-800">Role:</span> {admin.role}
        </p>
        {admin.createdAt && (
          <p>
            <span className="font-medium text-green-800">Created At:</span>{" "}
            {new Date(admin.createdAt).toLocaleString()}
          </p>
        )}
      </div>
    </div>
  );
}
