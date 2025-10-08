"use client";

import { useParams } from "next/navigation";
import { useState, JSX } from "react";
import {
  WifiIcon,
  UserGroupIcon,
  ShoppingBagIcon,
  TruckIcon,
  HomeIcon,
  MapPinIcon,
  StarIcon,
  ClockIcon,
} from "@heroicons/react/24/solid";
import Calendar from "@/components/Calendar";

interface Ground {
  id: string;
  name: string;
  location: string;
  sports: { name: string; price: number }[];
  facilities: string[];
  images: string[];
  openTime: string;
  closeTime: string;
}

const mockGround: Ground = {
  id: "1",
  name: "Indoor Arena",
  location: "Colombo",
  openTime: "08:00 AM",
  closeTime: "10:00 PM",
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

const facilityIcons: Record<string, JSX.Element> = {
  "Locker Room": <UserGroupIcon className="w-5 h-5 text-green-500" />,
  Parking: <TruckIcon className="w-5 h-5 text-green-500" />,
  Cafeteria: <ShoppingBagIcon className="w-5 h-5 text-green-500" />,
  "Wi-Fi": <WifiIcon className="w-5 h-5 text-green-500" />,
};

export default function UserGroundDetails() {
  const params = useParams();
  const id = Array.isArray(params.id) ? params.id[0] : params.id;
  if (!id)
    return <p className="text-center mt-10 text-red-500">Invalid ground ID</p>;

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

  const glassCardClasses =
    "bg-green-100/20 backdrop-blur-md border border-green-700/30 rounded-2xl shadow-lg p-6";

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-10 space-y-8 sm:space-y-10">
      {/* Image Carousel */}
      <div className="relative rounded-2xl overflow-hidden shadow-lg">
        <img
          src={ground.images[currentImage]}
          alt={ground.name}
          className="w-full h-60 sm:h-[28rem] object-cover transition-all duration-500"
        />
        <button
          onClick={prevImage}
          className="absolute top-1/2 left-3 sm:left-4 -translate-y-1/2 bg-white/80 p-2 rounded-full shadow hover:scale-105 transition"
        >
          ◀
        </button>
        <button
          onClick={nextImage}
          className="absolute top-1/2 right-3 sm:right-4 -translate-y-1/2 bg-white/80 p-2 rounded-full shadow hover:scale-105 transition"
        >
          ▶
        </button>
      </div>

      {/* Ground Info */}
      <div
        className={`${glassCardClasses} flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 sm:gap-6`}
      >
        <div className="flex-1 space-y-3">
          <h1 className="text-2xl sm:text-3xl font-bold text-white flex items-center gap-2">
            {ground.name} <StarIcon className="w-6 h-6 text-yellow-400" />
          </h1>

          <p className="text-green-200 flex items-center gap-2 flex-wrap">
            <MapPinIcon className="w-5 h-5 text-green-400" />
            {ground.location}
            <a
              href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                ground.location
              )}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-green-300 hover:underline text-sm ml-2"
            >
              View on Map
            </a>
          </p>

          {/* ✅ Open Time Display */}
          <div className="flex items-center gap-2 text-green-200">
            <p className="text-green-200 mt-2 flex items-center gap-2">
            <ClockIcon className="w-5 h-5 text-green-400" />
            Open Time: {ground.openTime} – {ground.closeTime}
          </p>
          </div>

          {/* Facilities */}
          <div className="flex flex-wrap gap-2 mt-4">
            {ground.facilities.map((facility) => (
              <span
                key={facility}
                className="px-3 py-1.5 sm:px-4 sm:py-2 bg-green-800 text-white rounded-full text-sm sm:text-base font-medium flex items-center gap-1"
              >
                {facilityIcons[facility] || (
                  <HomeIcon className="w-5 h-5 text-green-500" />
                )}
                {facility}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Sports Selection */}
      <div className={glassCardClasses}>
        <h2 className="text-lg sm:text-xl font-semibold text-white mb-4">
          Select a Sport to Book
        </h2>
        <div className="flex flex-wrap gap-3 sm:gap-4">
          {ground.sports.map((sport) => (
            <button
              key={sport.name}
              onClick={() => setSelectedSport(sport.name)}
              className={`px-4 py-2 sm:px-5 sm:py-3 rounded-xl border font-semibold text-sm sm:text-base transition ${
                selectedSport === sport.name
                  ? "bg-green-600 text-white border-green-600 scale-105"
                  : "bg-white text-green-900 border-green-600 hover:bg-green-100 hover:text-green-900"
              }`}
            >
              {sport.name} – Rs {sport.price}
            </button>
          ))}
        </div>
      </div>

      {/* Booking Calendar */}
      {selectedSport && (
        <div className={glassCardClasses}>
          <div className="flex justify-center mb-4 border-b border-green-700 pb-2">
            <h3 className="text-lg sm:text-xl text-white font-medium">
              Booking Calendar – {selectedSport}
            </h3>
          </div>
          <Calendar
            bookedSlots={mockBookedSlots[selectedSport] || []}
            groundName={`${ground.name} - ${selectedSport}`}
          />
        </div>
      )}
    </div>
  );
}
