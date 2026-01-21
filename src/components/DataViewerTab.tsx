"use client";

import React, { useState, useEffect } from "react";
import { UserIcon, MapPinIcon, CalendarDaysIcon, TableCellsIcon, ArrowPathIcon } from "@heroicons/react/24/outline";

interface User {
    _id: string;
    name: string;
    email: string;
    role: string;
    phone?: string;
}

interface Ground {
    _id: string;
    name: string;
    location: string | { address: string };
    sports: { name: string }[];
}

interface Booking {
    _id: string;
    guest?: { name: string; phone: string };
    ground?: { name: string };
    sportName: string;
    date: string;
    status: string;
    paymentStatus: string;
}

type SubTab = "users" | "grounds" | "bookings";

export default function DataViewerTab() {
    const [activeSubTab, setActiveSubTab] = useState<SubTab>("users");
    const [data, setData] = useState<{ users: User[]; grounds: Ground[]; bookings: Booking[] } | null>(null);
    const [loading, setLoading] = useState(true);

    const fetchData = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem("token");
            if (!token) return;

            const res = await fetch(`/api/admin-data?token=${token}`);
            if (!res.ok) throw new Error("Failed to fetch data");

            const result = await res.json();
            setData(result);
        } catch (err) {
            console.error("Error fetching admin data:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center py-24 space-y-4">
                <div className="w-10 h-10 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin"></div>
                <p className="text-slate-400 text-sm font-medium">Synchronizing database records...</p>
            </div>
        );
    }

    if (!data) {
        return (
            <div className="text-center py-20 bg-slate-50 rounded-3xl border-2 border-dashed border-slate-200">
                <p className="text-slate-500 font-medium text-lg">Failed to load database records.</p>
                <button
                    onClick={fetchData}
                    className="mt-4 px-6 py-2 bg-emerald-600 text-white rounded-xl font-bold hover:bg-emerald-700 transition-all"
                >
                    Retry
                </button>
            </div>
        );
    }

    const renderUsersTable = () => (
        <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[700px]">
                <thead>
                    <tr className="bg-slate-50 border-b border-slate-100">
                        <th className="p-4 text-[11px] font-black uppercase tracking-widest text-slate-400">Name</th>
                        <th className="p-4 text-[11px] font-black uppercase tracking-widest text-slate-400">Email</th>
                        <th className="p-4 text-[11px] font-black uppercase tracking-widest text-slate-400">Role</th>
                        <th className="p-4 text-[11px] font-black uppercase tracking-widest text-slate-400">Phone</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                    {data.users.map((user) => (
                        <tr key={user._id} className="hover:bg-slate-50/50 transition-colors">
                            <td className="p-4">
                                <p className="font-bold text-slate-800">{user.name}</p>
                                <p className="text-[10px] text-slate-400 font-bold uppercase">ID: {user._id.slice(-6)}</p>
                            </td>
                            <td className="p-4 text-sm text-slate-600">{user.email}</td>
                            <td className="p-4">
                                <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${user.role === 'super_admin' ? 'bg-purple-50 text-purple-700 border-purple-100' :
                                        user.role === 'admin' ? 'bg-blue-50 text-blue-700 border-blue-100' :
                                            'bg-slate-50 text-slate-700 border-slate-100'
                                    }`}>
                                    {user.role}
                                </span>
                            </td>
                            <td className="p-4 text-sm text-slate-500 font-medium">{user.phone || "N/A"}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );

    const renderGroundsTable = () => (
        <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[700px]">
                <thead>
                    <tr className="bg-slate-50 border-b border-slate-100">
                        <th className="p-4 text-[11px] font-black uppercase tracking-widest text-slate-400">Facility Name</th>
                        <th className="p-4 text-[11px] font-black uppercase tracking-widest text-slate-400">Location</th>
                        <th className="p-4 text-[11px] font-black uppercase tracking-widest text-slate-400">Sports Offered</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                    {data.grounds.map((ground) => (
                        <tr key={ground._id} className="hover:bg-slate-50/50 transition-colors">
                            <td className="p-4">
                                <p className="font-bold text-slate-800">{ground.name}</p>
                                <p className="text-[10px] text-slate-400 font-bold uppercase">ID: {ground._id.slice(-6)}</p>
                            </td>
                            <td className="p-4 text-sm text-slate-600">
                                {typeof ground.location === 'string' ? ground.location : ground.location?.address}
                            </td>
                            <td className="p-4">
                                <div className="flex flex-wrap gap-1.5">
                                    {ground.sports.map((s, i) => (
                                        <span key={i} className="px-2 py-0.5 bg-emerald-50 text-emerald-700 text-[9px] font-black uppercase rounded-md border border-emerald-100">
                                            {s.name}
                                        </span>
                                    ))}
                                </div>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );

    const renderBookingsTable = () => (
        <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[1000px]">
                <thead>
                    <tr className="bg-slate-50 border-b border-slate-100">
                        <th className="p-4 text-[11px] font-black uppercase tracking-widest text-slate-400">Customer</th>
                        <th className="p-4 text-[11px] font-black uppercase tracking-widest text-slate-400">Facility / Sport</th>
                        <th className="p-4 text-[11px] font-black uppercase tracking-widest text-slate-400">Date</th>
                        <th className="p-4 text-[11px] font-black uppercase tracking-widest text-slate-400">Status</th>
                        <th className="p-4 text-[11px] font-black uppercase tracking-widest text-slate-400">Payment</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                    {data.bookings.map((booking) => (
                        <tr key={booking._id} className="hover:bg-slate-50/50 transition-colors">
                            <td className="p-4">
                                <p className="font-bold text-slate-800">{booking.guest?.name || "Member"}</p>
                                <p className="text-[10px] text-slate-400 font-bold tracking-tight">{booking.guest?.phone || "N/A"}</p>
                            </td>
                            <td className="p-4">
                                <p className="text-sm font-bold text-slate-700">{booking.ground?.name || "Unknown"}</p>
                                <p className="text-[10px] text-emerald-600 font-black uppercase">{booking.sportName}</p>
                            </td>
                            <td className="p-4 text-sm text-slate-600 font-medium">{booking.date}</td>
                            <td className="p-4">
                                <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${booking.status === 'confirmed' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' :
                                        'bg-amber-50 text-amber-700 border-amber-100'
                                    }`}>
                                    {booking.status}
                                </span>
                            </td>
                            <td className="p-4">
                                <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${booking.paymentStatus === 'full_paid' ? 'bg-blue-50 text-blue-700 border-blue-100' :
                                        'bg-purple-50 text-purple-700 border-purple-100'
                                    }`}>
                                    {booking.paymentStatus.replace('_', ' ')}
                                </span>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );

    return (
        <div className="space-y-8 animate-fadeIn">
            {/* Sub-tabs Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
                <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-emerald-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-emerald-100">
                        <TableCellsIcon className="w-6 h-6" />
                    </div>
                    <div>
                        <h2 className="text-2xl font-black text-slate-800 tracking-tight">Database Explorer</h2>
                        <p className="text-slate-500 text-sm font-medium">Real-time oversight of platform entities</p>
                    </div>
                </div>

                <button
                    onClick={fetchData}
                    className="p-3 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-xl transition-all border border-slate-100 group"
                >
                    <ArrowPathIcon className="w-5 h-5 group-hover:rotate-180 transition-transform duration-500" />
                </button>
            </div>

            {/* Sub-navigation */}
            <div className="flex gap-2 p-1.5 bg-slate-100 rounded-[1.5rem] w-fit">
                {[
                    { key: "users", label: "Users", icon: UserIcon },
                    { key: "grounds", label: "Grounds", icon: MapPinIcon },
                    { key: "bookings", label: "Bookings", icon: CalendarDaysIcon }
                ].map((tab) => (
                    <button
                        key={tab.key}
                        onClick={() => setActiveSubTab(tab.key as SubTab)}
                        className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold transition-all ${activeSubTab === tab.key
                                ? "bg-white text-emerald-600 shadow-sm"
                                : "text-slate-500 hover:bg-white/50"
                            }`}
                    >
                        <tab.icon className="w-4 h-4" />
                        <span className="text-sm">{tab.label}</span>
                    </button>
                ))}
            </div>

            {/* Table Container */}
            <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden min-h-[500px]">
                <div className="p-8 border-b border-slate-50 bg-slate-50/50 flex items-center justify-between">
                    <h3 className="text-sm font-black uppercase tracking-widest text-slate-400">
                        {activeSubTab} Data Registry
                    </h3>
                    <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full">
                        {activeSubTab === "users" ? data.users.length : activeSubTab === "grounds" ? data.grounds.length : data.bookings.length} Records Found
                    </span>
                </div>

                {activeSubTab === "users" && renderUsersTable()}
                {activeSubTab === "grounds" && renderGroundsTable()}
                {activeSubTab === "bookings" && renderBookingsTable()}

                {(activeSubTab === "users" ? data.users.length : activeSubTab === "grounds" ? data.grounds.length : data.bookings.length) === 0 && (
                    <div className="text-center py-24 px-6">
                        <p className="text-slate-400 font-bold text-lg">No {activeSubTab} records available.</p>
                    </div>
                )}
            </div>
        </div>
    );
}
