"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { MapPinIcon, ArrowRightIcon, CheckCircleIcon } from "@heroicons/react/24/outline";

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
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      className="glass-card overflow-hidden w-full max-w-[400px] flex flex-col group h-full relative"
    >
      {/* Image Container */}
      <div className="relative w-full h-48 sm:h-56 overflow-hidden">
        <Image
          src={ground.image}
          alt={ground.name}
          fill
          className="object-cover transition-opacity duration-700"
          sizes="(max-width: 768px) 100vw, 400px"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-900/40 to-transparent opacity-80" />
        
        {/* Floating Verified Badge (Example) */}
        <div className="absolute top-4 right-4 bg-white/20 backdrop-blur-md rounded-full px-3 py-1 flex items-center gap-1.5 border border-white/30 shadow-lg">
          <CheckCircleIcon className="w-3.5 h-3.5 text-emerald-400" />
          <span className="text-[10px] font-bold text-white uppercase tracking-wider">Verified</span>
        </div>
        
        {/* Name overlaid on image for premium look */}
        <div className="absolute bottom-4 left-4 right-4">
          <h3 className="text-xl sm:text-2xl font-black text-white font-outfit mb-1 drop-shadow-md truncate">
            {ground.name}
          </h3>
          <p className="text-emerald-100/90 text-xs sm:text-sm flex items-center gap-1.5 font-medium truncate drop-shadow-md">
            <MapPinIcon className="w-4 h-4 text-emerald-400 flex-shrink-0" />
            {ground.location}
          </p>
        </div>
      </div>

      {/* Content Area */}
      <div className="p-5 flex-1 flex flex-col space-y-5 bg-white relative z-10">
        
        {/* Available Sports */}
        {ground.sports && ground.sports.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Sports Available</h4>
            <div className="flex flex-wrap gap-2">
              {ground.sports.slice(0, 3).map((sport) => (
                <span
                  key={sport}
                  className="text-[10px] sm:text-xs uppercase tracking-wider font-bold bg-slate-100 text-slate-600 px-2.5 py-1 rounded-md border border-slate-200"
                >
                  {sport}
                </span>
              ))}
              {ground.sports.length > 3 && (
                <span className="text-[10px] sm:text-xs text-emerald-600 font-bold self-center px-1">
                  +{ground.sports.length - 3} more
                </span>
              )}
            </div>
          </div>
        )}

        {/* Facilities Preview */}
        {ground.facilities && ground.facilities.length > 0 && (
          <div className="hidden sm:flex flex-wrap gap-2 pt-2 border-t border-slate-100">
            {ground.facilities.slice(0, 3).map((facility) => (
              <span
                key={facility}
                className="text-[11px] font-semibold bg-emerald-50 text-emerald-700 px-2.5 py-1 rounded-full border border-emerald-100/50 flex items-center gap-1.5"
              >
                {facility === "Wi-Fi" && <span className="text-[10px]">📶</span>}
                {facility === "Parking" && <span className="text-[10px]">🅿️</span>}
                {facility === "Cafeteria" && <span className="text-[10px]">☕</span>}
                {facility}
              </span>
            ))}
          </div>
        )}

        <div className="pt-2 mt-auto">
          {onClick ? (
            <button
              onClick={onClick}
              className="w-full h-12 btn-premium flex items-center justify-center gap-2 group/btn"
            >
              <span className="!text-white text-sm font-black uppercase tracking-widest">
                {role === "admin" ? "Manage Ground" : "Select Arena"}
              </span>
              <ArrowRightIcon className="w-4 h-4 !text-white" />
            </button>
          ) : (
            <Link
              href={link}
              className="w-full h-12 btn-premium flex items-center justify-center gap-2 group/btn"
            >
              <span className="!text-white text-sm font-black uppercase tracking-widest">
                Book Arena
              </span>
              <ArrowRightIcon className="w-4 h-4 !text-white" />
            </Link>
          )}
        </div>
      </div>
    </motion.div>
  );
}
