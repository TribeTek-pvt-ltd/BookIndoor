"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

interface CalendarProps {
  groundId: string;
  groundName?: string;
  isAdmin?: boolean;
  onSlotClick?: (slot: string) => void;
}

const daysOfWeek = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export default function Calendar({
  groundId,
  groundName,
  isAdmin = false,
  onSlotClick,
}: CalendarProps) {
  const router = useRouter();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [bookedSlots, setBookedSlots] = useState<string[]>([]);
  const [selectedTimes, setSelectedTimes] = useState<string[]>([]);
  const [showTimePicker, setShowTimePicker] = useState(false);

  // ⏳ fetch booked slots when date changes
  useEffect(() => {
    const fetchBooked = async () => {
      if (!selectedDate) return;
      try {
        const res = await fetch(
          `/api/booking?ground=${groundId}&date=${selectedDate}`
        );
        const data = await res.json();

        if (Array.isArray(data)) {
          const slots = data.flatMap((b) => b.timeSlots);
          setBookedSlots(slots);
        } else {
          setBookedSlots([]);
        }
      } catch (err) {
        console.error("Failed to load bookings", err);
        setBookedSlots([]);
      }
    };
    fetchBooked();
  }, [selectedDate, groundId]);

  const generateSlots = () => {
    const slots: string[] = [];
    for (let hour = 9; hour <= 23; hour++) {
      slots.push(`${hour.toString().padStart(2, "0")}:00`);
    }
    return slots;
  };
  const slots = generateSlots();

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

  const toggleSlot = (slot: string) => {
    setSelectedTimes((prev) =>
      prev.includes(slot) ? prev.filter((s) => s !== slot) : [...prev, slot]
    );
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
      ground: groundId,
      groundName: groundName || "Ground",
    }).toString();

    router.push(`/user/booking/payment?${query}`);
  };

  return (
    <div className="mt-6">
      {!showTimePicker && (
        <>
          <div className="flex justify-between mb-4">
            <button onClick={prevMonth}>Prev</button>
            <span>
              {currentDate.toLocaleString("default", { month: "long" })}{" "}
              {currentDate.getFullYear()}
            </span>
            <button onClick={nextMonth}>Next</button>
          </div>
          <div className="grid grid-cols-7 gap-2 text-center">
            {daysOfWeek.map((day) => (
              <div key={day}>{day}</div>
            ))}
            {calendarDays.map((day, idx) =>
              day ? (
                <button
                  key={idx}
                  onClick={() => handleDateClick(day)}
                  className={`px-2 py-1 rounded-lg ${
                    selectedDate ===
                    `${currentDate.getFullYear()}-${(currentDate.getMonth() + 1)
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

      {showTimePicker && selectedDate && (
        <div className="bg-gray-50 rounded-lg p-4">
          <h4 className="text-lg font-semibold mb-3">
            Select Time for {selectedDate}
          </h4>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
            {slots.map((slot) => {
              const fullSlot = `${selectedDate} ${slot}`;
              const isBooked = bookedSlots.includes(slot);
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
                  className={`px-3 py-2 rounded-lg ${
                    isBooked
                      ? isAdmin
                        ? "bg-red-500 text-white"
                        : "bg-red-600 text-white opacity-70"
                      : isSelected
                      ? "bg-green-600 text-white"
                      : "bg-white"
                  }`}>
                  {slot}
                </button>
              );
            })}
          </div>
          <div className="flex justify-end mt-4">
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
