"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import GroundCard, { Ground as BaseGround } from "@/components/GroundCard";
import AddGroundForm from "@/components/AddGroundForm";
import BookingDetailsTab from "@/components/BookingDetailsTab";
import BookingSummaryTab from "@/components/BookingSummaryTab";
import Calendar from "@/components/Calendar";

import DataViewerTab from "@/components/DataViewerTab";

interface Stats {
  totalAdmins?: number;
  totalGrounds: number;
  totalRevenue: number;
  activeBookings: number;
}

type TabType = "grounds" | "summary" | "bookings" | "details" | "database";

interface BackendGround {
  _id: string;
  name: string;
  location: { address?: string } | string;
  images?: string[];
  sports?: { name: string }[];
}

// ✅ Match the GroundCard type properly (id: number)
interface Ground extends Omit<BaseGround, "id"> {
  id: number;
}

export default function AdminPage() {
  const [grounds, setGrounds] = useState<Ground[]>([]);
  const [, setStats] = useState<Stats>({
    totalAdmins: 0,
    totalGrounds: 0,
    totalRevenue: 0,
    activeBookings: 0,
  });
  const [role, setRole] = useState<"admin" | "super_admin" | "user">("admin");
  const [activeTab, setActiveTab] = useState<TabType>("grounds");
  const [showAddForm, setShowAddForm] = useState(false);
  const [selectedGroundId, setSelectedGroundId] = useState<string>("");
  const router = useRouter();

  // ✅ Load role from localStorage
  useEffect(() => {
    const storedRole = localStorage.getItem("user") as
      | "admin"
      | "super_admin"
      | "user"
      | null;
    if (storedRole) setRole(storedRole);
  }, []);

  // ✅ Handle logout

  // Fetch stats
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

        const data: Stats = await response.json();
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

  // Fetch grounds
  useEffect(() => {
    const fetchGrounds = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await fetch("/api/grounds", {
          headers: {
            "Content-Type": "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
        });

        if (!response.ok) throw new Error("Failed to fetch grounds");

        const data: BackendGround[] = await response.json();

        // Keep id as number (use array index)
        const mappedGrounds: Ground[] = data.map((g, i) => ({
          id: i,
          _id: g._id,
          name: g.name,
          location:
            typeof g.location === "string"
              ? g.location
              : g.location?.address || "Unknown",
          image: g.images?.[0] || "/placeholder.png",
          sports: g.sports?.map((s) => s.name) || [],
        }));

        setGrounds(mappedGrounds);
      } catch (err) {
        console.error("❌ Error fetching grounds:", err);
      }
    };

    fetchGrounds();
    fetchGrounds();
  }, []);

  const handleAdminBooking = async (
    bookingDates: { date: string; times: string[] }[],
    sport?: string,
    paymentStatus?: string
  ) => {
    if (!selectedGroundId || !sport) {
      alert("Please select a sport.");
      return;
    }

    try {
      const token = localStorage.getItem("token");
      const formattedBookings = bookingDates.map((b) => ({
        date: b.date,
        timeSlots: b.times.map((t) => ({ startTime: t.split("-")[0] })),
      }));

      const res = await fetch("/api/booking", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          token,
          ground: selectedGroundId,
          sportName: sport,
          bookings: formattedBookings,
          paymentStatus: paymentStatus || "pending",
          guest: {
            name: "Admin Booking", // Default name for admin bookings if not specified
            phone: "N/A",
            nicNumber: "N/A"
          }
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Booking failed");

      alert("Booking created successfully!");
      // Optionally refresh bookings or clear selection
      // You might want to trigger a refresh of the Calendar or BookingDetailsTab
    } catch (err: unknown) {
      console.error("Booking Error:", err);
      if (err instanceof Error) {
        alert(err.message || "Failed to create booking");
      } else {
        alert("Failed to create booking");
      }
    }
  };

  return (
    <div className="justify-center bg-gray-50 min-h-screen">
      <div className="w-full px-4 sm:px-6 py-10 bg-white shadow-sm rounded-xl">

        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">Admin Dashboard</h1>
            {role === "admin" && (
              <p className="text-gray-500 mt-1">Manage your facility operations</p>
            )}
          </div>

          <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
            {/* Ground filter - only show if on bookings or summary tab */}
            {(activeTab === "bookings" || activeTab === "summary") && grounds.length > 1 && (
              <select
                value={selectedGroundId}
                onChange={(e) => setSelectedGroundId(e.target.value)}
                className="px-4 py-2 border border-gray-200 rounded-lg bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition"
              >
                <option value="">All Grounds</option>
                {grounds.map((g) => (
                  <option key={g._id} value={g._id}>
                    {g.name}
                  </option>
                ))}
              </select>
            )}

            <div className="flex gap-3">
              {/* ✅ Show Add button only for Admin */}
              {role === "admin" && activeTab === "grounds" && (
                <button
                  onClick={() => setShowAddForm(true)}
                  className="px-5 py-2 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 transition-all shadow-md w-full sm:w-auto"
                >
                  + Add New Ground
                </button>
              )}


            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-4 mb-8 border-b border-gray-200 pb-2 overflow-x-auto">
          {[
            { key: "grounds", label: "Grounds" },
            { key: "bookings", label: "Bookings" },
            { key: "summary", label: "Summary" },
            { key: "database", label: "Database" }
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as TabType)}
              className={`px-4 py-2 rounded-t-lg font-medium transition whitespace-nowrap ${activeTab === tab.key
                ? "text-emerald-600 border-b-2 border-emerald-600"
                : "text-gray-500 hover:text-emerald-500"
                }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="min-h-[600px] transition-all duration-300">
          {activeTab === "grounds" && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10 justify-items-center">
              {grounds.length > 0 ? (
                grounds.map((ground) => (
                  <GroundCard
                    key={ground.id}
                    ground={ground}
                    role={role}
                    id={ground.id}
                  />
                ))
              ) : (
                <p className="col-span-full text-gray-500 text-center">
                  No grounds available yet.
                </p>
              )}
            </div>
          )}

          {activeTab === "bookings" && (
            !selectedGroundId ? (
              <div className="space-y-8 animate-fadeIn">
                <div className="text-center max-w-2xl mx-auto">
                  <h2 className="text-2xl font-black text-slate-800">Ground Management</h2>
                  <p className="text-slate-500 mt-2">Select a facility below to view its comprehensive booking history and manage real-time availability slots.</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                  {grounds.map((ground) => (
                    <div
                      key={ground._id}
                      onClick={() => setSelectedGroundId(ground._id)}
                      className="group cursor-pointer bg-white rounded-3xl border-2 border-slate-100 hover:border-emerald-500 p-6 transition-all duration-300 shadow-sm hover:shadow-xl hover:-translate-y-1"
                    >
                      <div className="aspect-[16/10] rounded-2xl overflow-hidden mb-5 bg-slate-100">
                        <img
                          src={ground.image}
                          alt={ground.name}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                        />
                      </div>
                      <h3 className="text-xl font-bold text-slate-800 group-hover:text-emerald-600 transition-colors">{ground.name}</h3>
                      <p className="text-slate-400 text-sm mt-1 flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-slate-300"></span>
                        {ground.location}
                      </p>

                      <div className="mt-6 flex items-center justify-between">
                        <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 bg-slate-50 px-2.5 py-1 rounded-lg">
                          Manage slots
                        </span>
                        <div className="w-8 h-8 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-600 opacity-0 group-hover:opacity-100 transition-all transform translate-x-2 group-hover:translate-x-0">
                          →
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="space-y-10 animate-fadeIn">
                <div className="flex flex-col sm:flex-row items-center justify-between gap-6 bg-slate-900 p-8 rounded-[2rem] text-white shadow-xl">
                  <div className="flex items-center gap-5">
                    <button
                      onClick={() => setSelectedGroundId("")}
                      className="w-12 h-12 flex items-center justify-center bg-white/10 hover:bg-white/20 rounded-2xl transition-all border border-white/10 group"
                    >
                      <span className="text-xl group-hover:-translate-x-1 transition-transform">←</span>
                    </button>
                    <div>
                      <h2 className="text-2xl font-black tracking-tight">{grounds.find(g => g._id === selectedGroundId)?.name}</h2>
                      <p className="text-emerald-400 text-xs font-bold uppercase tracking-widest mt-1">Operational Dashboard</p>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <span className="px-4 py-2 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] font-black rounded-xl uppercase tracking-widest">
                      Active Session
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-1 xl:grid-cols-12 gap-10">
                  <div className="xl:col-span-4 lg:col-span-5">
                    <div className="sticky top-10">
                      <div className="flex items-center justify-between mb-4 px-2">
                        <h3 className="text-sm font-black uppercase tracking-widest text-slate-400">Inventory Explorer</h3>
                        <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                      </div>
                      <Calendar
                        groundId={selectedGroundId}
                        groundName={grounds.find(g => g._id === selectedGroundId)?.name}
                        sports={grounds.find(g => g._id === selectedGroundId)?.sports || []}
                        isEmbedded={true}
                        isAdmin={true}
                        onConfirmBookings={handleAdminBooking}
                      />
                    </div>
                  </div>

                  <div className="xl:col-span-8 lg:col-span-7 space-y-8">
                    <div className="flex items-center justify-between px-2">
                      <h3 className="text-sm font-black uppercase tracking-widest text-slate-400">Logistics & Reservations</h3>
                      <span className="text-[10px] font-bold text-slate-500 bg-slate-100 px-3 py-1 rounded-full uppercase">All-time record</span>
                    </div>
                    <BookingDetailsTab groundId={selectedGroundId} />
                  </div>
                </div>
              </div>
            )
          )}

          {activeTab === "summary" && (
            <BookingSummaryTab groundId={selectedGroundId} />
          )}

          {activeTab === "database" && (
            <DataViewerTab />
          )}
        </div>
      </div>

      {/* Add Ground Modal */}
      {showAddForm && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowAddForm(false)}
            className="absolute inset-0 bg-slate-900/60 backdrop-blur-md"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="relative w-full max-w-2xl bg-white rounded-[2.5rem] shadow-2xl overflow-hidden border border-slate-100 flex flex-col max-h-[90vh]"
          >
            {/* Header */}
            <div className="p-8 pb-4 flex items-center justify-between border-b border-slate-50 flex-shrink-0">
              <div>
                <h3 className="text-2xl font-black text-slate-800 tracking-tight">
                  List New Arena
                </h3>
                <p className="text-slate-500 text-sm font-medium mt-1">
                  Onboard a new facility to the BookIndoor network
                </p>
              </div>
              <button
                onClick={() => setShowAddForm(false)}
                className="w-12 h-12 flex items-center justify-center bg-slate-50 hover:bg-slate-100 text-slate-400 rounded-2xl transition-all"
              >
                <span className="text-xl">✕</span>
              </button>
            </div>

            <div className="flex-1 overflow-y-auto custom-scrollbar p-2">
              <AddGroundForm onClose={() => setShowAddForm(false)} />
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
