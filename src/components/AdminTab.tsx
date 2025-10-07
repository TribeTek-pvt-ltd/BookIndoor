"use client";

import { useState } from "react";
import AddAdminForm from "./AddAdminForm";
import { useRouter } from "next/navigation";

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

export default function AdminTab() {
  const [admins, setAdmins] = useState<Admin[]>([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const router = useRouter();

  const handleAddAdmin = (newAdminData: any) => {
    const newAdmin = {
      id: Date.now(),
      ...newAdminData,
      image: newAdminData.image
        ? URL.createObjectURL(newAdminData.image)
        : "/default-avatar.png",
    };
    setAdmins((prev) => [...prev, newAdmin]);
    setShowAddForm(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <h2 className="text-xl font-semibold text-gray-800">Manage Admins</h2>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition"
        >
          {showAddForm ? "Close Form" : "Add Admin"}
        </button>
      </div>

      {/* Add Admin Form */}
      {showAddForm && (
        <div className="bg-gray-50 p-4 rounded-lg shadow-inner border border-gray-200">
          <AddAdminForm onAddAdmin={handleAddAdmin} />
        </div>
      )}

      {/* Admin List */}
      <div className="bg-white p-4 rounded-lg shadow-md">
        <h3 className="text-lg font-semibold mb-4">All Admins</h3>
        {admins.length === 0 ? (
          <p className="text-gray-500 text-center py-8">No admins found.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[600px] border-collapse text-left text-gray-700">
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
                    key={admin.id}
                    onClick={() => router.push(`/admin/profile/${admin.id}`)}
                    className="hover:bg-gray-50 cursor-pointer transition"
                  >
                    <td className="p-3 border-b">
                      <img
                        src={admin.image || "/default-avatar.png"}
                        alt={admin.name}
                        className="w-12 h-12 rounded-full object-cover"
                      />
                    </td>
                    <td className="p-3 border-b font-medium">{admin.name}</td>
                    <td className="p-3 border-b">{admin.email}</td>
                    <td className="p-3 border-b">{admin.managingGround}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
