"use client";

import { useParams } from "next/navigation";
import { useEffect, useState, JSX } from "react";
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

interface Location {
  address: string;
  lat: number;
  lng: number;
}

interface Sport {
  name: string;
  pricePerHour: number;
}

interface Ground {
  name: string;
  location: Location;
  sports: Sport[];
  amenities: string[];
  images: string[];
  availableTime: {
    from: string;
    to: string;
  };
}

const facilityIcons: Record<string, JSX.Element> = {
  Parking: <TruckIcon className="w-5 h-5 text-green-500" />,
  Lighting: <WifiIcon className="w-5 h-5 text-green-500" />,
  Restrooms: <UserGroupIcon className="w-5 h-5 text-green-500" />,
  Cafeteria: <ShoppingBagIcon className="w-5 h-5 text-green-500" />,
};

export default function UserGroundDetails() {
  const params = useParams();
  const id = Array.isArray(params.id) ? params.id[0] : params.id;

  const [ground, setGround] = useState<Ground | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentImage, setCurrentImage] = useState(0);
  const [selectedSport, setSelectedSport] = useState<string | null>(null);

  useEffect(() => {
    const fetchGround = async () => {
      try {
        const res = await fetch(`/api/grounds/${id}`);
        if (!res.ok) throw new Error("Failed to fetch ground");
        const data: Ground = await res.json();
        setGround(data);
      } catch (err) {
        console.error("Failed to fetch ground:", err);
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchGround();
  }, [id]);

  if (!id)
    return <p className="text-center mt-10 text-red-500">Invalid ground ID</p>;
  if (loading)
    return <p className="text-center mt-10 text-green-500">Loading...</p>;
  if (!ground)
    return <p className="text-center mt-10 text-red-500">Ground not found</p>;

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
          className="absolute top-1/2 left-3 sm:left-4 -translate-y-1/2 bg-white/80 p-2 rounded-full shadow hover:scale-105 transition">
          ◀
        </button>
        <button
          onClick={nextImage}
          className="absolute top-1/2 right-3 sm:right-4 -translate-y-1/2 bg-white/80 p-2 rounded-full shadow hover:scale-105 transition">
          ▶
        </button>
      </div>

      {/* Ground Info */}
      <div
        className={`${glassCardClasses} flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 sm:gap-6`}>
        <div className="flex-1 space-y-3">
          <h1 className="text-2xl sm:text-3xl font-bold text-white flex items-center gap-2">
            {ground.name} <StarIcon className="w-6 h-6 text-yellow-400" />
          </h1>

          <p className="text-green-200 flex items-center gap-2 flex-wrap">
            <MapPinIcon className="w-5 h-5 text-green-400" />
            {ground.location.address}
            <a
              href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                ground.location.address
              )}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-green-300 hover:underline text-sm ml-2">
              View on Map
            </a>
          </p>

          <div className="flex items-center gap-2 text-green-200">
            <ClockIcon className="w-5 h-5 text-green-400" />
            Open Time: {ground.availableTime.from} – {ground.availableTime.to}
          </div>

          {/* Facilities */}
          <div className="flex flex-wrap gap-2 mt-4">
            {ground.amenities.map((facility) => (
              <span
                key={facility}
                className="px-3 py-1.5 sm:px-4 sm:py-2 bg-green-800 text-white rounded-full text-sm sm:text-base font-medium flex items-center gap-1">
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
              }`}>
              {sport.name} – Rs {sport.pricePerHour}
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
            bookedSlots={[]} // replace with actual booked slots from API later
            groundName={`${ground.name} - ${selectedSport}`}
          />
        </div>
      )}
    </div>
  );
}
