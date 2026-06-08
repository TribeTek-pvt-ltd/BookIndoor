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

  // Text split for word-by-word animation
  const titleText = "Elevate Your Game";
  const words = titleText.split(" ");

  const container = {
    hidden: { opacity: 0 },
    visible: (i = 1) => ({
      opacity: 1,
      transition: { staggerChildren: 0.12, delayChildren: 0.04 * i },
    }),
  };

  const child = {
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        type: "spring" as const,
        damping: 12,
        stiffness: 100,
      },
    },
    hidden: {
      opacity: 0,
      y: 20,
      transition: {
        type: "spring" as const,
        damping: 12,
        stiffness: 100,
      },
    },
  };

  return (
    <section className="relative min-h-screen flex items-center overflow-hidden bg-[#020617]">
      {/* Aurora Background Effect */}
      <div className="absolute top-0 left-1/4 w-[800px] h-[800px] bg-emerald-500/20 rounded-full blur-[120px] mix-blend-screen animate-pulse pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-[600px] h-[600px] bg-teal-500/20 rounded-full blur-[120px] mix-blend-screen animate-pulse pointer-events-none delay-1000" />

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
              className="object-cover brightness-[0.35] contrast-[1.2] mix-blend-luminosity"
              priority={index === 0}
              quality={90}
            />
          </motion.div>
        ))}
        {/* Architectural Overlays */}
        <div className="absolute inset-0 bg-slate-950/60" />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-slate-950/80" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-transparent via-slate-950/50 to-slate-950" />
      </div>

      <div className="container mx-auto px-6 sm:px-12 lg:px-20 relative z-10 w-full grid lg:grid-cols-2 gap-12 lg:gap-8 items-center pt-20">
        <div className="flex flex-col items-start text-left max-w-3xl">
          
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
            className="w-full"
          >
            {/* Discovery Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 backdrop-blur-xl border border-white/10 mb-8 shadow-[0_0_20px_rgba(16,185,129,0.15)]">
              <SparklesIcon className="w-4 h-4 text-emerald-400 animate-pulse" />
              <span className="text-xs font-bold text-white tracking-widest uppercase">The New Standard</span>
            </div>

            {/* Animated Heading */}
            <motion.h1
              className="text-6xl md:text-7xl lg:text-[7.5rem] font-black text-white leading-[0.9] font-outfit tracking-tighter mb-8 drop-shadow-2xl flex flex-wrap gap-x-4"
              variants={container}
              initial="hidden"
              animate="visible"
            >
              {words.map((word, index) => (
                <motion.span variants={child} key={index} className={index === 2 ? "bg-gradient-to-br from-emerald-400 to-teal-200 bg-clip-text text-transparent" : ""}>
                  {word}
                </motion.span>
              ))}
            </motion.h1>

            {/* Premium Text Context */}
            <motion.p 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8, duration: 1 }}
              className="text-sm md:text-lg text-slate-300/90 mb-12 leading-relaxed max-w-xl font-medium drop-shadow-md"
            >
              Book the city&apos;s most elite indoor arenas instantly. 
              Professional-grade facilities, zero friction.
            </motion.p>

            {/* Actions */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1, duration: 0.8 }}
              className="flex flex-col sm:flex-row items-center gap-5 w-full sm:w-auto"
            >
              <Link
                href="/user"
                className="group relative w-full sm:w-auto px-10 py-5 text-lg font-black text-slate-950 rounded-2xl bg-gradient-to-r from-emerald-400 to-emerald-500 hover:from-emerald-300 hover:to-emerald-400 transition-all duration-300 active:scale-95 text-center shadow-[0_20px_40px_-10px_rgba(16,185,129,0.5)] border border-emerald-300/50 overflow-hidden"
              >
                <span className="relative z-10">Find an Arena</span>
                <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-in-out" />
              </Link>
              <Link
                href="#about"
                className="w-full sm:w-auto px-10 py-5 rounded-2xl font-bold text-lg text-white border border-white/10 bg-white/5 hover:bg-white/10 transition-all backdrop-blur-xl text-center active:scale-95 hover:shadow-[0_0_20px_rgba(255,255,255,0.05)]"
              >
                Learn More
              </Link>
            </motion.div>
          </motion.div>
        </div>

        {/* Floating Glass Stats Widget */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9, rotateX: 10 }}
          animate={{ opacity: 1, scale: 1, rotateX: 0 }}
          transition={{ duration: 1, delay: 0.4, ease: [0.22, 1, 0.36, 1] }}
          className="hidden lg:flex justify-end perspective-1000"
        >
          <div className="w-full max-w-sm p-8 bg-slate-900/30 backdrop-blur-3xl border border-white/10 rounded-[2.5rem] shadow-[0_30px_60px_-15px_rgba(0,0,0,0.5)] relative overflow-hidden group hover:border-white/20 transition-all duration-500">
            {/* Inner glow */}
            <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            
            <h3 className="text-white font-outfit font-bold text-xl mb-8 flex items-center gap-2 relative z-10">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              Platform Live Stats
            </h3>
            <div className="space-y-8 relative z-10">
              <div className="flex items-center gap-5">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-500/20 to-emerald-500/5 flex items-center justify-center border border-emerald-500/30 shadow-[inset_0_0_20px_rgba(16,185,129,0.1)]">
                  <TrophyIcon className="w-7 h-7 text-emerald-400" />
                </div>
                <div>
                  <div className="text-3xl font-black text-white font-outfit tracking-tighter">50+</div>
                  <div className="text-xs text-slate-400 font-bold uppercase tracking-[0.2em] mt-1">Premium Arenas</div>
                </div>
              </div>
              <div className="w-full h-px bg-gradient-to-r from-white/10 via-white/5 to-transparent" />
              <div className="flex items-center gap-5">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-500/20 to-blue-500/5 flex items-center justify-center border border-blue-500/30 shadow-[inset_0_0_20px_rgba(59,130,246,0.1)]">
                  <UsersIcon className="w-7 h-7 text-blue-400" />
                </div>
                <div>
                  <div className="text-3xl font-black text-white font-outfit tracking-tighter">10k+</div>
                  <div className="text-xs text-slate-400 font-bold uppercase tracking-[0.2em] mt-1">Active Players</div>
                </div>
              </div>
            </div>
            
            <div className="mt-10 p-5 rounded-2xl bg-white/5 border border-white/5 relative z-10 backdrop-blur-md">
              <div className="flex gap-1 mb-2">
                {[...Array(5)].map((_, i) => (
                  <SparklesIcon key={i} className="w-3 h-3 text-emerald-400" />
                ))}
              </div>
              <p className="text-sm text-slate-300 font-medium italic leading-relaxed">
                &quot;The easiest way to book a turf in the city. Incredible experience.&quot;
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
        <span className="text-[10px] uppercase font-bold text-white/40 tracking-[0.4em]">Scroll to explore</span>
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          className="w-[2px] h-12 bg-gradient-to-b from-emerald-500 to-transparent rounded-full"
        />
      </motion.div>
    </section>
  );
}
