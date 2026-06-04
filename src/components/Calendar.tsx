"use client";

import { useEffect, useState, useMemo, useCallback } from "react";
import { XMarkIcon, ChevronLeftIcon, ChevronRightIcon } from "@heroicons/react/24/outline";
import { motion, AnimatePresence } from "framer-motion";
import { api } from "@/lib/api-client";

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

const DAYS_OF_WEEK = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export default function Calendar({
  groundId,
  isAdmin = false,
  onConfirmBookings,
  sports = [],
  isEmbedded = false,
}: CalendarProps) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [slots, setSlots] = useState<Slot[]>([]);
  const [allSelectedBookings, setAllSelectedBookings] = useState<Record<string, string[]>>({});
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [selectedSport, setSelectedSport] = useState<string>("");
  const [paymentStatus, setPaymentStatus] = useState<string>("pending");

  useEffect(() => {
    if (sports && sports.length > 0 && !selectedSport) {
      setSelectedSport(sports[0]);
    }
  }, [sports, selectedSport]);

  const fetchSlots = useCallback(async () => {
    if (!selectedDate) return;
    try {
      const data: any = await api.get(`/api/booking`, { params: { ground: groundId, date: selectedDate } });
      setSlots(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Failed to load slots", err);
      setSlots([]);
    }
  }, [selectedDate, groundId]);

  useEffect(() => {
    fetchSlots();
  }, [fetchSlots]);

  const toggleSlot = (timeSlot: string) => {
    if (!selectedDate) return;
    setAllSelectedBookings((prev) => {
      const dateBookings = prev[selectedDate] || [];
      const updated = dateBookings.includes(timeSlot)
        ? dateBookings.filter((t) => t !== timeSlot)
        : [...dateBookings, timeSlot];

      return {
        ...prev,
        [selectedDate]: updated,
      };
    });
  };

  const calendarDays = useMemo(() => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const days: (number | null)[] = Array(firstDay).fill(null);
    for (let d = 1; d <= daysInMonth; d++) days.push(d);
    return days;
  }, [currentDate]);

  const isPastDate = useCallback((day: number) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
    return date < today;
  }, [currentDate]);

  const getDateString = useCallback((day: number) => {
    const yyyy = currentDate.getFullYear();
    const mm = (currentDate.getMonth() + 1).toString().padStart(2, "0");
    const dd = day.toString().padStart(2, "0");
    return `${yyyy}-${mm}-${dd}`;
  }, [currentDate]);

  const handleDateClick = (day: number) => {
    if (!isAdmin && isPastDate(day)) return;
    setSelectedDate(getDateString(day));
    setShowTimePicker(true);
  };

  const isPastTime = useCallback((slot: string) => {
    if (!slot) return false;
    const now = new Date();
    if (!selectedDate) return false;
    const todayStr = now.toISOString().split("T")[0];
    if (selectedDate !== todayStr) return false;

    const timeParts = slot.split("-")?.[0]?.split(":");
    if (!timeParts || timeParts.length < 2) return false;
    const [hour, minute] = timeParts.map(Number);

    const slotDate = new Date(selectedDate);
    slotDate.setHours(hour, minute, 0, 0);
    return slotDate < now;
  }, [selectedDate]);

  const totalSlots = useMemo(() => 
    Object.values(allSelectedBookings).reduce((acc, times) => acc + times.length, 0)
  , [allSelectedBookings]);

  return (
    <div className={isEmbedded ? "pb-4" : "mt-8 space-y-8 pb-4"}>
      <div className={isEmbedded ? "" : "glass-card overflow-hidden"}>
        <div className={isEmbedded ? "" : "p-6 sm:p-10"}>
          <AnimatePresence mode="wait">
            {!showTimePicker ? (
              <motion.div
                key="calendar-view"
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.98 }}
                transition={{ duration: 0.4 }}
              >
                <div className="flex items-center justify-between mb-8">
                  <h2 className="text-2xl sm:text-3xl font-black text-slate-800 font-outfit tracking-tight">
                    {currentDate.toLocaleString("default", { month: "long" })} <span className="text-emerald-500">{currentDate.getFullYear()}</span>
                  </h2>
                  <div className="flex gap-2 sm:gap-3">
                    <button onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1))} className="w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center bg-white border border-slate-200 rounded-xl hover:border-emerald-300 hover:bg-emerald-50 hover:text-emerald-600 transition-all active:scale-95 shadow-sm"><ChevronLeftIcon className="w-5 h-5 sm:w-6 sm:h-6" /></button>
                    <button onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1))} className="w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center bg-white border border-slate-200 rounded-xl hover:border-emerald-300 hover:bg-emerald-50 hover:text-emerald-600 transition-all active:scale-95 shadow-sm"><ChevronRightIcon className="w-5 h-5 sm:w-6 sm:h-6" /></button>
                  </div>
                </div>

                <div className="grid grid-cols-7 gap-2 sm:gap-4 mb-2">
                  {DAYS_OF_WEEK.map(day => <div key={day} className="text-center text-[10px] sm:text-[11px] font-bold uppercase tracking-[0.2em] text-slate-400 pb-2">{day}</div>)}
                  {calendarDays.map((day, idx) => {
                    if (!day) return <div key={idx} className="aspect-square" />;
                    const dateStr = getDateString(day);
                    const selectionCount = allSelectedBookings[dateStr]?.length || 0;
                    const isSelected = selectedDate === dateStr;
                    const past = !isAdmin && isPastDate(day);

                    return (
                      <button
                        key={idx}
                        onClick={() => handleDateClick(day)}
                        disabled={past}
                        className={`relative aspect-square rounded-2xl transition-all duration-300 flex flex-col items-center justify-center border group ${
                          past 
                            ? "bg-slate-50/50 text-slate-300 border-transparent cursor-not-allowed" 
                            : isSelected 
                              ? "bg-emerald-500 text-white border-emerald-500 shadow-lg shadow-emerald-500/30 scale-105 z-10" 
                              : selectionCount > 0 
                                ? "bg-emerald-50 text-emerald-700 border-emerald-200 shadow-sm" 
                                : "bg-white text-slate-700 border-slate-100 hover:border-emerald-300 hover:shadow-md"
                        }`}>
                        <span className="text-sm sm:text-lg font-bold font-outfit">{day}</span>
                        {selectionCount > 0 && !isSelected && (
                          <div className="absolute -top-1 -right-1 min-w-[1.25rem] sm:min-w-[1.5rem] h-5 sm:h-6 px-1 sm:px-1.5 bg-emerald-500 rounded-full flex items-center justify-center text-[9px] sm:text-[11px] text-white font-black shadow-md border-2 border-white">
                            {selectionCount}
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>

                {totalSlots > 0 && (
                  <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mt-10 p-6 sm:p-8 bg-gradient-to-br from-emerald-50 to-teal-50/50 rounded-2xl border border-emerald-100 flex flex-col lg:flex-row items-center justify-between gap-6 shadow-sm">
                    <div className="flex-1 w-full flex flex-col sm:flex-row gap-6 items-center">
                      <div className="text-center sm:text-left">
                        <p className="text-emerald-900 font-black font-outfit text-xl">{Object.keys(allSelectedBookings).length} Days Selected</p>
                        <p className="text-emerald-600/80 text-xs font-bold uppercase tracking-widest mt-1">{totalSlots} slots ready for checkout</p>
                      </div>
                      {isAdmin && (
                        <div className="flex gap-4 flex-1 w-full sm:w-auto mt-4 sm:mt-0">
                          <div className="flex-1">
                            <label className="text-[10px] uppercase font-bold tracking-widest text-emerald-700/70 block mb-1.5">Sport</label>
                            <select value={selectedSport} onChange={(e) => setSelectedSport(e.target.value)} className="w-full px-4 py-2.5 bg-white border border-emerald-100 rounded-xl text-sm font-bold text-slate-700 focus:outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-500/20 shadow-sm transition-all">
                              {sports.map(s => <option key={s} value={s}>{s}</option>)}
                            </select>
                          </div>
                          <div className="flex-1">
                            <label className="text-[10px] uppercase font-bold tracking-widest text-emerald-700/70 block mb-1.5">Status</label>
                            <select value={paymentStatus} onChange={(e) => setPaymentStatus(e.target.value)} className="w-full px-4 py-2.5 bg-white border border-emerald-100 rounded-xl text-sm font-bold text-slate-700 focus:outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-500/20 shadow-sm transition-all">
                              <option value="pending">Pending</option>
                              <option value="advanced_paid">Advanced</option>
                              <option value="full_paid">Full Paid</option>
                            </select>
                          </div>
                        </div>
                      )}
                    </div>
                    <button onClick={() => onConfirmBookings?.(Object.entries(allSelectedBookings).map(([date, times]) => ({ date, times })), selectedSport, paymentStatus)} className="btn-premium px-8 py-3.5 shadow-lg shadow-emerald-500/20 w-full sm:w-auto">
                      <span className="!text-white tracking-wide">Proceed to Booking</span>
                    </button>
                  </motion.div>
                )}
              </motion.div>
            ) : (
              <motion.div key="time-picker" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-8">
                <div className="flex items-center justify-between border-b border-slate-100 pb-6">
                  <div>
                    <span className="text-emerald-500 text-[10px] font-black uppercase tracking-widest block mb-1.5">Time Availability</span>
                    <h4 className="text-2xl sm:text-3xl font-black text-slate-800 font-outfit">Select Slots for {selectedDate}</h4>
                  </div>
                  <button onClick={() => setShowTimePicker(false)} className="w-10 h-10 flex items-center justify-center bg-slate-50 border border-slate-200 hover:bg-slate-100 hover:text-slate-600 rounded-xl transition-all active:scale-95 text-slate-400"><XMarkIcon className="w-6 h-6" /></button>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 max-h-[350px] overflow-y-auto pr-2 custom-scrollbar">
                  {slots.map(({ timeSlot, status }) => {
                    const isSelected = (allSelectedBookings[selectedDate!] || []).includes(timeSlot);
                    const isBooked = status === "booked";
                    const pastTime = isPastTime(timeSlot);

                    return (
                      <button
                        key={timeSlot}
                        disabled={isBooked || pastTime}
                        onClick={() => toggleSlot(timeSlot)}
                        className={`py-3 sm:py-3.5 rounded-xl text-xs sm:text-sm font-bold tracking-wide border transition-all duration-300 ${
                          isBooked 
                            ? "bg-slate-50 border-slate-100 text-slate-400 cursor-not-allowed opacity-70 line-through decoration-slate-300" 
                            : pastTime 
                              ? "bg-slate-50/50 border-transparent text-slate-300 cursor-not-allowed opacity-50" 
                              : isSelected 
                                ? "bg-emerald-500 border-emerald-500 text-white shadow-md shadow-emerald-500/20 scale-[1.02]" 
                                : "bg-white border-slate-200 text-slate-700 hover:border-emerald-300 hover:bg-emerald-50/50 hover:shadow-sm"
                        }`}>
                        {timeSlot}
                      </button>
                    );
                  })}
                </div>

                <div className="flex flex-col sm:flex-row items-center justify-between pt-8 border-t border-slate-100 gap-6">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    <p className="text-xs text-slate-500 font-medium">Multi-date selection enabled.</p>
                  </div>
                  <button onClick={() => setShowTimePicker(false)} className="btn-premium px-10 py-3.5 w-full sm:w-auto shadow-lg shadow-emerald-500/20">
                    <span className="!text-white tracking-wide">Save Selection</span>
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

