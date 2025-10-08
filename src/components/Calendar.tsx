"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

interface CalendarProps {
  bookedSlots?: string[]; // "YYYY-MM-DD HH:mm"
  groundName: string;
  isAdmin?: boolean; // Admin mode
  onSlotClick?: (slot: string) => void; // Callback when admin clicks a booked slot
}

const daysOfWeek = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export default function Calendar({
  bookedSlots = [],
  groundName,
  isAdmin = false,
  onSlotClick,
}: CalendarProps) {
  const router = useRouter();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [selectedTimes, setSelectedTimes] = useState<string[]>([]);
  const [showTimePicker, setShowTimePicker] = useState(false);

  const generateSlots = () => {
    const slots: string[] = [];
    for (let hour = 9; hour <= 23; hour++) {
      slots.push(`${hour.toString().padStart(2, "0")}:00`);
    }
    return slots;
  };

  const slots = generateSlots();

  const prevMonth = () =>
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  const nextMonth = () =>
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));

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
  const bookedForDate = bookedSlots.filter((s) => selectedDate && s.startsWith(selectedDate));

  const toggleSlot = (slot: string) => {
    if (selectedTimes.includes(slot)) {
      setSelectedTimes(selectedTimes.filter((s) => s !== slot));
    } else {
      setSelectedTimes([...selectedTimes, slot]);
    }
  };

  const handleDateClick = (day: number) => {
    const yyyy = currentDate.getFullYear();
    const mm = (currentDate.getMonth() + 1).toString().padStart(2, "0");
    const dd = day.toString().padStart(2, "0");
    setSelectedDate(`${yyyy}-${mm}-${dd}`);
    setSelectedTimes([]);
    setShowTimePicker(true);
  };

  const handleConfirm = () => {
    if (!selectedTimes.length) {
      alert("Please select at least one time slot before confirming.");
      return;
    }

    const query = new URLSearchParams({
      date: selectedDate!,
      times: selectedTimes.join(","),
      ground: groundName,
    }).toString();

    router.push(`/user/booking/payment?${query}`);
  };

  return (
    <div className="mt-6">
      {/* Month Navigation */}
      {!showTimePicker && (
        <>
          <div className="flex justify-between items-center mb-4 px-2 sm:px-0">
            <button
              onClick={prevMonth}
              className="px-3 py-1 rounded bg-indigo-100 hover:bg-indigo-200 text-gray-800 transition"
            >
              Prev
            </button>
            <span className="font-semibold text-gray-800 text-base sm:text-lg">
              {currentDate.toLocaleString("default", { month: "long" })}{" "}
              {currentDate.getFullYear()}
            </span>
            <button
              onClick={nextMonth}
              className="px-3 py-1 rounded bg-indigo-100 hover:bg-indigo-200 text-gray-800 transition"
            >
              Next
            </button>
          </div>

          {/* Calendar Grid */}
          <div className="overflow-x-auto">
            <div className="grid grid-cols-7 gap-2 text-center mb-6 min-w-[350px] sm:min-w-full">
              {daysOfWeek.map((day) => (
                <div key={day} className="font-semibold text-gray-600 text-xs sm:text-sm">
                  {day}
                </div>
              ))}

              {calendarDays.map((day, idx) =>
                day ? (
                  <button
                    key={idx}
                    onClick={() => handleDateClick(day)}
                    className={`px-2 sm:px-4 py-1 sm:py-2 rounded-lg transition text-sm sm:text-base ${
                      selectedDate ===
                      `${currentDate.getFullYear()}-${(currentDate.getMonth() + 1)
                        .toString()
                        .padStart(2, "0")}-${day.toString().padStart(2, "0")}`
                        ? "bg-green-500 text-white shadow-md scale-105"
                        : "hover:bg-green-100 text-gray-800"
                    }`}
                  >
                    {day}
                  </button>
                ) : (
                  <div key={idx}></div>
                )
              )}
            </div>
          </div>
        </>
      )}

      {/* Time Picker */}
      {showTimePicker && selectedDate && (
        <div className="bg-gray-50 rounded-lg p-4 shadow-md mb-6">
          <h4 className="text-lg sm:text-xl font-semibold text-gray-800 mb-3">
            Select Time for {selectedDate}
          </h4>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 sm:gap-3">
            {slots.map((slot) => {
              const fullSlot = `${selectedDate} ${slot}`;
              const isBooked = bookedForDate.includes(fullSlot);
              const isSelected = selectedTimes.includes(slot);

              return (
                <button
                  key={slot}
                  onClick={() =>
                    isBooked && isAdmin
                      ? onSlotClick?.(fullSlot)
                      : !isBooked && toggleSlot(slot)
                  }
                  disabled={!isAdmin && isBooked}
                  className={`px-2 sm:px-3 py-2 rounded-lg text-xs sm:text-sm font-medium transition transform ${
                    isBooked
                      ? isAdmin
                        ? "bg-red-500 text-white shadow-md"
                        : "bg-red-600 text-white cursor-not-allowed opacity-90"
                      : isSelected
                      ? "bg-green-600 text-white shadow-md scale-105"
                      : "bg-white hover:bg-gray-200 text-gray-800"
                  }`}
                  title={isBooked ? "Already booked" : ""}
                >
                  {slot}
                </button>
              );
            })}
          </div>
          <div className="flex justify-end mt-4 sm:mt-6">
            <button
              onClick={handleConfirm}
              className="px-4 sm:px-5 py-2.5 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 transition text-sm sm:text-base"
            >
              Confirm Booking
            </button>
          </div>
        </div>
      )}

      {/* Selected Info */}
      {selectedTimes.length > 0 && !showTimePicker && (
        <p className="mt-2 text-gray-800 font-medium text-sm sm:text-base">
          Selected: {selectedDate} at {selectedTimes.join(", ")}
        </p>
      )}
    </div>
  );
}
