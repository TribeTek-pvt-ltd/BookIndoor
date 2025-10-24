"use client";

import { XMarkIcon } from "@heroicons/react/24/solid";
import Calendar from "@/components/Calendar";

interface CalendarModalProps {
  isOpen: boolean;
  sport: string | null;
  groundId: string;
  groundName: string;
  onClose: () => void;
  onSelectSlot: (date: string, times: string[]) => void;
}

export default function CalendarModal({
  isOpen,
  sport,
  groundId,
  groundName,
  onClose,
  onSelectSlot,
}: CalendarModalProps) {
  if (!isOpen || !sport) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white rounded-2xl w-11/12 max-w-lg p-6 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-700">
          <XMarkIcon className="w-6 h-6" />
        </button>

        <h3 className="text-xl font-semibold mb-4">
          Booking Calendar – {sport}
        </h3>

        <Calendar
          groundId={groundId}
          groundName={groundName}
          onSlotClick={onSelectSlot} // ✅ call parent booking
        />
      </div>
    </div>
  );
}
