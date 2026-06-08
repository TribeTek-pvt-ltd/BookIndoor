"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { MapPinIcon, ArrowRightIcon, CheckCircleIcon } from "@heroicons/react/24/solid";

export interface Ground {
  _id: string;
  name: string;
  location: string;
  image: string;
  sports?: string[];
  facilities?: string[];
}

interface GroundCardProps {
  id?: number;
  ground: Ground;
  role?: "admin" | "user" | "super_admin";
  onClick?: () => void;
}

export default function GroundCard({ ground, role = "user", onClick }: GroundCardProps) {
  const link = `/user/ground/${ground._id}`;

  return (
    <div
      className="bg-white rounded-[2rem] overflow-hidden w-full max-w-[420px] flex flex-col group h-full relative shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 transition-all duration-500 hover:-translate-y-2 hover:shadow-[0_20px_40px_-15px_rgba(16,185,129,0.3)] perspective-1000"
    >
      {/* Image Container with 3D Image Hover */}
      <div className="relative w-full h-56 sm:h-64 overflow-hidden rounded-t-[2rem]">
        <Image
          src={ground.image}
          alt={ground.name}
          fill
          className="object-cover transition-transform duration-1000 group-hover:scale-110"
          sizes="(max-width: 768px) 100vw, 420px"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/20 to-transparent opacity-60 group-hover:opacity-80 transition-opacity duration-500" />
        
        {/* Floating Verified Badge */}
        <div className="absolute top-4 right-4 bg-white/20 backdrop-blur-md rounded-full px-3 py-1 flex items-center gap-1.5 border border-white/30 shadow-lg z-10">
          <CheckCircleIcon className="w-3.5 h-3.5 text-emerald-400" />
          <span className="text-[10px] font-bold text-white uppercase tracking-wider drop-shadow-sm">Verified</span>
        </div>

        {/* Glassmorphic Tags Panel floating inside image */}
        <div className="absolute bottom-4 left-4 right-4 z-10">
          <div className="flex flex-wrap gap-2 mb-2">
             {ground.sports && ground.sports.slice(0, 3).map((sport) => (
                <span
                  key={sport}
                  className="text-[10px] sm:text-xs uppercase tracking-wider font-black bg-white/20 backdrop-blur-md text-white px-3 py-1 rounded-full border border-white/20 shadow-sm"
                >
                  {sport}
                </span>
             ))}
          </div>
          <p className="text-emerald-100 text-xs sm:text-sm flex items-center gap-1.5 font-medium truncate drop-shadow-md">
            <MapPinIcon className="w-4 h-4 text-emerald-400 flex-shrink-0" />
            {ground.location}
          </p>
        </div>
      </div>

      {/* Content Area */}
      <div className="p-6 flex-1 flex flex-col bg-white relative z-10">
        
        <h3 className="text-2xl font-black text-slate-900 font-outfit mb-4 truncate group-hover:text-emerald-600 transition-colors">
          {ground.name}
        </h3>

        {/* Facilities Preview */}
        {ground.facilities && ground.facilities.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-6">
            {ground.facilities.slice(0, 4).map((facility) => (
              <span
                key={facility}
                className="text-[11px] font-semibold bg-slate-50 text-slate-600 px-3 py-1.5 rounded-xl border border-slate-100 flex items-center gap-1.5"
              >
                {facility === "Wi-Fi" && <span className="text-[10px]">📶</span>}
                {facility === "Parking" && <span className="text-[10px]">🅿️</span>}
                {facility === "Cafeteria" && <span className="text-[10px]">☕</span>}
                {facility}
              </span>
            ))}
          </div>
        )}

        <div className="mt-auto pt-4">
          {onClick ? (
            <button
              onClick={onClick}
              className="w-full py-4 px-6 rounded-2xl font-black uppercase tracking-widest text-sm bg-slate-900 text-white flex items-center justify-center gap-3 group/btn hover:bg-slate-800 transition-all duration-300 active:scale-95 shadow-md"
            >
              <span>{role === "admin" ? "Manage Ground" : "Select Arena"}</span>
              <ArrowRightIcon className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
            </button>
          ) : (
            <Link
              href={link}
              className="w-full py-4 px-6 rounded-2xl font-black uppercase tracking-widest text-sm bg-emerald-500 text-white flex items-center justify-center gap-3 group/btn hover:bg-emerald-400 transition-all duration-300 active:scale-95 shadow-[0_10px_20px_-5px_rgba(16,185,129,0.4)] hover:shadow-[0_15px_25px_-5px_rgba(16,185,129,0.5)] border border-emerald-400/50"
            >
              <span>Book Arena</span>
              <ArrowRightIcon className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
