"use client";

import Link from "next/link";
import Image from "next/image";

export interface Ground {
  id: number;
  name: string;
  location: string;
  image: string;
  sports?: string[];
  facilities?: string[];
}

interface GroundCardProps {
  id: number;
  ground: Ground;
  role?: "Admin" | "User" | "SuperAdmin";
}

export default function GroundCard({ ground }: GroundCardProps) {
  const link = `/user/ground/${ground.id}`;

  return (
    <div className="bg-white rounded-2xl shadow-lg overflow-hidden w-full max-w-[400px]">
      {/* Image */}
      <div className="relative w-full h-56">
        <Image
          src={ground.image}
          alt={ground.name}
          fill
          className="object-cover"
          sizes="(max-width: 768px) 100vw, 400px"
          priority
        />
        <div className="absolute bottom-0 left-0 w-full bg-gradient-to-t from-black/60 to-transparent p-4">
          <h3 className="text-white text-xl font-bold truncate">{ground.name}</h3>
          <p className="text-gray-200 text-sm flex items-center gap-1">
            📍 {ground.location}
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="p-5 space-y-4">
        {/* Sports Tags */}
        {ground.sports && ground.sports.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {ground.sports.map((sport) => (
              <span
                key={sport}
                className="text-xs font-semibold bg-green-100 text-green-800 px-3 py-1 rounded-full"
              >
                {sport}
              </span>
            ))}
          </div>
        )}

        {/* Facilities */}
        {ground.facilities && ground.facilities.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-2">
            {ground.facilities.map((facility) => (
              <span
                key={facility}
                className="text-xs font-medium bg-gray-100 text-gray-800 px-2 py-1 rounded-full flex items-center gap-1"
              >
                {facility === "Wi-Fi" && "📶"}
                {facility === "Parking" && "🅿️"}
                {facility === "Cafeteria" && "☕"}
                {facility === "Locker Room" && "🧳"}
                {facility}
              </span>
            ))}
          </div>
        )}

        {/* View Details Button */}
        <div className="flex justify-center mt-4">
          <Link
            href={link}
            className="px-6 py-2 bg-green-600 text-white font-semibold rounded-lg shadow hover:bg-green-700 transition"
          >
            View Details
          </Link>
        </div>
      </div>
    </div>
  );
}
