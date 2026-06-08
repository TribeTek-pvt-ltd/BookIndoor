"use client";
import Image from "next/image";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { MapPinIcon } from "@heroicons/react/24/outline";

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
        // Fallback images if none in DB for visual testing
        if (images.length === 0) {
           setGroundImages([
             "https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=800&q=80",
             "https://images.unsplash.com/photo-1600185365225-4d8c2d1e6a56?w=800&q=80",
             "https://images.unsplash.com/photo-1587085128535-cc04f1d1d9b6?w=800&q=80",
             "https://images.unsplash.com/photo-1521412644187-c49fa049e84d?w=800&q=80",
           ]);
        } else {
           setGroundImages(images);
        }
      } catch (err) {
        console.error(err);
        setGroundImages([
          "https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=800&q=80",
          "https://images.unsplash.com/photo-1600185365225-4d8c2d1e6a56?w=800&q=80",
          "https://images.unsplash.com/photo-1587085128535-cc04f1d1d9b6?w=800&q=80",
          "https://images.unsplash.com/photo-1521412644187-c49fa049e84d?w=800&q=80",
        ]);
      }
    };
    fetchGrounds();
  }, []);

  if (groundImages.length === 0)
    return (
      <section className="py-24 bg-[#020617] text-center">
        <div className="animate-pulse">
          <h2 className="text-3xl font-bold mb-6 text-slate-700">Popular Arenas</h2>
          <p className="text-slate-600">Loading experience...</p>
        </div>
      </section>
    );

  return (
    <section className="py-24 bg-[#020617] overflow-hidden relative">
      <div className="max-w-7xl mx-auto px-6 mb-16 flex flex-col md:flex-row items-end justify-between gap-6">
        <div>
          <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold uppercase tracking-[0.2em] mb-4">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            Top Picks
          </span>
          <h2 className="text-4xl md:text-5xl font-extrabold text-white font-outfit tracking-tighter">
            Trending <span className="text-slate-500">Arenas</span>
          </h2>
        </div>
        <p className="text-slate-400 font-medium max-w-sm">
          Join thousands of athletes playing at the city&apos;s most requested indoor facilities.
        </p>
      </div>

      <div className="relative group">
        {/* Gradient Overlays for seamless edge fade */}
        <div className="absolute inset-y-0 left-0 w-24 md:w-48 bg-gradient-to-r from-[#020617] to-transparent z-10 pointer-events-none" />
        <div className="absolute inset-y-0 right-0 w-24 md:w-48 bg-gradient-to-l from-[#020617] to-transparent z-10 pointer-events-none" />

        <div className="flex overflow-hidden">
          <motion.div
            className="flex gap-8 py-8"
            animate={{ x: ["0%", "-50%"] }}
            transition={{
              repeat: Infinity,
              duration: 50,
              ease: "linear",
            }}
          >
            {[...groundImages, ...groundImages, ...groundImages].map((src, i) => (
              <div 
                key={i} 
                className="relative flex-shrink-0 w-[280px] md:w-[400px] h-[350px] md:h-[450px] rounded-[2.5rem] overflow-hidden shadow-2xl transition-all duration-700 hover:-translate-y-4 hover:shadow-[0_30px_60px_-15px_rgba(16,185,129,0.3)] cursor-pointer group/card"
              >
                <Image
                  src={src}
                  alt={`Arena ${i + 1}`}
                  fill
                  className="object-cover transition-transform duration-1000 group-hover/card:scale-110"
                />
                
                {/* Dark Overlay Gradient */}
                <div className="absolute inset-0 bg-gradient-to-t from-[#020617] via-[#020617]/40 to-transparent opacity-80 group-hover/card:opacity-90 transition-opacity duration-500" />
                
                {/* Information Overlay */}
                <div className="absolute bottom-0 left-0 w-full p-8 translate-y-4 group-hover/card:translate-y-0 transition-transform duration-500">
                  <div className="flex items-center gap-2 mb-3 opacity-0 group-hover/card:opacity-100 transition-opacity duration-500 delay-100">
                    <span className="px-3 py-1 bg-white/20 backdrop-blur-md rounded-full text-xs font-bold text-white uppercase tracking-wider">
                      Premium
                    </span>
                    <span className="px-3 py-1 bg-emerald-500/20 backdrop-blur-md rounded-full text-xs font-bold text-emerald-400 uppercase tracking-wider">
                      Available
                    </span>
                  </div>
                  <h3 className="text-2xl font-bold text-white font-outfit mb-1 drop-shadow-lg">Elite Indoor Turf</h3>
                  <p className="text-slate-300 text-sm font-medium flex items-center gap-1">
                    <MapPinIcon className="w-4 h-4 text-emerald-400" />
                    Downtown District
                  </p>
                </div>
              </div>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
}
