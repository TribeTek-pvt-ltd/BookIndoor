"use client";

import { useParams } from "next/navigation";
import { useState } from "react";
import Link from "next/link";
import {
  MapPinIcon,
  StarIcon,
  PencilSquareIcon,
  TrashIcon,
} from "@heroicons/react/24/solid";

import Calendar from "@/components/Calendar"; // ✅ replaced BookingCalendarTab import

interface Ground {
  id: string;
  name: string;
  location: string;
  sports: { name: string; price: number }[];
  facilities: string[];
  images: string[];
}

const mockGround: Ground = {
  id: "1",
  name: "Indoor Arena",
  location: "Colombo",
  sports: [
    { name: "Badminton", price: 1000 },
    { name: "Futsal", price: 2000 },
    { name: "Basketball", price: 2500 },
  ],
  facilities: ["Locker Room", "Parking", "Cafeteria", "Wi-Fi"],
  images: ["/arena1.jpg", "/arena2.jpg", "/arena3.jpg"],
};

const mockBookedSlots: Record<string, string[]> = {
  Badminton: ["2025-10-02 09:00", "2025-10-02 12:00"],
  Futsal: ["2025-10-02 11:00", "2025-10-02 16:00"],
  Basketball: ["2025-10-03 14:00"],
};

export default function AdminGroundDetails() {
  const params = useParams();
  const id = Array.isArray(params.id) ? params.id[0] : params.id;

  const ground = mockGround;
  const [currentImage, setCurrentImage] = useState(0);
  const [selectedSport, setSelectedSport] = useState<string | null>(null);

  const prevImage = () =>
    setCurrentImage((prev) =>
      prev === 0 ? ground.images.length - 1 : prev - 1
    );
  const nextImage = () =>
    setCurrentImage((prev) =>
      prev === ground.images.length - 1 ? 0 : prev + 1
    );

  return (
    <div className="max-w-7xl mx-auto px-6 py-10 space-y-10">
      {/* Image Carousel */}
      <div className="relative rounded-2xl overflow-hidden shadow-lg">
        <img
          src={ground.images[currentImage]}
          alt={ground.name}
          className="w-full h-80 sm:h-[28rem] object-cover transition-all duration-500"
        />
        <button
          onClick={prevImage}
          className="absolute top-1/2 left-4 -translate-y-1/2 bg-white/80 p-2 rounded-full shadow hover:scale-105 transition"
        >
          ◀
        </button>
        <button
          onClick={nextImage}
          className="absolute top-1/2 right-4 -translate-y-1/2 bg-white/80 p-2 rounded-full shadow hover:scale-105 transition"
        >
          ▶
        </button>
      </div>

      {/* Ground Info */}
      <div className="bg-white rounded-2xl shadow-md p-6 flex flex-col sm:flex-row justify-between gap-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
            {ground.name}
            <StarIcon className="w-6 h-6 text-yellow-500" />
          </h1>
          <p className="text-gray-600 mt-2 flex items-center gap-2">
            <MapPinIcon className="w-5 h-5 text-indigo-600" />
            {ground.location}
            <a
              href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                ground.location
              )}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-indigo-600 hover:underline text-sm ml-2"
            >
              View on Map
            </a>
          </p>
          <div className="flex flex-wrap gap-2 mt-4">
            {ground.facilities.map((facility) => (
              <span
                key={facility}
                className="px-4 py-2 bg-indigo-50 text-indigo-700 rounded-full text-sm font-medium"
              >
                {facility}
              </span>
            ))}
          </div>
        </div>

        {/* Admin Controls */}
        <div className="flex gap-3 self-start sm:self-center">
          <Link
            href={`/admin/add-ground?id=${ground.id}`}
            className="flex items-center gap-2 px-4 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition"
          >
            <PencilSquareIcon className="w-5 h-5" />
          </Link>
          <button className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition">
            <TrashIcon className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Sports Selection */}
      <div className="bg-white rounded-2xl shadow-md p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">
          Manage Sport Prices or Availability
        </h2>
        <div className="flex flex-wrap gap-4">
          {ground.sports.map((sport) => (
            <button
              key={sport.name}
              onClick={() => setSelectedSport(sport.name)}
              className={`px-5 py-3 rounded-xl border font-semibold transition ${
                selectedSport === sport.name
                  ? "bg-indigo-600 text-white border-indigo-600 scale-105"
                  : "bg-gray-50 border-gray-200 text-gray-700 hover:bg-indigo-50 hover:border-indigo-400"
              }`}
            >
              {sport.name} – Rs {sport.price}
            </button>
          ))}
        </div>
      </div>

      {/* Calendar Component (Replaced) */}
      <div className="bg-white rounded-2xl shadow-md p-6">
        {selectedSport ? (
          <Calendar
            bookedSlots={mockBookedSlots[selectedSport] || []}
            groundName={`${ground.name} - ${selectedSport}`}
          />
        ) : (
          <p className="text-gray-500 text-center py-6">
            Please select a sport to book the ground.
          </p>
        )}
      </div>
    </div>
  );
}
