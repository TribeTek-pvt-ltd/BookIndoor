"use client";

import { useState, useEffect, Key } from "react";
import AddAdminForm from "./AddAdminForm";
import { useRouter } from "next/navigation";

interface Admin {
  id: Key | null | undefined;
  _id: string;
  name: string;
  email: string;
  phone?: string;
  nic_no?: string;
  address?: string;
  bank_name?: string;
  account_no?: string;
  branch?: string;
  image?: string;
  managingGround?: string;
}

export default function AdminTab() {
  const [admins, setAdmins] = useState<Admin[]>([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const token =
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY4ZTZiMmIyNjc2Y2FhMmI3ZWQ3YTFkMiIsInJvbGUiOiJzdXBlcl9hZG1pbiIsImlhdCI6MTc1OTk0OTcwMCwiZXhwIjoxNzYwNTU0NTAwfQ.mToBoWFigBppqZTIkmV96RehBEWgHWwyKDH24goigWQ"; // Replace with actual token

  // Fetch all admins from backend
  const fetchAdmins = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/auth?token=${token}`);
      const data = await res.json();
      if (res.ok) {
        setAdmins(data.admins || []);
      } else {
        console.error("Error fetching admins:", data.error);
      }
    } catch (err) {
      console.error("Fetch admins failed:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdmins();
  }, []);

  // Handle adding new admin
  const handleAddAdmin = async (newAdminData: any) => {
    try {
      // Send to backend
      const res = await fetch("/api/auth/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...newAdminData, role: "admin", token }),
      });
      const data = await res.json();

      if (res.ok) {
        // Update frontend state
        setAdmins((prev) => [...prev, data]);
        setShowAddForm(false);
      } else {
        console.error("Failed to add admin:", data.error);
        alert(data.error || "Failed to add admin");
      }
    } catch (err) {
      console.error("Add admin error:", err);
      alert("Failed to add admin");
    }
  };

  const handleViewProfile = (adminId: string) => {
      router.push(`/admin/profile/${adminId}`);
    };

  return (
    <div className="space-y-6 relative w-full max-w-full mx-auto px-3 sm:px-6 mb-10">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h2 className="text-xl sm:text-2xl font-semibold text-gray-800">
          Manage Admins
        </h2>
        <button
          onClick={() => setShowAddForm(true)}
          className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition w-full sm:w-auto text-center"
        >
          Add Admin
        </button>
      </div>

      {/* Admin List */}
      <div className="bg-white p-4 rounded-lg shadow-md overflow-x-auto">
        <h3 className="text-lg font-semibold mb-4">All Admins</h3>
        {loading ? (
          <p className="text-gray-500 text-center py-8">Loading admins...</p>
        ) : admins.length === 0 ? (
          <p className="text-gray-500 text-center py-8">No admins found.</p>
        ) : (
          <table className="w-full min-w-[500px] sm:min-w-[600px] border-collapse text-left text-gray-700">
            <thead className="bg-gray-100">
              <tr>
                <th className="p-3 border-b">Profile</th>
                <th className="p-3 border-b">Name</th>
                <th className="p-3 border-b">Email</th>
                <th className="p-3 border-b">Managing Ground</th>
              </tr>
            </thead>
            <tbody>
              {admins.map((admin) => (
                              <tr
                                key={admin._id}
                                onClick={() => handleViewProfile(admin._id)}
                                className="hover:bg-gray-50 cursor-pointer transition"
                              >
                                <td className="p-3 border-b">
                                  <img
                                    src={admin.image || "/default-avatar.png"}
                                    alt={admin.name}
                                    className="w-10 h-10 sm:w-12 sm:h-12 rounded-full object-cover"
                                  />
                                </td>
                                <td className="p-3 border-b font-medium">{admin.name}</td>
                                <td className="p-3 border-b">{admin.email}</td>
                                <td className="p-3 border-b">{admin.managingGround}</td>
                              </tr>
                            ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Popup Modal */}
      {showAddForm && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-3 sm:p-6">
          <div className="bg-white/20 backdrop-blur-md border border-white/30 shadow-2xl p-5 sm:p-6 rounded-2xl w-full max-w-md relative overflow-y-auto max-h-[90vh]">
            <button
              onClick={() => setShowAddForm(false)}
              className="absolute top-3 right-3 text-white bg-red-500 hover:bg-red-600 rounded-full p-1 px-2 text-sm transition"
            >
              ✕
            </button>
            <h3 className="text-lg sm:text-xl font-semibold text-white mb-4 text-center">
              Add New Admin
            </h3>
            <AddAdminForm onAddAdmin={handleAddAdmin} />
          </div>
        </div>
      )}
    </div>
  );
}
