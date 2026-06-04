"use client";
import Image from "next/image";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";

interface Ground {
  id: string;
  name: string;
  images: string[];
}

export default function GroundsCarousel() {
  const [groundImages, setGroundImages] = useState<string[]>([]);

  useEffect(() => {
    const fetchGrounds = async () => {
      try {
        const res = await fetch("/api/grounds");
        if (!res.ok) throw new Error("Failed to fetch grounds");
        const data: Ground[] = await res.json();
        const images = data.flatMap((ground) => ground.images);
        setGroundImages(images);
      } catch (err) {
        console.error(err);
      }
    };
    fetchGrounds();
  }, []);

  if (groundImages.length === 0)
    return (
      <section className="py-24 bg-white text-center">
        <div className="animate-pulse">
          <h2 className="text-3xl font-bold mb-6 text-slate-200">Popular Arenas</h2>
          <p className="text-slate-100">Loading experience...</p>
        </div>
      </section>
    );

  return (
    <section className="py-16 bg-white overflow-hidden relative">
      <div className="max-w-7xl mx-auto px-6 mb-12 flex flex-col md:flex-row items-end justify-between gap-6">
        <div>
          <span className="text-emerald-600 text-xs font-black uppercase tracking-[0.3em] block mb-3">
            Top Picks
          </span>
          <h2 className="text-4xl md:text-5xl font-extrabold text-slate-900 font-outfit tracking-tighter">
            Recently <span className="text-emerald-500">Booked</span>
          </h2>
        </div>
        <p className="text-slate-500 font-medium max-w-sm">
          Join thousands of athletes playing at the city&apos;s most requested indoor facilities.
        </p>
      </div>

      <div className="relative group">
        {/* Gradient Overlays for smooth edges */}
        <div className="absolute inset-y-0 left-0 w-32 bg-gradient-to-r from-white to-transparent z-10" />
        <div className="absolute inset-y-0 right-0 w-32 bg-gradient-to-l from-white to-transparent z-10" />

        <div className="flex overflow-hidden">
          <motion.div
            className="flex gap-6 py-4"
            animate={{ x: ["0%", "-50%"] }}
            transition={{
              repeat: Infinity,
              duration: 40,
              ease: "linear",
            }}
          >
            {[...groundImages, ...groundImages].map((src, i) => (
              <div key={i} className="relative flex-shrink-0 w-[350px] h-[220px] rounded-[2rem] overflow-hidden shadow-xl hover:shadow-2xl transition-all duration-500">
                <Image
                  src={src}
                  alt={`Arena ${i + 1}`}
                  fill
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
}
