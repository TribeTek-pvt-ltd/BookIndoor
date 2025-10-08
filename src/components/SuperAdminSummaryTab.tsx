"use client";

import { useEffect, useState } from "react";

interface StatsResponse {
  role: "super_admin" | "admin";
  totalAdmins?: number;
  totalGrounds: number;
  totalRevenue: number;
  totalBookings: number;
  monthlyBookings?: number;
  weeklyBookings?: number;
  groundWiseStats?: any[];
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

        const data = await res.json();
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
      <div className="text-center py-10 text-gray-500">Loading stats...</div>
    );
  }

  if (!stats) {
    return (
      <div className="text-center py-10 text-red-500">Failed to load stats</div>
    );
  }

  const summaryCards = [
    {
      title: "Total Admins",
      value: stats.totalAdmins ?? 0,
      color: "indigo",
      visible: stats.role === "super_admin",
    },
    {
      title: "Total Grounds",
      value: stats.totalGrounds ?? 0,
      color: "green",
      visible: true,
    },
    {
      title: "Weekly Bookings",
      value: stats.weeklyBookings ?? 0,
      color: "blue",
      visible: stats.role === "super_admin",
    },
    {
      title: "Monthly Bookings",
      value: stats.monthlyBookings ?? 0,
      color: "blue",
      visible: stats.role === "super_admin",
    },
    {
      title: "Total Revenue",
      value: `Rs. ${stats.totalRevenue.toLocaleString()}`,
      color: "blue",
      visible: true,
    },
  ].filter((card) => card.visible);

  const colorMap: Record<string, string> = {
    indigo: "text-indigo-600",
    green: "text-green-600",
    blue: "text-blue-600",
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {summaryCards.map((card, idx) => (
        <div
          key={idx}
          className="bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition cursor-default">
          <h3 className="text-lg font-semibold text-gray-800 mb-2">
            {card.title}
          </h3>
          <p className={`text-2xl font-bold ${colorMap[card.color]}`}>
            {card.value}
          </p>
        </div>
      ))}
    </div>
  );
}
