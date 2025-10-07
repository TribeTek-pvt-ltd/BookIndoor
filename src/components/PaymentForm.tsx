"use client";
import { BookingSummary } from "./BookingForm";
import { useState } from "react";

interface PaymentFormProps {
  amount: number;
  bookingSummary: BookingSummary & { name: string; phone: string; nic: string };
  onPaymentSuccess: (data: any) => void; // callback to store booking
}

export default function PaymentForm({ amount, bookingSummary, onPaymentSuccess }: PaymentFormProps) {
  const [cardNumber, setCardNumber] = useState("");
  const [expiry, setExpiry] = useState("");
  const [cvv, setCvv] = useState("");
  const [cardName, setCardName] = useState("");

  const handlePayment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!cardNumber || !expiry || !cvv || !cardName) {
      alert("Please fill all payment details");
      return;
    }

    // Create a booking record
    const bookingRecord = {
      ...bookingSummary,
      payment: {
        cardName,
        cardNumber: "**** **** **** " + cardNumber.slice(-4), // mask card number
        expiry,
        cvv: "***", // mask CVV
        amount,
      },
      bookedAt: new Date().toISOString(),
    };

    // Pass data to parent
    onPaymentSuccess(bookingRecord);

    alert("Payment successful!");
  };

  return (
    <div className="max-w-lg mx-auto mt-8 p-6 bg-white shadow-lg rounded-lg">
      <h2 className="text-2xl font-semibold mb-6 text-gray-800">Payment Details</h2>

      {/* Booking Summary */}
      <div className="bg-gray-50 p-4 rounded-lg mb-6 border border-gray-200">
        <h3 className="font-semibold text-gray-700 mb-2">Booking Summary</h3>
        <p><span className="font-medium">Name:</span> {bookingSummary.name}</p>
        <p><span className="font-medium">Phone:</span> {bookingSummary.phone}</p>
        <p><span className="font-medium">NIC/Passport:</span> {bookingSummary.nic}</p>
        <p><span className="font-medium">Ground:</span> {bookingSummary.groundName}</p>
        <p><span className="font-medium">Date:</span> {bookingSummary.date}</p>
        <p><span className="font-medium">Time:</span> {bookingSummary.times.join(", ")}</p>
      </div>

      {/* Payment Gateway Form */}
      <form onSubmit={handlePayment} className="space-y-4">
        <div>
          <label className="block text-gray-700 font-medium mb-1">Cardholder Name</label>
          <input
            type="text"
            value={cardName}
            onChange={(e) => setCardName(e.target.value)}
            placeholder="John Doe"
            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-gray-700 font-medium mb-1">Card Number</label>
          <input
            type="text"
            value={cardNumber}
            onChange={(e) => setCardNumber(e.target.value)}
            placeholder="1234 5678 9012 3456"
            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="flex gap-4">
          <div className="flex-1">
            <label className="block text-gray-700 font-medium mb-1">Expiry</label>
            <input
              type="text"
              value={expiry}
              onChange={(e) => setExpiry(e.target.value)}
              placeholder="MM/YY"
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="flex-1">
            <label className="block text-gray-700 font-medium mb-1">CVV</label>
            <input
              type="password"
              value={cvv}
              onChange={(e) => setCvv(e.target.value)}
              placeholder="123"
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        <div className="mt-4 text-gray-700 font-medium">
          Total Amount: <span className="text-green-600 font-semibold">Rs.{amount.toFixed(2)}</span>
        </div>

        <button
          type="submit"
          className="w-full mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition shadow"
        >
          Pay Now
        </button>
      </form>
    </div>
  );
}
