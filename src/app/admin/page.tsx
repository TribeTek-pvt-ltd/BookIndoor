"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import GroundCard from "@/components/GroundCard";
import BookingSummaryTab from "@/components/BookingSummaryTab";
import BookingDetailsTab from "@/components/BookingDetailsTab";

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
  const [selectedSport, setSelectedSport] = useState<string | undefined>(
    undefined
  );

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
    <div className=" justify-center bg-gray-50 min-h-screen">
      {/* Fixed Width Container */}
      <div className="w-full  px-6 py-10 bg-white shadow-sm rounded-xl">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">
              Admin Dashboard
            </h1>
           
          </div>
          {role === "Admin" && activeTab === "grounds" && (
            <Link
              href="/admin/add-ground"
              className="mt-4 md:mt-0 px-5 py-2 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 transition-all shadow-md"
            >
              + Add New Ground
            </Link>
          )}
        </div>

        {/* Tabs Navigation */}
        <div className="flex gap-4 mb-8 border-b border-gray-200 pb-2">
          {[
            { key: "grounds", label: "Grounds" },
            { key: "summary", label: "Booking Summary" },
            { key: "details", label: "Booking Details" },
          ].map((tab) => (
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

        {/* Fixed-height wrapper to prevent layout shift */}
        <div className="min-h-[600px] transition-all duration-300">
          {activeTab === "grounds" && (
            <>
              {/* Summary Cards */}
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

              {/* Ground List */}
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

          {activeTab === "summary" && (
            <div className="max-w-full overflow-hidden">
              <BookingSummaryTab selectedSport={selectedSport} />
            </div>
          )}

          {activeTab === "details" && (
            <div className="max-w-full overflow-hidden">
              <BookingDetailsTab selectedSport={selectedSport} />
            </div>
          )}
        </div>
      </div>
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
