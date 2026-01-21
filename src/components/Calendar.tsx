"use client";

import { useEffect, useState } from "react";
import { XMarkIcon, ChevronLeftIcon, ChevronRightIcon } from "@heroicons/react/24/outline";
import { motion, AnimatePresence } from "framer-motion";

interface Slot {
  timeSlot: string;
  status: "available" | "booked";
}

interface CalendarProps {
  groundId: string;
  groundName?: string;
  isAdmin?: boolean;
  onConfirmBookings?: (bookings: { date: string; times: string[] }[], sport?: string, paymentStatus?: string) => void;
  sports?: string[];
  isEmbedded?: boolean;
}

const daysOfWeek = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export default function Calendar({
  groundId,
  groundName,
  isAdmin = false,
  onConfirmBookings,
  sports = [],
  isEmbedded = false,
}: CalendarProps) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [slots, setSlots] = useState<Slot[]>([]);
  // Store selections as: { "2024-01-20": ["10:00-10:30", "10:30-11:00"], ... }
  const [allSelectedBookings, setAllSelectedBookings] = useState<
    Record<string, string[]>
  >({});
  const [showTimePicker, setShowTimePicker] = useState(false);

  // Admin specific states
  const [selectedSport, setSelectedSport] = useState<string>("");
  const [paymentStatus, setPaymentStatus] = useState<string>("pending");

  // Initialize selectedSport when sports prop changes
  useEffect(() => {
    if (sports.length > 0 && !selectedSport) {
      setSelectedSport(sports[0]);
    }
  }, [sports]);

  // ✅ Fetch available slots for selected date
  useEffect(() => {
    const fetchSlots = async () => {
      if (!selectedDate) return;
      try {
        const res = await fetch(
          `/api/booking?ground=${groundId}&date=${selectedDate}`
        );
        const data = await res.json();
        if (Array.isArray(data)) {
          setSlots(data);
        } else {
          setSlots([]);
        }
      } catch (err) {
        console.error("Failed to load slots", err);
        setSlots([]);
      }
    };
    fetchSlots();
  }, [selectedDate, groundId]);

  const toggleSlot = (timeSlot: string) => {
    if (!selectedDate) return;

    setAllSelectedBookings((prev) => {
      const currentSelection = prev[selectedDate] || [];
      const updatedSelection = currentSelection.includes(timeSlot)
        ? currentSelection.filter((s) => s !== timeSlot)
        : [...currentSelection, timeSlot];

      const newState = { ...prev };
      if (updatedSelection.length > 0) {
        newState[selectedDate] = updatedSelection;
      } else {
        delete newState[selectedDate];
      }
      return newState;
    });
  };

  // ✅ Calendar navigation
  const prevMonth = () =>
    setCurrentDate(
      new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1)
    );
  const nextMonth = () =>
    setCurrentDate(
      new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1)
    );

  const generateCalendar = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const days: (number | null)[] = Array(firstDay).fill(null);
    for (let d = 1; d <= daysInMonth; d++) days.push(d);
    return days;
  };
  const calendarDays = generateCalendar();

  const isPastDate = (day: number) => {
    const today = new Date();
    const date = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth(),
      day
    );
    return (
      date < new Date(today.getFullYear(), today.getMonth(), today.getDate())
    );
  };

  const getDateString = (day: number) => {
    const yyyy = currentDate.getFullYear();
    const mm = (currentDate.getMonth() + 1).toString().padStart(2, "0");
    const dd = day.toString().padStart(2, "0");
    return `${yyyy}-${mm}-${dd}`;
  };

  const handleDateClick = (day: number) => {
    if (!isAdmin && isPastDate(day)) return; // ❌ prevent selecting past days for users
    setSelectedDate(getDateString(day));
    setShowTimePicker(true);
  };

  const isPastTime = (slot: string) => {
    const now = new Date();
    if (!selectedDate) return false;

    const todayStr = now.toISOString().split("T")[0];
    if (selectedDate !== todayStr) return false;

    const [hour, minute] = slot.split("-")[0].split(":").map(Number);
    const slotDate = new Date(selectedDate);
    slotDate.setHours(hour, minute, 0, 0);
    return slotDate < now;
  };

  const handleConfirm = () => {
    const bookingsArray = Object.entries(allSelectedBookings).map(
      ([date, times]) => ({
        date,
        times,
      })
    );

    if (!bookingsArray.length) {
      alert("Please select at least one time slot on any date.");
      return;
    }

    if (onConfirmBookings) {
      // Pass selected sport and payment status if available
      onConfirmBookings(bookingsArray, selectedSport, paymentStatus);
    }
  };

  const totalSlots = Object.values(allSelectedBookings).reduce(
    (acc, times) => acc + times.length,
    0
  );

  return (
    <div className={isEmbedded ? "pb-4" : "mt-10 space-y-8 pb-4"}>
      {/* Premium Calendar Container - Conditional Styles */}
      <div className={isEmbedded ? "" : "glass-card overflow-hidden shadow-2xl"}>
        <div className={isEmbedded ? "" : "p-6 sm:p-10"}>
          <AnimatePresence mode="wait">
            {!showTimePicker ? (
              <motion.div
                key="calendar-view"
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.98 }}
                transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
              >
                <div className="flex items-center justify-between mb-10">
                  <h2 className="text-3xl font-extrabold text-slate-900 font-outfit tracking-tight">
                    {currentDate.toLocaleString("default", { month: "long" })}{" "}
                    {currentDate.getFullYear()}
                  </h2>
                  <div className="flex gap-3">
                    <button
                      onClick={prevMonth}
                      className="w-12 h-12 flex items-center justify-center border-2 border-slate-100 rounded-xl hover:border-emerald-200 hover:bg-emerald-50 transition-all text-slate-600 active:scale-90"
                    >
                      <ChevronLeftIcon className="w-6 h-6" />
                    </button>
                    <button
                      onClick={nextMonth}
                      className="w-12 h-12 flex items-center justify-center border-2 border-slate-100 rounded-xl hover:border-emerald-200 hover:bg-emerald-50 transition-all text-slate-600 active:scale-90"
                    >
                      <ChevronRightIcon className="w-6 h-6" />
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-7 gap-4 mb-2">
                  {daysOfWeek.map((day) => (
                    <div key={day} className="text-center text-[11px] font-black uppercase tracking-[0.2em] text-slate-400 pb-2">
                      {day}
                    </div>
                  ))}
                  {calendarDays.map((day, idx) => {
                    if (!day) return <div key={idx} className="aspect-square" />;
                    const dateStr = getDateString(day);
                    const selectionCount = allSelectedBookings[dateStr]?.length || 0;
                    const isSelected = selectedDate === dateStr;

                    return (
                      <button
                        key={idx}
                        onClick={() => handleDateClick(day)}
                        disabled={isPastDate(day)}
                        className={`relative aspect-square rounded-xl transition-all duration-500 flex flex-col items-center justify-center border-2 group ${isPastDate(day)
                          ? "bg-slate-50 text-slate-200 border-transparent cursor-not-allowed"
                          : isSelected
                            ? "bg-emerald-600 text-white border-emerald-600 shadow-xl shadow-emerald-100 scale-110 z-10"
                            : selectionCount > 0
                              ? "bg-emerald-50 text-emerald-800 border-emerald-200 shadow-sm"
                              : "bg-white text-slate-700 border-slate-100 hover:border-emerald-200 hover:shadow-lg active:scale-95"
                          }`}>
                        <span className="text-base font-bold font-outfit transition-transform group-hover:scale-110">{day}</span>
                        {selectionCount > 0 && !isSelected && (
                          <div className="absolute -top-1.5 -right-1.5 min-w-[1.5rem] h-6 px-1.5 bg-emerald-500 rounded-xl flex items-center justify-center text-[11px] text-white font-black shadow-lg border-2 border-white animate-in zoom-in-50">
                            {selectionCount}
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>

                {totalSlots > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-10 p-6 bg-emerald-50 rounded-xl border border-emerald-100 flex flex-col lg:flex-row items-center justify-between gap-6"
                  >
                    <div className="flex-1 w-full flex flex-col sm:flex-row gap-6 items-center">
                      <div>
                        <p className="text-emerald-900 font-extrabold font-outfit text-lg">
                          {Object.keys(allSelectedBookings).length} Days Selected
                        </p>
                        <p className="text-emerald-600 text-sm font-bold uppercase tracking-wider">
                          {totalSlots} slots ready for checkout
                        </p>
                      </div>

                      {isAdmin && (
                        <div className="flex gap-3 flex-1 w-full sm:w-auto">
                          {/* Sport Selection */}
                          <div className="flex-1">
                            <label className="text-[10px] uppercase font-black tracking-widest text-slate-400 block mb-1">Sport</label>
                            <select
                              value={selectedSport}
                              onChange={(e) => setSelectedSport(e.target.value)}
                              className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm font-bold text-slate-700 focus:outline-none focus:border-emerald-500"
                            >
                              {sports.map(s => (
                                <option key={s} value={s}>{s}</option>
                              ))}
                            </select>
                          </div>

                          {/* Payment Status Selection */}
                          <div className="flex-1">
                            <label className="text-[10px] uppercase font-black tracking-widest text-slate-400 block mb-1">Status</label>
                            <select
                              value={paymentStatus}
                              onChange={(e) => setPaymentStatus(e.target.value)}
                              className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm font-bold text-slate-700 focus:outline-none focus:border-emerald-500"
                            >
                              <option value="pending">Pending</option>
                              <option value="advanced_paid">Advanced</option>
                              <option value="full_paid">Full Paid</option>
                            </select>
                          </div>
                        </div>
                      )}
                    </div>

                    <button
                      onClick={handleConfirm}
                      className="btn-premium px-10 py-3 whitespace-nowrap shadow-xl shadow-emerald-100 w-full sm:w-auto"
                    >
                      <span className="!text-white">Proceed to Booking</span>
                    </button>
                  </motion.div>
                )}
              </motion.div>
            ) : (
              <motion.div
                key="time-picker"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-8"
              >
                <div className="flex items-center justify-between border-b-2 border-slate-50 pb-6">
                  <div>
                    <span className="text-emerald-600 text-xs font-black uppercase tracking-widest block mb-1">Time Availability</span>
                    <h4 className="text-2xl font-extrabold text-slate-900 font-outfit">Slots for {selectedDate}</h4>
                  </div>
                  <button
                    onClick={() => setShowTimePicker(false)}
                    className="p-3 bg-slate-100 hover:bg-emerald-50 rounded-xl transition-all group active:scale-90"
                  >
                    <XMarkIcon className="w-7 h-7 text-slate-400 group-hover:text-emerald-600 transition-colors" />
                  </button>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                  {slots.map(({ timeSlot, status }) => {
                    const dateStr = selectedDate!;
                    const isSelected = (allSelectedBookings[dateStr] || []).includes(timeSlot);
                    const isBooked = status === "booked";
                    const pastTime = isPastTime(timeSlot);

                    // Determine button styles
                    let slotClass = "bg-white border-slate-100 text-slate-600 hover:border-emerald-200 hover:bg-emerald-50/30 hover:shadow-md";

                    if (isBooked) {
                      slotClass = "bg-red-50 border-red-100 text-red-500 cursor-not-allowed opacity-80";
                    } else if (pastTime) {
                      slotClass = "bg-slate-50 border-slate-50 text-slate-300 cursor-not-allowed opacity-60";
                    } else if (isSelected) {
                      slotClass = "bg-emerald-600 border-emerald-600 text-white shadow-xl shadow-emerald-100 scale-[1.03]";
                    }

                    return (
                      <button
                        key={timeSlot}
                        disabled={isBooked || pastTime}
                        onClick={() => toggleSlot(timeSlot)}
                        className={`py-2.5 rounded-xl text-xs font-black tracking-wide border-2 transition-all duration-300 ${slotClass}`}>
                        {timeSlot}
                      </button>
                    );
                  })}
                </div>

                <div className="flex flex-col sm:flex-row items-center justify-between pt-6 border-t border-slate-100 gap-4">
                  <p className="text-xs text-slate-400 font-medium italic">
                    * Multi-date selection is enabled. Tap "Done" to pick more dates.
                  </p>
                  <button
                    onClick={() => setShowTimePicker(false)}
                    className="btn-premium px-12 py-4 w-full sm:w-auto"
                  >
                    <span className="!text-white">Save Selection</span>
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
