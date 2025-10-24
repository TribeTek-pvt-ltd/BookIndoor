"use client";
import {
  MapPinIcon,
  ClockIcon,
  WifiIcon,
  UserGroupIcon,
  ShoppingBagIcon,
  TruckIcon,
  HomeIcon,
} from "@heroicons/react/24/solid";
import { JSX } from "react/jsx-dev-runtime";

interface Location {
  address: string;
  lat: number;
  lng: number;
}

interface Ground {
  name: string;
  location: Location;
  amenities: string[];
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

export default function GroundInfoCard({ ground }: { ground: Ground }) {
  return (
    <div className="bg-white/10 backdrop-blur-md border border-green-900/30 rounded-2xl shadow-lg p-6 flex-1 flex flex-col justify-center space-y-4">
      <h1 className="text-2xl sm:text-3xl font-bold text-green-100 flex items-center gap-2">
        {ground.name}
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

      <div className="flex flex-wrap gap-2 mt-4">
        {ground.amenities.map((facility) => (
          <span
            key={facility}
            className="px-3 py-1.5 sm:px-4 sm:py-2 bg-green-700 text-white rounded-full text-sm sm:text-base font-medium flex items-center gap-1">
            {facilityIcons[facility] || (
              <HomeIcon className="w-5 h-5 text-green-400" />
            )}
            {facility}
          </span>
        ))}
      </div>
    </div>
  );
}
