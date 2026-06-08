"use client";

interface BookingSummaryTabProps {
  selectedSport?: string;
  groundId?: string;
}

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";

interface SummaryStats {
  income: number;
  totalBookings: number;
  sports: Record<string, number>;
}

interface GroundStat {
  groundId: string;
  groundName: string;
  totalRevenue: number;
  totalBookings: number;
  summary: Record<string, SummaryStats>;
}

export default function BookingSummaryTab({ selectedSport, groundId }: BookingSummaryTabProps) {
  const [summaryData, setSummaryData] = useState<Record<string, SummaryStats> | null>(null);
  const [groundWiseStats, setGroundWiseStats] = useState<GroundStat[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSummary = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem("token");

        let url = "/api/stats";
        if (groundId) url += `?ground=${groundId}`;

        const res = await fetch(url, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        if (!res.ok) throw new Error("Failed to fetch stats");
        const data = await res.json();
        if (data.summary) {
          setSummaryData(data.summary);
          if (data.groundWiseStats) {
            setGroundWiseStats(data.groundWiseStats);
          }
        }
      } catch (err) {
        console.error("Error fetching summary:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchSummary();
  }, [groundId]);

  if (loading) return (
    <div className="space-y-12 py-4 animate-pulse">
      <div>
        <div className="h-7 bg-slate-200 rounded w-48 mb-6 ml-2"></div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 lg:gap-8">
          {[1, 2, 3].map((i) => (
            <div key={i} className="glass-card p-6 flex flex-col h-full space-y-6 border border-slate-100/50">
              <div className="flex flex-col items-center text-center space-y-6 flex-1">
                <div className="w-20 h-6 bg-slate-200 rounded-full"></div>
                <div className="space-y-2 flex flex-col items-center">
                  <div className="h-3 bg-slate-200 rounded w-24"></div>
                  <div className="h-8 bg-slate-300 rounded w-36"></div>
                </div>
                <div className="w-full pt-4 border-t border-slate-100/50 flex flex-col items-center space-y-4">
                  <div className="h-6 bg-slate-200 rounded w-28"></div>
                  <div className="w-full space-y-2 mt-auto">
                    {[1, 2].map((j) => (
                      <div key={j} className="h-9 bg-slate-100 rounded-xl w-full"></div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
      
      {!groundId && (
        <div className="space-y-6 pt-8 border-t border-slate-100">
          <div className="h-7 bg-slate-200 rounded w-64 mb-6 ml-2"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="flex items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-slate-200 flex-shrink-0"></div>
                  <div className="space-y-2">
                    <div className="h-4 bg-slate-200 rounded w-28"></div>
                    <div className="h-3 bg-slate-100 rounded w-20"></div>
                  </div>
                </div>
                <div className="text-right space-y-2">
                  <div className="h-4 bg-slate-200 rounded w-20 ml-auto"></div>
                  <div className="h-2 bg-slate-100 rounded w-16 ml-auto"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );

  if (!summaryData) return (
    <div className="glass-card p-12 text-center flex flex-col items-center justify-center min-h-[300px]">
      <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-4">
        <span className="text-2xl">📊</span>
      </div>
      <h3 className="text-xl font-bold font-outfit text-slate-800 mb-2">No Data Available</h3>
      <p className="text-slate-500 font-medium max-w-sm">There are no statistical records found for the selected criteria yet.</p>
    </div>
  );

  const renderSummaryCards = (data: Record<string, SummaryStats>) => (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 lg:gap-8">
      {Object.entries(data).map(([period, stats]: [string, SummaryStats], idx) => (
        <motion.div 
          key={period} 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: idx * 0.1 }}
          className="glass-card p-6 flex flex-col h-full"
        >
          <div className="flex flex-col items-center text-center space-y-6 flex-1">
            <span className="px-4 py-1.5 bg-emerald-50 text-emerald-600 text-[10px] font-black rounded-full uppercase tracking-widest shadow-sm border border-emerald-100/50">
              {period}
            </span>

            <div className="space-y-1">
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Revenue</p>
              <p className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-br from-slate-800 to-slate-600 font-outfit">
                Rs. {stats.income.toLocaleString()}
              </p>
            </div>

            <div className="w-full pt-4 border-t border-slate-100/50 flex flex-col items-center">
              <div className="flex items-baseline gap-2 mb-4">
                <span className="text-2xl font-black text-emerald-500 font-outfit">{stats.totalBookings}</span>
                <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Total Bookings</span>
              </div>

              <div className="w-full space-y-2 mt-auto">
                {Object.entries(stats.sports || {}).map(([sport, count]) => (
                  <div
                    key={sport}
                    className={`flex justify-between items-center text-xs p-2.5 rounded-xl transition-all ${selectedSport === sport
                      ? "bg-emerald-500 text-white font-bold shadow-md shadow-emerald-500/20"
                      : "bg-slate-50/80 text-slate-600 border border-slate-100 hover:bg-slate-100"
                      }`}
                  >
                    <span className="font-semibold">{sport}</span>
                    <span className={`px-2 py-0.5 rounded-lg font-bold ${selectedSport === sport ? "bg-emerald-600" : "bg-white text-slate-800 shadow-sm"}`}>
                      {count}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );

  return (
    <div className="space-y-12 py-4">
      {/* Global Summary */}
      <div>
        <h2 className="text-xl font-black text-slate-800 mb-6 px-2">Platform Overview</h2>
        {renderSummaryCards(summaryData)}
      </div>

      {/* Ground-wise Breakdown */}
      {!groundId && groundWiseStats && groundWiseStats.length > 0 && (
        <div className="space-y-6 pt-8 border-t border-slate-100">
          <h2 className="text-xl font-black text-slate-800 px-2">Facility Revenue Breakdown</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {groundWiseStats.map((gw, idx) => (
              <motion.div 
                key={gw.groundId} 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
                className="flex items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-100 shadow-sm"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center text-white shadow-lg shadow-emerald-500/20">
                    <span className="text-xl font-black font-outfit">{gw.groundName.charAt(0)}</span>
                  </div>
                  <div>
                    <h3 className="text-lg font-bold font-outfit text-slate-800 leading-tight">{gw.groundName}</h3>
                    <p className="text-xs font-bold text-slate-400 mt-0.5">{gw.totalBookings} Total Bookings</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-black text-emerald-600">
                    Rs. {gw.totalRevenue.toLocaleString()}
                  </p>
                  <span className="text-[9px] font-black uppercase tracking-widest text-emerald-400">Total Revenue</span>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
