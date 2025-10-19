"use client";

import { useState } from "react";

interface BookingSummary {
  groundName: string;
  location: string;
  date: string;
  times: string[];
  groundId: string;
  sportName: string;
}

interface BookingResponse {
  bookingId: string;
  message?: string;
  error?: string;
}

interface PaymentFormProps {
  bookingDetails: BookingSummary;
  amount: number;
  onPaymentSuccess?: (data: BookingResponse) => void;
}

export default function PaymentForm({
  bookingDetails,
  amount,
  onPaymentSuccess,
}: PaymentFormProps) {
  const [userDetails, setUserDetails] = useState({
    name: "",
    phone: "",
    nic: "",
  });

  const [isAdvance, setIsAdvance] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleUserChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setUserDetails((prev) => ({ ...prev, [name]: value }));
  };

  const finalAmount = isAdvance ? amount * 0.5 : amount;

  const toggleAdvancePayment = () => setIsAdvance((prev) => !prev);

  const handleBooking = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!userDetails.name || !userDetails.phone || !userDetails.nic) {
      alert("Please fill in all your details.");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("/api/booking", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ground: bookingDetails.groundId,
          sportName: bookingDetails.sportName,
          guest: {
            name: userDetails.name,
            phone: userDetails.phone,
            nicNumber: userDetails.nic,
          },
          date: bookingDetails.date,
          timeSlots: bookingDetails.times.map((t) => ({ startTime: t })),
          paymentStatus: isAdvance ? "advanced_paid" : "full_paid",
        }),
      });

      const data: BookingResponse = await response.json();

      if (!response.ok) {
        alert(data.error || "Booking failed!");
        setLoading(false);
        return;
      }

      alert(
        `✅ ${
          isAdvance ? "Advance" : "Full"
        } Payment of Rs.${finalAmount.toFixed(2)} successful! Booking ID: ${
          data.bookingId
        }`
      );

      if (onPaymentSuccess) onPaymentSuccess(data);
    } catch (err) {
      console.error("Booking Error:", err);
      alert("Failed to create booking. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="w-full max-w-3xl mx-auto h-[90vh] overflow-y-auto rounded-2xl scrollbar-thin scrollbar-thumb-green-500 scrollbar-track-green-100"
      style={{ scrollBehavior: "smooth" }}
    >
      <form
        onSubmit={handleBooking}
        className="p-8 border border-green-700/30 rounded-2xl space-y-6 bg-green-50/30 shadow-lg"
      >
        {/* Booking Summary */}
        <div className="bg-green-50 p-5 rounded-xl border border-green-200 shadow-inner">
          <h3 className="font-semibold text-green-800 mb-3 text-lg">
            Booking Summary
          </h3>
          <div className="space-y-1 text-green-900">
            <p>
              <span className="font-medium">Ground:</span>{" "}
              {bookingDetails.groundName}
            </p>
            <p>
              <span className="font-medium">Location:</span>{" "}
              {bookingDetails.location}
            </p>
            <p>
              <span className="font-medium">Date:</span> {bookingDetails.date}
            </p>
            <p>
              <span className="font-medium">Time:</span>{" "}
              {bookingDetails.times.join(", ")}
            </p>
            <p>
              <span className="font-medium">Payment Type:</span>{" "}
              {isAdvance ? "Advance (50%)" : "Full"}
            </p>
            <div className="mt-4 text-green-900 font-semibold text-lg text-center">
              Total Amount:{" "}
              <span className="text-green-700">
                Rs.{finalAmount.toFixed(2)}
              </span>
            </div>
          </div>
        </div>

        {/* Advance Payment Toggle */}
        <div className="flex justify-center">
          <button
            type="button"
            onClick={toggleAdvancePayment}
            className={`px-4 py-2 rounded-lg font-semibold transition ${
              isAdvance
                ? "bg-green-700 text-white"
                : "bg-green-100 text-green-700 border border-green-300"
            }`}
          >
            {isAdvance ? "Cancel Advance Payment" : "Pay 50% Advance"}
          </button>
        </div>

        {/* User Details */}
        <div className="space-y-4">
          <div>
            <label className="block text-green-700 font-medium mb-1">
              Full Name
            </label>
            <input
              type="text"
              name="name"
              value={userDetails.name}
              onChange={handleUserChange}
              placeholder="Enter your full name"
              className="w-full border border-gray-300 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-green-600"
            />
          </div>

          <div>
            <label className="block text-green-700 font-medium mb-1">
              Phone Number
            </label>
            <input
              type="tel"
              name="phone"
              value={userDetails.phone}
              onChange={handleUserChange}
              placeholder="Enter your phone number"
              className="w-full border border-gray-300 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-green-600"
            />
          </div>

          <div>
            <label className="block text-green-700 font-medium mb-1">
              NIC / Passport Number
            </label>
            <input
              type="text"
              name="nic"
              value={userDetails.nic}
              onChange={handleUserChange}
              placeholder="Enter your NIC or Passport number"
              className="w-full border border-gray-300 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-green-600"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full mt-4 px-4 py-3 bg-green-700 text-white font-semibold rounded-lg hover:bg-green-800 transition disabled:opacity-50"
        >
          {loading
            ? "Processing..."
            : isAdvance
            ? `Pay Rs.${finalAmount.toFixed(2)} (50% Advance)`
            : `Pay Rs.${finalAmount.toFixed(2)} & Confirm Booking`}
        </button>
      </form>
    </div>
  );
}
