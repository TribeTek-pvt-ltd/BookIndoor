"use client";

import { useParams, useRouter } from "next/navigation";
import { JSX, useState } from "react";
import Calendar from "@/components/Calendar";
import {
  WifiIcon,
  UserGroupIcon,
  ShoppingBagIcon,
  TruckIcon,
  HomeIcon,
  PencilSquareIcon,
  TrashIcon,
  MapPinIcon,
  StarIcon,
} from "@heroicons/react/24/solid";

interface Ground {
  id: string;
  name: string;
  location: string;
  sports: { name: string; price: number }[];
  facilities: string[];
  images: string[];
}

// Mock booked slots per sport
const mockBookedSlots: Record<string, string[]> = {
  Badminton: ["2025-10-02 09:00", "2025-10-02 12:00"],
  Futsal: ["2025-10-02 11:00", "2025-10-02 16:00"],
  Basketball: ["2025-10-03 14:00"],
};

// Facility icon mapping
const facilityIcons: Record<string, JSX.Element> = {
  "Locker Room": <UserGroupIcon className="w-5 h-5 text-indigo-500" />,
  Parking: <TruckIcon className="w-5 h-5 text-indigo-500" />,
  Cafeteria: <ShoppingBagIcon className="w-5 h-5 text-indigo-500" />,
  "Wi-Fi": <WifiIcon className="w-5 h-5 text-indigo-500" />,
};

export default function GroundDetails({ role = "User" }: { role?: "Admin" | "User" }) {
  const params = useParams();
  const router = useRouter();

  const id = Array.isArray(params.id) ? params.id[0] : params.id;
  if (!id) return <p className="text-center mt-10 text-red-500">Invalid ground ID</p>;

  const ground: Ground = {
    id,
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

  const [selectedSport, setSelectedSport] = useState<string | null>(null);
  const [currentImage, setCurrentImage] = useState(0);

  const prevImage = () =>
    setCurrentImage((prev) => (prev === 0 ? ground.images.length - 1 : prev - 1));
  const nextImage = () =>
    setCurrentImage((prev) => (prev === ground.images.length - 1 ? 0 : prev + 1));

  return (
    <div className="max-w-6xl mx-auto p-4 sm:p-8 space-y-10">
      {/* Image Carousel */}
      <div className="relative rounded-2xl overflow-hidden shadow-xl">
        <img
          src={ground.images[currentImage]}
          alt={ground.name}
          className="w-full h-80 sm:h-[28rem] object-cover transition-all duration-500"
        />
        {/* Nav Buttons */}
        <button
          onClick={prevImage}
          className="absolute top-1/2 left-4 -translate-y-1/2 bg-white/80 backdrop-blur p-2 rounded-full shadow hover:scale-105 transition"
        >
          ◀
        </button>
        <button
          onClick={nextImage}
          className="absolute top-1/2 right-4 -translate-y-1/2 bg-white/80 backdrop-blur p-2 rounded-full shadow hover:scale-105 transition"
        >
          ▶
        </button>

        {/* Image indicators */}
        <div className="absolute bottom-4 w-full flex justify-center gap-2">
          {ground.images.map((_, i) => (
            <div
              key={i}
              className={`h-2 w-2 rounded-full transition ${
                i === currentImage ? "bg-white" : "bg-white/50"
              }`}
            />
          ))}
        </div>
      </div>

      {/* Ground Info Section */}
      <div className="bg-white/80 backdrop-blur-md shadow-md rounded-2xl p-6 space-y-6">
        <div className="flex flex-col sm:flex-row justify-between gap-6">
          <div>
            <h1 className="text-3xl font-extrabold text-gray-800 flex items-center gap-2">
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
                className="text-indigo-600 hover:underline text-sm"
              >
                View on Map
              </a>
            </p>

            {/* Facilities */}
            <div className="flex flex-wrap gap-3 mt-4">
              {ground.facilities.map((f) => (
                <div
                  key={f}
                  className="flex items-center gap-2 bg-indigo-50 px-4 py-2 rounded-full text-sm font-medium text-gray-700 shadow-sm hover:shadow transition"
                >
                  {facilityIcons[f] || <HomeIcon className="w-5 h-5 text-indigo-500" />}
                  {f}
                </div>
              ))}
            </div>
          </div>

          {role === "Admin" && (
            <div className="flex flex-wrap gap-4 self-start sm:self-center">
              <button className="flex items-center gap-2 px-5 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition font-medium">
                <PencilSquareIcon className="w-5 h-5" /> Edit Ground
              </button>
              <button className="flex items-center gap-2 px-5 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition font-medium">
                <TrashIcon className="w-5 h-5" /> Delete
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Sports Selection */}
      {role === "User" && (
        <div className="bg-white/80 backdrop-blur-md rounded-2xl shadow-md p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">
            Select a Sport to Book
          </h2>
          <div className="flex flex-wrap gap-4">
            {ground.sports.map((s) => (
              <button
                key={s.name}
                onClick={() => setSelectedSport(s.name)}
                className={`px-5 py-3 rounded-xl border font-semibold shadow-sm transition ${
                  selectedSport === s.name
                    ? "bg-indigo-600 text-white border-indigo-600 scale-105"
                    : "bg-gray-50 border-gray-200 hover:bg-indigo-50 hover:border-indigo-400 text-gray-700"
                }`}
              >
                {s.name} <span className="text-gray-500">– Rs {s.price}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Calendar Section */}
      {role === "User" && selectedSport && (
        <div className="bg-white/80 backdrop-blur-md rounded-2xl shadow-md p-6 space-y-4">
          <h2 className="text-xl font-semibold text-gray-800">
            Booking Calendar – {selectedSport}
          </h2>
          <Calendar bookedSlots={mockBookedSlots[selectedSport] || []} groundName={""} />
        </div>
      )}

      
    </div>
  );
}
