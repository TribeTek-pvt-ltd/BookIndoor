"use client";

import { useEffect, useState } from "react";

// Define a proper interface for ground-wise stats
interface GroundStat {
  groundId: string;
  groundName: string;
  totalBookings: number;
  totalRevenue: number;
}

interface StatsResponse {
  role: "super_admin" | "admin";
  totalAdmins?: number;
  totalGrounds: number;
  totalRevenue: number;
  totalBookings: number;
  monthlyBookings?: number;
  weeklyBookings?: number;
  groundWiseStats?: GroundStat[];
}

export default function SuperAdminSummaryTab() {
  const [stats, setStats] = useState<StatsResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) return;

        const res = await fetch("/api/stats", {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });

        const data: StatsResponse = await res.json();
        setStats(data);
      } catch (err) {
        console.error("Error fetching stats:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 animate-pulse">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-sm flex flex-col justify-between"
          >
            <div>
              <div className="flex justify-between items-start mb-6">
                <div className="w-12 h-12 bg-slate-100 rounded-2xl"></div>
                <div className="w-16 h-5 bg-slate-100 rounded-md"></div>
              </div>

              <div className="h-4 bg-slate-200 rounded w-36 mb-2"></div>
              <div className="h-3 bg-slate-100 rounded w-24 mb-6"></div>
            </div>

            <div className="h-8 bg-slate-300 rounded w-28 mt-4"></div>
          </div>
        ))}
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="text-center py-20 bg-red-50 rounded-[2rem] border border-red-100">
        <p className="text-red-500 font-bold">Failed to synchronize platform statistics.</p>
      </div>
    );
  }

  const summaryCards = [
    {
      title: "Active Administrators",
      description: "Verified facility operators",
      value: stats.totalAdmins ?? 0,
      icon: "👤",
      visible: stats.role === "super_admin",
    },
    {
      title: "Registered Grounds",
      description: "Total listed facilities",
      value: stats.totalGrounds ?? 0,
      icon: "🏟️",
      visible: true,
    },
    {
      title: "Weekly Velocity",
      description: "Reservations last 7 days",
      value: stats.weeklyBookings ?? 0,
      icon: "📈",
      visible: stats.role === "super_admin",
    },
    {
      title: "Monthly Volume",
      description: "Reservations last 30 days",
      value: stats.monthlyBookings ?? 0,
      icon: "📅",
      visible: stats.role === "super_admin",
    },
    {
      title: "Platform Revenue",
      description: "Gross settlement volume",
      value: `Rs. ${stats.totalRevenue.toLocaleString()}`,
      icon: "💰",
      visible: true,
    },
  ].filter((card) => card.visible);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
      {summaryCards.map((card, idx) => (
        <div
          key={idx}
          className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-sm hover:shadow-xl transition-all duration-300 group cursor-default"
        >
          <div className="flex justify-between items-start mb-6">
            <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center text-xl group-hover:bg-emerald-50 transition-all duration-500">
              {card.icon}
            </div>
            <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest bg-slate-50 px-2 py-0.5 rounded-md">Live Data</span>
          </div>

          <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest mb-1">
            {card.title}
          </h3>
          <p className="text-xs text-slate-400 font-medium mb-4">{card.description}</p>

          <p className="text-3xl font-black text-slate-800 group-hover:text-emerald-600 transition-colors">
            {card.value}
          </p>
        </div>
      ))}
    </div>
  );
}
