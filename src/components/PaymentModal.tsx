"use client";

import { XMarkIcon } from "@heroicons/react/24/solid";
import PaymentForm from "@/components/PaymentForm";

interface Location {
  address: string;
}

interface Ground {
  name: string;
  location: Location;
}

interface BookingDetails {
  date: string;
  times: string[];
}

interface PaymentModalProps {
  isOpen: boolean;
  bookingDetails: BookingDetails | null;
  ground: Ground;
  selectedSport: string | null;
  amount: number;
  onClose: () => void;
  onSuccess: () => void;
}

export default function PaymentModal({
  isOpen,
  bookingDetails,
  ground,
  selectedSport,
  amount,
  onClose,
  onSuccess,
}: PaymentModalProps) {
  if (!isOpen || !bookingDetails || !selectedSport) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white rounded-2xl w-11/12 max-w-md p-6 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-700">
          <XMarkIcon className="w-6 h-6" />
        </button>
        <PaymentForm
          bookingDetails={{
            groundId: ground.name, // you can replace with actual groundId
            sportName: selectedSport,
            groundName: ground.name,
            location: ground.location.address,
            date: bookingDetails.date,
            times: bookingDetails.times,
          }}
          amount={amount}
          onPaymentSuccess={onSuccess}
        />
      </div>
    </div>
  );
}
