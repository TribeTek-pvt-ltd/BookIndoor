"use client";

import React, { useState } from "react";

interface Booking {
  id: number;
  name: string;
  phone: string;
  nic: string;
  date: string;
  timeSlot: string;
  bookingStatus: string;
  paymentStatus: string;
  createdAt: string;
  sport: string;
}

interface BookingDetailsTabProps {
  selectedSport?: string;
  bookings?: Booking[];
}

const defaultBookings: Booking[] = [
  {
    id: 1,
    name: "John Doe",
    phone: "0771234567",
    nic: "123456789V",
    date: "2025-10-05",
    timeSlot: "10:00 AM - 11:00 AM",
    bookingStatus: "Confirmed",
    paymentStatus: "Paid",
    createdAt: "2025-09-28",
    sport: "Badminton",
  },
  {
    id: 2,
    name: "Jane Smith",
    phone: "0719876543",
    nic: "N1234567",
    date: "2025-10-06",
    timeSlot: "02:00 PM - 03:00 PM",
    bookingStatus: "Pending",
    paymentStatus: "Unpaid",
    createdAt: "2025-09-29",
    sport: "Futsal",
  },
];

export default function BookingDetailsTab({
  selectedSport,
  bookings = defaultBookings,
}: BookingDetailsTabProps) {
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);

  const filteredBookings = selectedSport
    ? bookings.filter((b) => b.sport === selectedSport)
    : bookings;

  return (
    <div className="relative space-y-6">
      <h2 className="text-lg font-semibold text-gray-800 mb-4">
        {selectedSport ? `${selectedSport} Bookings` : "All Bookings"}
      </h2>

      {/* Booking Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredBookings.length > 0 ? (
          filteredBookings.map((booking) => (
            <div
              key={booking.id}
              onClick={() => setSelectedBooking(booking)}
              className="cursor-pointer bg-white/60 backdrop-blur-md border border-gray-200 rounded-2xl shadow-md p-5 hover:shadow-lg transition-all duration-200"
            >
              <div className="flex justify-between items-center mb-2">
                <p className="text-sm text-gray-600 font-medium">
                  {booking.date}
                </p>
                <span
                  className={`px-3 py-1 text-xs font-semibold rounded-full ${
                    booking.bookingStatus === "Confirmed"
                      ? "bg-green-100 text-green-700"
                      : "bg-yellow-100 text-yellow-700"
                  }`}
                >
                  {booking.bookingStatus}
                </span>
              </div>

              <p className="text-gray-800 font-semibold text-base mb-1">
                {booking.timeSlot}
              </p>

              <p className="text-sm text-gray-500">
                Sport: <span className="font-medium">{booking.sport}</span>
              </p>
            </div>
          ))
        ) : (
          <p className="text-center text-gray-500 py-8">No bookings found.</p>
        )}
      </div>

      {/* Popup Modal */}
      {selectedBooking && (
        <div className="fixed inset-0 bg-white/10 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white backdrop-blur-lg border border-white/30 rounded-2xl shadow-2xl p-6 w-full max-w-lg relative">
            <button
              onClick={() => setSelectedBooking(null)}
              className="absolute top-3 right-3 text-white bg-red-500 hover:bg-red-600 rounded-full p-1 px-2 text-sm transition"
            >
              ✕
            </button>

            <h3 className="text-xl font-semibold text-white mb-4 text-center">
              Booking Details
            </h3>

            <div className="text-sm space-y-2 text-gray-100">
              <p>
                <span className="font-semibold">Name:</span>{" "}
                {selectedBooking.name}
              </p>
              <p>
                <span className="font-semibold">Phone:</span>{" "}
                {selectedBooking.phone}
              </p>
              <p>
                <span className="font-semibold">NIC/Passport:</span>{" "}
                {selectedBooking.nic}
              </p>
              <p>
                <span className="font-semibold">Sport:</span>{" "}
                {selectedBooking.sport}
              </p>
              <p>
                <span className="font-semibold">Date:</span>{" "}
                {selectedBooking.date}
              </p>
              <p>
                <span className="font-semibold">Time Slot:</span>{" "}
                {selectedBooking.timeSlot}
              </p>
              <p>
                <span className="font-semibold">Booking Status:</span>{" "}
                <span
                  className={`px-2 py-1 rounded text-xs font-medium ${
                    selectedBooking.bookingStatus === "Confirmed"
                      ? "bg-green-200 text-green-800"
                      : "bg-yellow-200 text-yellow-800"
                  }`}
                >
                  {selectedBooking.bookingStatus}
                </span>
              </p>
              <p>
                <span className="font-semibold">Payment Status:</span>{" "}
                <span
                  className={`px-2 py-1 rounded text-xs font-medium ${
                    selectedBooking.paymentStatus === "Paid"
                      ? "bg-green-200 text-green-800"
                      : "bg-red-200 text-red-800"
                  }`}
                >
                  {selectedBooking.paymentStatus}
                </span>
              </p>
              <p>
                <span className="font-semibold">Created At:</span>{" "}
                {selectedBooking.createdAt}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
