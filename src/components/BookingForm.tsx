"use client";
import { useState } from "react";

export interface BookingSummary {
  date: string;
  times: string[];
  groundName: string;
}

interface BookingFormProps {
  bookingSummary: BookingSummary;
  onNext: (formData: { name: string; phone: string; nic: string }) => void;
}

export default function BookingForm({ bookingSummary, onNext }: BookingFormProps) {
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    nic: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = () => {
    if (!formData.name || !formData.phone || !formData.nic) {
      alert("Please fill in all fields before proceeding.");
      return;
    }
    onNext(formData);
  };

  return (
    <div className="max-w-lg mx-auto mt-8 p-6 bg-white shadow-lg rounded-lg">
      <h2 className="text-2xl font-semibold mb-6 text-gray-800">Confirm Your Booking</h2>

      {/* Booking Summary */}
      <div className="bg-gray-50 p-4 rounded-lg mb-6 border border-gray-200">
        <h3 className="font-semibold text-gray-700 mb-2">Booking Summary</h3>
        <p>
          <span className="font-medium">Ground:</span> {bookingSummary.groundName}
        </p>
        <p>
          <span className="font-medium">Date:</span> {bookingSummary.date}
        </p>
        <p>
          <span className="font-medium">Time:</span> {bookingSummary.times.join(", ")}
        </p>
      </div>

      {/* Booking Form */}
      <div className="space-y-4">
        <div>
          <label className="block text-gray-700 font-medium mb-1">Full Name</label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            placeholder="Enter your full name"
            className="w-full border border-gray-300 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-gray-700 font-medium mb-1">Phone Number</label>
          <input
            type="tel"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            placeholder="Enter your phone number"
            className="w-full border border-gray-300 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-gray-700 font-medium mb-1">NIC / Passport Number</label>
          <input
            type="text"
            name="nic"
            value={formData.nic}
            onChange={handleChange}
            placeholder="Enter your NIC or Passport number"
            className="w-full border border-gray-300 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      <div className="mt-6 flex justify-end">
        <button
          onClick={handleSubmit}
          className="bg-blue-600 text-white px-5 py-2 rounded-lg hover:bg-blue-700 transition"
        >
          Next
        </button>
      </div>
    </div>
  );
}
