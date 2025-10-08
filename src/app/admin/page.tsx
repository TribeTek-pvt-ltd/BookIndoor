"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import GroundCard from "@/components/GroundCard";
import AddGroundForm from "@/components/AddGroundForm"; // ✅ Ensure this path is correct

interface Ground {
  id: number;
  name: string;
  location: string;
  image: string;
  sports: string[];
}

type TabType = "grounds" | "summary" | "details";

export default function AdminPage() {
  const [grounds, setGrounds] = useState<Ground[]>([]);
  const [role] = useState<"Admin" | "User">("Admin");
  const [activeTab, setActiveTab] = useState<TabType>("grounds");
  const [showAddForm, setShowAddForm] = useState(false);

  // Load stored grounds or fallback data
  useEffect(() => {
    const stored = localStorage.getItem("grounds");
    if (stored) setGrounds(JSON.parse(stored));
    else
      setGrounds([
        {
          id: 1,
          name: "Indoor Arena",
          location: "Colombo",
          image: "/arena1.jpg",
          sports: ["Badminton", "Futsal", "Basketball"],
        },
        {
          id: 2,
          name: "City Sports Hall",
          location: "Kandy",
          image: "/arena2.jpg",
          sports: ["Volleyball", "Badminton"],
        },
        {
          id: 3,
          name: "Beachside Courts",
          location: "Galle",
          image: "/arena3.jpg",
          sports: ["Futsal", "Basketball"],
        },
      ]);
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
              className="px-5 py-2 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 transition-all shadow-md w-full sm:w-auto"
            >
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
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="min-h-[600px] transition-all duration-300">
          {activeTab === "grounds" && (
            <>
              {/* Summary */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-12">
                <SummaryCard
                  title="Total Grounds"
                  value={grounds.length}
                  color="green"
                />
                <SummaryCard
                  title="Active Bookings"
                  value="12"
                  color="indigo"
                />
                <SummaryCard
                  title="Total Revenue"
                  value="$2,450"
                  color="yellow"
                />
              </div>

              {/* Grounds */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10 justify-items-center">
                {grounds.length > 0 ? (
                  grounds.map((ground) => (
                    <GroundCard key={ground.id} ground={ground} role={role} />
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

      {/* ✅ Add Ground Modal */}
      {showAddForm && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-y-auto max-h-[90vh] relative animate-fadeIn">
            <button
              onClick={() => setShowAddForm(false)}
              className="absolute top-3 right-3 text-gray-600 hover:text-red-600 text-2xl"
            >
              ✕
            </button>

            <div className="p-6">
              <h2 className="text-2xl font-bold text-green-800 mb-4 text-center">
                Add New Ground
              </h2>
              <AddGroundForm />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Summary Card Component
function SummaryCard({
  title,
  value,
  color,
}: {
  title: string;
  value: string | number;
  color: "green" | "indigo" | "yellow";
}) {
  const colors = {
    green: "border-l-4 border-green-500",
    indigo: "border-l-4 border-indigo-500",
    yellow: "border-l-4 border-yellow-500",
  };

  return (
    <div
      className={`bg-white p-6 rounded-xl shadow-md w-full ${colors[color]}`}
    >
      <h3 className="text-lg font-semibold text-gray-700">{title}</h3>
      <p className="text-3xl font-bold text-gray-800 mt-2">{value}</p>
    </div>
  );
}
