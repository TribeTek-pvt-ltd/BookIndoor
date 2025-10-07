"use client";

import React from "react";

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
  const filteredBookings = selectedSport
    ? bookings.filter((b) => b.sport === selectedSport)
    : bookings;

  return (
    <div className="overflow-x-auto bg-white shadow-lg rounded-2xl p-4">
      <h2 className="text-lg font-semibold text-gray-800 mb-4">
        {selectedSport ? `${selectedSport} Bookings` : "All Bookings"}
      </h2>

      <table className="w-full text-sm text-left text-gray-700 border-collapse">
        <thead className="bg-gray-100 text-gray-800">
          <tr>
            <th className="px-4 py-2">Name</th>
            <th className="px-4 py-2">Phone</th>
            <th className="px-4 py-2">NIC/Passport</th>
            <th className="px-4 py-2">Sport</th>
            <th className="px-4 py-2">Date</th>
            <th className="px-4 py-2">Time Slot</th>
            <th className="px-4 py-2">Booking Status</th>
            <th className="px-4 py-2">Payment Status</th>
            <th className="px-4 py-2">Created At</th>
          </tr>
        </thead>
        <tbody>
          {filteredBookings.length > 0 ? (
            filteredBookings.map((booking) => (
              <tr
                key={booking.id}
                className="border-b hover:bg-gray-50 transition duration-150"
              >
                <td className="px-4 py-2">{booking.name}</td>
                <td className="px-4 py-2">{booking.phone}</td>
                <td className="px-4 py-2">{booking.nic}</td>
                <td className="px-4 py-2">{booking.sport}</td>
                <td className="px-4 py-2">{booking.date}</td>
                <td className="px-4 py-2">{booking.timeSlot}</td>

                {/* Booking Status Badge */}
                <td className="px-4 py-2">
                  <span
                    className={`px-3 py-1 text-xs font-semibold rounded-full ${
                      booking.bookingStatus === "Confirmed"
                        ? "bg-green-100 text-green-700"
                        : "bg-yellow-100 text-yellow-700"
                    }`}
                  >
                    {booking.bookingStatus}
                  </span>
                </td>

                {/* Payment Status Badge */}
                <td className="px-4 py-2">
                  <span
                    className={`px-3 py-1 text-xs font-semibold rounded-full ${
                      booking.paymentStatus === "Paid"
                        ? "bg-green-100 text-green-700"
                        : "bg-red-100 text-red-700"
                    }`}
                  >
                    {booking.paymentStatus}
                  </span>
                </td>

                <td className="px-4 py-2 text-gray-500">{booking.createdAt}</td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={9} className="text-center py-6 text-gray-500">
                No bookings found.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
