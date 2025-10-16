"use client";

import { useEffect, useState } from "react";

interface Slot {
  timeSlot: string;
  status: "available" | "booked";
}

interface CalendarProps {
  groundId: string;
  groundName?: string;
  isAdmin?: boolean;
  onSlotClick?: (date: string, times: string[]) => void;
}

const daysOfWeek = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export default function Calendar({
  groundId,
  groundName,
  isAdmin = false,
  onSlotClick,
}: CalendarProps) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [slots, setSlots] = useState<Slot[]>([]);
  const [selectedTimes, setSelectedTimes] = useState<string[]>([]);
  const [showTimePicker, setShowTimePicker] = useState(false);

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

  // ✅ Toggle selected slot
  const toggleSlot = (timeSlot: string) => {
    setSelectedTimes((prev) =>
      prev.includes(timeSlot)
        ? prev.filter((s) => s !== timeSlot)
        : [...prev, timeSlot]
    );
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

  const handleDateClick = (day: number) => {
    if (isPastDate(day)) return; // ❌ prevent selecting past days
    const yyyy = currentDate.getFullYear();
    const mm = (currentDate.getMonth() + 1).toString().padStart(2, "0");
    const dd = day.toString().padStart(2, "0");
    setSelectedDate(`${yyyy}-${mm}-${dd}`);
    setSelectedTimes([]);
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
    if (!selectedTimes.length) {
      alert("Please select at least one time slot.");
      return;
    }
    if (selectedDate && onSlotClick) {
      onSlotClick(selectedDate, selectedTimes);
    }
  };

  return (
    <div className="mt-6">
      {/* Calendar View */}
      {!showTimePicker && (
        <>
          <div className="flex justify-between mb-4">
            <button onClick={prevMonth} className="px-2 py-1 border rounded">
              Prev
            </button>
            <span className="font-semibold">
              {currentDate.toLocaleString("default", { month: "long" })}{" "}
              {currentDate.getFullYear()}
            </span>
            <button onClick={nextMonth} className="px-2 py-1 border rounded">
              Next
            </button>
          </div>

          <div className="grid grid-cols-7 gap-2 text-center">
            {daysOfWeek.map((day) => (
              <div key={day} className="font-semibold">
                {day}
              </div>
            ))}
            {calendarDays.map((day, idx) =>
              day ? (
                <button
                  key={idx}
                  onClick={() => handleDateClick(day)}
                  disabled={isPastDate(day)}
                  className={`px-2 py-1 rounded-lg transition ${
                    isPastDate(day)
                      ? "bg-gray-200 text-gray-500 cursor-not-allowed"
                      : selectedDate ===
                        `${currentDate.getFullYear()}-${(
                          currentDate.getMonth() + 1
                        )
                          .toString()
                          .padStart(2, "0")}-${day.toString().padStart(2, "0")}`
                      ? "bg-green-500 text-white"
                      : "hover:bg-green-100"
                  }`}>
                  {day}
                </button>
              ) : (
                <div key={idx}></div>
              )
            )}
          </div>
        </>
      )}

      {/* Time Picker View */}
      {showTimePicker && selectedDate && (
        <div className="bg-gray-50 rounded-lg p-4">
          <h4 className="text-lg font-semibold mb-3">
            Select Time for {selectedDate}
          </h4>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
            {slots.map(({ timeSlot, status }) => {
              const isSelected = selectedTimes.includes(timeSlot);
              const isBooked = status === "booked";
              const pastTime = isPastTime(timeSlot);

              return (
                <button
                  key={timeSlot}
                  onClick={() =>
                    !isBooked && !pastTime ? toggleSlot(timeSlot) : null
                  }
                  disabled={isBooked || pastTime}
                  className={`px-3 py-2 rounded-lg text-sm transition ${
                    isBooked
                      ? "bg-red-600 text-white opacity-70 cursor-not-allowed"
                      : pastTime
                      ? "bg-gray-300 text-gray-600 cursor-not-allowed"
                      : isSelected
                      ? "bg-green-600 text-white"
                      : "bg-white hover:bg-green-100 border"
                  }`}>
                  {timeSlot}
                </button>
              );
            })}
          </div>
          <div className="flex justify-end mt-4 space-x-2">
            <button
              onClick={() => {
                setShowTimePicker(false);
                setSelectedDate(null);
              }}
              className="px-4 py-2 bg-gray-300 rounded-lg">
              Back
            </button>
            <button
              onClick={handleConfirm}
              className="px-4 py-2 bg-green-600 text-white rounded-lg">
              Confirm Booking
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
