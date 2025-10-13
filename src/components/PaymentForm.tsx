"use client";

import { useState } from "react";

interface BookingSummary {
  groundName: string;
  location: string;
  date: string;
  times: string[];
}

interface PaymentFormProps {
  bookingDetails: BookingSummary;
  amount: number;
  onPaymentSuccess?: (data: any) => void;
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

  const [cardNumber, setCardNumber] = useState("");
  const [expiry, setExpiry] = useState("");
  const [cvv, setCvv] = useState("");
  const [cardName, setCardName] = useState("");

  const handleUserChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setUserDetails((prev) => ({ ...prev, [name]: value }));
  };

  const handlePayment = (e: React.FormEvent) => {
    e.preventDefault();

    if (!userDetails.name || !userDetails.phone || !userDetails.nic) {
      alert("Please fill in all your details.");
      return;
    }

    if (!cardNumber || !expiry || !cvv || !cardName) {
      alert("Please fill all payment details.");
      return;
    }

    const bookingRecord = {
      ...bookingDetails,
      ...userDetails,
      payment: {
        cardName,
        cardNumber: "**** **** **** " + cardNumber.slice(-4),
        expiry,
        cvv: "***",
        amount,
      },
      bookedAt: new Date().toISOString(),
    };

    console.log("✅ Payment Success:", bookingRecord);
    alert("✅ Payment successful!");

    if (onPaymentSuccess) onPaymentSuccess(bookingRecord);
  };

  return (
    <div className="w-full max-w-3xl mx-auto">
      <form
        onSubmit={handlePayment}
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
              <span className="font-medium">Date:</span>{" "}
              {bookingDetails.date}
            </p>
            <p>
              <span className="font-medium">Time:</span>{" "}
              {bookingDetails.times.join(", ")}
            </p>
            <div className="mt-4 text-green-900 font-semibold text-lg text-center">
              Total Amount:{" "}
              <span className="text-green-700">Rs.{amount.toFixed(2)}</span>
            </div>
          </div>
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
          className="w-full mt-4 px-4 py-3 bg-green-700 text-white font-semibold rounded-lg hover:bg-green-800 transition"
        >
          Pay & Confirm Booking
        </button>
      </form>
    </div>
  );
}
