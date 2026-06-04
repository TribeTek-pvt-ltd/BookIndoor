"use client";
import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { SparklesIcon, TrophyIcon, UsersIcon } from "@heroicons/react/24/solid";

const IMAGES = [
  "https://images.unsplash.com/photo-1574629810360-7efbbe195018?auto=format&fit=crop&w=1920&q=80",
  "https://images.unsplash.com/photo-1600185365225-4d8c2d1e6a56?auto=format&fit=crop&w=1920&q=80",
  "https://images.unsplash.com/photo-1587085128535-cc04f1d1d9b6?auto=format&fit=crop&w=1920&q=80",
  "https://images.unsplash.com/photo-1521412644187-c49fa049e84d?auto=format&fit=crop&w=1920&q=80",
];

export default function HeroSection() {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrent((prev) => (prev + 1) % IMAGES.length);
    }, 6000);
    return () => clearInterval(interval);
  }, []);

  return (
    <section className="relative min-h-screen flex items-center overflow-hidden bg-slate-950">
      {/* Background Slideshow with Premium Depth */}
      <div className="absolute inset-0">
        {IMAGES.map((img, index) => (
          <motion.div
            key={img}
            className="absolute inset-0 w-full h-full"
            initial={{ opacity: 0, scale: 1.05 }}
            animate={{
              opacity: index === current ? 1 : 0,
              scale: index === current ? 1 : 1.05
            }}
            transition={{ duration: 2.5, ease: "easeInOut" }}
          >
            <Image
              src={img}
              alt="Premium Arena"
              fill
              className="object-cover brightness-[0.4] contrast-[1.2]"
              priority={index === 0}
              quality={90}
            />
          </motion.div>
        ))}
        {/* Architectural Overlays */}
        <div className="absolute inset-0 bg-slate-950/50" />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-slate-950/80" />
      </div>

      <div className="container mx-auto px-6 sm:px-12 lg:px-20 relative z-10 w-full grid lg:grid-cols-2 gap-12 lg:gap-8 items-center pt-20">
        <div className="flex flex-col items-start text-left max-w-3xl">
          
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
          >
            {/* Discovery Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-md border border-white/20 mb-8">
              <SparklesIcon className="w-4 h-4 text-emerald-400" />
              <span className="text-xs font-bold text-white tracking-widest uppercase">The New Standard</span>
            </div>

            {/* Heading */}
            <h1 className="text-6xl md:text-7xl lg:text-[7.5rem] font-black text-white leading-[0.9] font-outfit tracking-tighter mb-8 drop-shadow-2xl">
              Elevate <br />
              Your <span className="bg-gradient-to-r from-emerald-400 to-teal-300 bg-clip-text text-transparent">Game</span>
            </h1>

            {/* Premium Text Context */}
            <p className="text-sm md:text-lg text-slate-300 mb-12 leading-relaxed max-w-xl font-medium drop-shadow-md">
              Book the city&apos;s most elite indoor arenas instantly. 
              Professional-grade facilities, zero friction.
            </p>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row items-center gap-5 w-full sm:w-auto">
              <Link
                href="/user"
                className="w-full sm:w-auto px-10 py-5 text-lg font-black text-slate-950 rounded-2xl bg-gradient-to-r from-emerald-400 to-emerald-500 hover:from-emerald-300 hover:to-emerald-400 transition-all duration-300 active:scale-95 text-center shadow-[0_20px_40px_-10px_rgba(16,185,129,0.5)] border border-emerald-300/50"
              >
                Find an Arena
              </Link>
              <Link
                href="#about"
                className="w-full sm:w-auto px-10 py-5 rounded-2xl font-bold text-lg text-white border border-white/20 bg-white/5 hover:bg-white/10 transition-all backdrop-blur-md text-center active:scale-95"
              >
                Learn More
              </Link>
            </div>
          </motion.div>
        </div>

        {/* Floating Glass Stats Widget */}
        <motion.div
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 1, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
          className="hidden lg:flex justify-end"
        >
          <div className="w-full max-w-sm glass-card p-8 bg-slate-900/40 backdrop-blur-2xl border-white/10 rounded-[2rem]">
            <h3 className="text-white font-outfit font-bold text-xl mb-6">Platform Stats</h3>
            <div className="space-y-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 flex items-center justify-center border border-emerald-500/30">
                  <TrophyIcon className="w-6 h-6 text-emerald-400" />
                </div>
                <div>
                  <div className="text-2xl font-black text-white font-outfit">50+</div>
                  <div className="text-xs text-slate-400 font-bold uppercase tracking-wider">Premium Arenas</div>
                </div>
              </div>
              <div className="w-full h-px bg-gradient-to-r from-white/10 to-transparent" />
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-blue-500/20 flex items-center justify-center border border-blue-500/30">
                  <UsersIcon className="w-6 h-6 text-blue-400" />
                </div>
                <div>
                  <div className="text-2xl font-black text-white font-outfit">10k+</div>
                  <div className="text-xs text-slate-400 font-bold uppercase tracking-wider">Active Players</div>
                </div>
              </div>
            </div>
            
            <div className="mt-8 p-4 rounded-xl bg-gradient-to-br from-emerald-500/10 to-teal-500/10 border border-emerald-500/20">
              <p className="text-sm text-emerald-100 font-medium italic">
                "The easiest way to book a turf in the city. Incredible experience."
              </p>
            </div>
          </div>
        </motion.div>
      </div>
      
      {/* Scroll indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2, duration: 1 }}
        className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-3 z-20"
      >
        <span className="text-[10px] uppercase font-bold text-white/40 tracking-[0.4em]">Scroll</span>
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          className="w-px h-12 bg-gradient-to-b from-emerald-500/80 to-transparent"
        />
      </motion.div>
    </section>
  );
}
