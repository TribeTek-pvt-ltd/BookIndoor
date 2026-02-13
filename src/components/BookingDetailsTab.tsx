"use client";

import React, { useState } from "react";
import { EyeIcon, CalendarIcon } from "@heroicons/react/24/outline";

interface Booking {
  id: number | string;
  name: string;
  phone: string;
  nic: string;
  date: string;
  timeSlot: string;
  bookingStatus: string;
  paymentStatus: string;
  createdAt: string;
  sport: string;
  groundName?: string;
}

interface BookingDetailsTabProps {
  selectedSport?: string;
  groundId?: string;
  bookings?: Booking[];
}

interface APIBooking {
  _id: string;
  guest?: { name: string; phone: string; nicNumber: string };
  date: string;
  timeSlots: { startTime: string }[];
  status: string;
  paymentStatus: string;
  createdAt: string;
  sportName: string;
  ground?: { name: string };
}


export default function BookingDetailsTab({
  selectedSport,
  groundId
}: BookingDetailsTabProps) {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);

  React.useEffect(() => {
    const fetchBookings = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem("token");
        if (!token) return;

        let url = `/api/booking?token=${token}`;
        if (groundId) url += `&ground=${groundId}`;

        const res = await fetch(url);
        if (!res.ok) throw new Error("Failed to fetch bookings");

        const data: APIBooking[] = await res.json();
        const mapped: Booking[] = data.map((b) => ({
          id: b._id,
          name: b.guest?.name || "Member",
          phone: b.guest?.phone || "N/A",
          nic: b.guest?.nicNumber || "N/A",
          date: b.date,
          timeSlot: b.timeSlots.map((ts) => ts.startTime).join(", "),
          bookingStatus: b.status === "confirmed" ? "Confirmed" : "Reserved",
          paymentStatus: b.paymentStatus === "full_paid" ? "Paid" : b.paymentStatus === "advanced_paid" ? "Advanced Paid" : "Pending",
          createdAt: new Date(b.createdAt).toLocaleDateString(),
          sport: b.sportName,
          groundName: b.ground?.name || "Unknown"
        }));
        setBookings(mapped);
      } catch (err) {
        console.error("Error fetching bookings:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchBookings();
  }, [groundId]);

  const filteredBookings = selectedSport
    ? bookings.filter((b) => b.sport === selectedSport)
    : bookings;

  // Group by ground if no specific ground is selected
  const groupedBookings = !groundId
    ? filteredBookings.reduce((acc, b) => {
      const gn = b.groundName || "Other";
      if (!acc[gn]) acc[gn] = [];
      acc[gn].push(b);
      return acc;
    }, {} as Record<string, Booking[]>)
    : null;

  const updatePaymentStatus = async (bookingId: number | string, newStatus: string) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return;

      const backendStatus = newStatus === "Paid" ? "full_paid" : newStatus === "Advanced Paid" ? "advanced_paid" : "pending";

      const res = await fetch(`/api/booking/${bookingId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          token,
          paymentStatus: backendStatus
        }),
      });

      if (!res.ok) throw new Error("Failed to update status");

      // Optimistic update
      setBookings(prev => prev.map(b =>
        b.id === bookingId ? { ...b, paymentStatus: newStatus } : b
      ));

    } catch (err) {
      console.error("Update failed", err);
      alert("Failed to update status");
    }
  };

  const renderBookingsTable = (items: Booking[]) => (
    <div className="overflow-x-auto">
      <table className="w-full text-left border-collapse min-w-[800px]">
        <thead>
          <tr className="bg-slate-50 border-b border-slate-100">
            <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider">
              Customer
            </th>
            <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider">
              Date & Time
            </th>
            <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider">
              Details
            </th>
            <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider">
              Status
            </th>
            <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">
              Action
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-50">
          {items.map((booking) => (
            <tr
              key={booking.id}
              className="hover:bg-slate-50/50 transition-colors group"
            >
              <td className="p-4">
                <p className="font-bold text-slate-900 group-hover:text-emerald-700 transition-colors">
                  {booking.name}
                </p>
                <p className="text-xs text-slate-500 mt-0.5 font-medium">
                  {booking.phone}
                </p>
              </td>
              <td className="p-4">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center text-emerald-600">
                    <CalendarIcon className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="font-bold text-slate-800 text-sm">
                      {booking.date}
                    </p>
                    <p className="text-[10px] text-slate-500 font-bold uppercase tracking-tight">
                      {booking.timeSlot}
                    </p>
                  </div>
                </div>
              </td>
              <td className="p-4">
                <div className="flex flex-col gap-1">
                  <span className="inline-flex items-center w-fit px-2 py-0.5 rounded-md text-[10px] font-bold bg-slate-100 text-slate-600">
                    {booking.sport}
                  </span>
                  {!groundId && (
                    <span className="text-[10px] font-medium text-slate-400 truncate max-w-[120px]">
                      {booking.groundName}
                    </span>
                  )}
                </div>
              </td>
              <td className="p-4">
                <div className="flex flex-col gap-1.5">
                  <span
                    className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold border ${booking.bookingStatus === "Confirmed"
                      ? "bg-emerald-50 text-emerald-700 border-emerald-100"
                      : "bg-amber-50 text-amber-700 border-amber-100"
                      }`}
                  >
                    <span
                      className={`w-1 h-1 rounded-full ${booking.bookingStatus === "Confirmed"
                        ? "bg-emerald-500"
                        : "bg-amber-500"
                        }`}
                    ></span>
                    {booking.bookingStatus}
                  </span>
                  <select
                    value={booking.paymentStatus}
                    onChange={(e) => updatePaymentStatus(booking.id, e.target.value)}
                    onClick={(e) => e.stopPropagation()}
                    className={`px-2 py-0.5 rounded-md text-[9px] font-bold border cursor-pointer focus:outline-none focus:ring-1 focus:ring-emerald-500 ${booking.paymentStatus === "Paid"
                      ? "bg-blue-50 text-blue-700 border-blue-100"
                      : booking.paymentStatus === "Advanced Paid"
                        ? "bg-purple-50 text-purple-700 border-purple-100"
                        : "bg-amber-50 text-amber-700 border-amber-100"
                      }`}
                  >
                    <option value="Pending">Pending</option>
                    <option value="Advanced Paid">Advanced</option>
                    <option value="Paid">Paid</option>
                  </select>
                </div>
              </td>
              <td className="p-4 text-right">
                <button
                  onClick={() => setSelectedBooking(booking)}
                  className="p-2 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-all"
                >
                  <EyeIcon className="w-5 h-5" />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  if (loading) {
    return (
      <div className="flex justify-center items-center py-20">
        <div className="w-10 h-10 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (filteredBookings.length === 0) {
    return (
      <div className="text-center py-20 bg-slate-50 rounded-3xl border-2 border-dashed border-slate-200">
        <p className="text-slate-500 font-medium text-lg">
          No bookings found for the selected criteria.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-12">
      {groupedBookings ? (
        Object.entries(groupedBookings).map(([gn, items]) => (
          <div key={gn} className="space-y-4">
            <div className="flex items-center gap-4 px-2">
              <h3 className="text-lg font-bold text-slate-800">{gn}</h3>
              <div className="h-px flex-1 bg-slate-100"></div>
              <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                {items.length} Reservations
              </span>
            </div>
            <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
              {renderBookingsTable(items)}
            </div>
          </div>
        ))
      ) : (
        <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
          {renderBookingsTable(filteredBookings)}
        </div>
      )}

      {/* Popup Modal */}
      {selectedBooking && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl shadow-2xl p-8 w-full max-w-lg relative animate-fadeIn">
            <button
              onClick={() => setSelectedBooking(null)}
              className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center bg-slate-100 hover:bg-slate-200 text-slate-500 rounded-full transition-colors"
            >
              ✕
            </button>

            <div className="mb-6">
              <span className="px-3 py-1 bg-emerald-100 text-emerald-700 text-[10px] font-bold rounded-full uppercase tracking-widest mb-2 inline-block">
                Booking Details
              </span>
              <h3 className="text-2xl font-bold text-slate-900">
                {selectedBooking.timeSlot}
              </h3>
              <p className="text-slate-500 font-medium">{selectedBooking.date} / {selectedBooking.sport}</p>
            </div>

            <div className="space-y-4 bg-slate-50 p-6 rounded-2xl border border-slate-100">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Customer</label>
                  <p className="font-bold text-slate-800">{selectedBooking.name}</p>
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Phone</label>
                  <p className="font-bold text-slate-800">{selectedBooking.phone}</p>
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">NIC / Passport</label>
                  <p className="font-bold text-slate-800">{selectedBooking.nic}</p>
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Created At</label>
                  <p className="font-bold text-slate-800">{selectedBooking.createdAt}</p>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-200 grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Payment</label>
                  <p className={`font-bold ${selectedBooking.paymentStatus === 'Paid' ? 'text-emerald-600' : 'text-amber-600'}`}>
                    {selectedBooking.paymentStatus}
                  </p>
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Status</label>
                  <p className="font-bold text-slate-800">{selectedBooking.bookingStatus}</p>
                </div>
              </div>
            </div>

            <button
              onClick={() => setSelectedBooking(null)}
              className="w-full mt-6 py-4 bg-slate-900 text-white font-bold rounded-2xl hover:bg-slate-800 transition-colors"
            >
              Close Details
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
