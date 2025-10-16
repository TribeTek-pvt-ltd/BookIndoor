"use client";
import { motion } from "framer-motion";
import Image from "next/image";
import { useEffect, useState } from "react";

export default function HeroSection() {
  // ✅ Only indoor sports grounds
  const images = [
    "https://images.unsplash.com/photo-1574629810360-7efbbe195018?auto=format&fit=crop&w=1920&q=80", // basketball indoor
    "https://images.unsplash.com/photo-1600185365225-4d8c2d1e6a56?auto=format&fit=crop&w=1920&q=80", // badminton court
    "https://images.unsplash.com/photo-1587085128535-cc04f1d1d9b6?auto=format&fit=crop&w=1920&q=80", // multi-sport indoor
    "https://images.unsplash.com/photo-1521412644187-c49fa049e84d?auto=format&fit=crop&w=1920&q=80", // indoor football/turf
  ];

  const [current, setCurrent] = useState(0);

  // Auto-scroll every 5 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrent((prev) => (prev + 1) % images.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [images.length]);

  return (
    <section className="relative h-[70vh] flex flex-col items-center justify-center text-center overflow-hidden">
      {/* Background auto-scroll */}
      <div className="absolute inset-0">
        {images.map((img, index) => (
          <motion.div
            key={index}
            className="absolute inset-0 w-full h-full"
            initial={{ opacity: 0 }}
            animate={{ opacity: index === current ? 1 : 0 }}
            transition={{ duration: 1.5 }}
          >
            <Image
              src={img}
              alt={`Indoor ground ${index + 1}`}
              fill
              className="object-cover brightness-75"
              priority={index === 0}
            />
          </motion.div>
        ))}
        {/* Overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-green-800/60 via-green-700/50 to-green-900/70" />
      </div>

      {/* Hero content */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1 }}
        className="relative z-10 backdrop-blur-xl bg-white/40 border border-white/20 rounded-3xl shadow-2xl p-8 md:p-12 w-[90%] max-w-3xl"
      >
        <h1 className="text-4xl md:text-5xl font-extrabold mb-4 text-green-200 drop-shadow-lg">
          Welcome to <span className="text-white">BookIndoor</span>
        </h1>
        <p className="text-base md:text-lg text-green-100 mb-8 leading-relaxed">
          Discover, book, and play at top indoor sports arenas — all in one place.
          <br />Your game day starts here! 🏸🏀⚽
        </p>
        <a
          href="/user"
          className="inline-block px-8 py-2 bg-green-600 text-white font-semibold rounded-full shadow-lg hover:bg-green-400 hover:scale-105 transition-all duration-300"
        >
          Explore Grounds
        </a>
      </motion.div>

      {/* Glow circles */}
      <div className="absolute w-60 h-60 bg-green-900/20 rounded-full blur-3xl top-10 left-10 animate-pulse" />
      <div className="absolute w-72 h-72 bg-green-300/20 rounded-full blur-3xl bottom-10 right-10 animate-pulse" />
    </section>
  );
}
