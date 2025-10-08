"use client";

import { useEffect, useState } from "react";
import GroundCard, { Ground } from "@/components/GroundCard";
import AddGroundForm from "@/components/AddGroundForm";

interface Stats {
  totalAdmins?: number;
  totalGrounds: number;
  totalRevenue: number;
  activeBookings: number;
}

type TabType = "grounds" | "summary" | "details";

export default function AdminPage() {
  const [grounds, setGrounds] = useState<Ground[]>([]);
  const [stats, setStats] = useState<Stats>({
    totalAdmins: 0,
    totalGrounds: 0,
    totalRevenue: 0,
    activeBookings: 0,
  });
  const [role, setRole] = useState<"Admin" | "SuperAdmin" | "User">("Admin");
  const [activeTab, setActiveTab] = useState<TabType>("grounds");
  const [showAddForm, setShowAddForm] = useState(false);

  // Load role from localStorage
  useEffect(() => {
    const storedRole = localStorage.getItem("role") as
      | "Admin"
      | "SuperAdmin"
      | "User"
      | null;
    if (storedRole) setRole(storedRole);
  }, []);

  // Fetch Stats from Backend
  useEffect(() => {
    const fetchStats = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await fetch(`/api/stats`, {
          headers: {
            "Content-Type": "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
        });

        if (!response.ok) throw new Error("Failed to fetch stats");

        const data = await response.json();
        setStats({
          totalAdmins: data.totalAdmins || 0,
          totalGrounds: data.totalGrounds || 0,
          totalRevenue: data.totalRevenue || 0,
          activeBookings: data.activeBookings || 0,
        });
      } catch (err) {
        console.error("❌ Error fetching stats:", err);
      }
    };

    fetchStats();
  }, []);

  // Fetch Grounds from Backend
  useEffect(() => {
    const fetchGrounds = async () => {
      try {
        const token = localStorage.getItem("token");

        // Call the backend API with token
        const response = await fetch("/api/grounds", {
          headers: {
            "Content-Type": "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
        });

        if (!response.ok) throw new Error("Failed to fetch grounds");

        const data = await response.json();

        // Normalize backend response to match Ground interface
        const mappedGrounds: Ground[] = data.map((g: any) => ({
          id: g._id, // _id → id
          name: g.name,
          location:
            typeof g.location === "string"
              ? g.location
              : g.location?.address || "Unknown",
          image: g.images?.[0] || "/placeholder.png",
          sports: g.sports?.map((s: any) => s.name) || [],
        }));

        setGrounds(mappedGrounds);
      } catch (err) {
        console.error("❌ Error fetching grounds:", err);
      }
    };

    fetchGrounds();
  }, []);

  return (
    <div className="justify-center bg-gray-50 min-h-screen">
      <div className="w-full px-4 sm:px-6 py-10 bg-white shadow-sm rounded-xl">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-4">
          <h1 className="text-3xl font-bold text-gray-800">Admin Dashboard</h1>

          {role === "Admin" && activeTab === "grounds" && (
            <button
              onClick={() => setShowAddForm(true)}
              className="px-5 py-2 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 transition-all shadow-md w-full sm:w-auto">
              + Add New Ground
            </button>
          )}
        </div>

        {/* Tabs */}
        <div className="flex gap-4 mb-8 border-b border-gray-200 pb-2 overflow-x-auto">
          {[{ key: "grounds", label: "Grounds" }].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as TabType)}
              className={`px-4 py-2 rounded-t-lg font-medium transition ${
                activeTab === tab.key
                  ? "text-green-600 border-b-2 border-green-600"
                  : "text-gray-500 hover:text-green-500"
              }`}>
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="min-h-[600px] transition-all duration-300">
          {activeTab === "grounds" && (
            <>
              {/* Grounds List */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10 justify-items-center">
                {grounds.length > 0 ? (
                  grounds.map((ground) => (
                    <GroundCard
                      key={ground.id}
                      ground={ground}
                      role={role}
                      id={0}
                    />
                  ))
                ) : (
                  <p className="col-span-full text-gray-500 text-center">
                    No grounds available yet.
                  </p>
                )}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Add Ground Modal */}
      {showAddForm && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-y-auto max-h-[90vh] relative animate-fadeIn">
            <button
              onClick={() => setShowAddForm(false)}
              className="absolute top-3 right-3 text-gray-600 hover:text-red-600 text-2xl">
              ✕
            </button>

            <div className="p-6">
              <AddGroundForm />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
