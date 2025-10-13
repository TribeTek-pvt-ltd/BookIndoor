"use client";
import Image from "next/image";
import { motion } from "framer-motion";

export default function HomePage() {
  return (
    <section className="relative w-full h-screen flex flex-col items-center justify-center overflow-hidden text-white">
      

      {/* Refined Green Overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-green-800/60 via-green-700/50 to-green-900/70 z-0" />

      {/* Glass Content Box */}
      <motion.div
        initial={{ opacity: 0, y: 50, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 1 }}
        className="relative z-10 backdrop-blur-xl bg-white/10 border border-white/20 
                   rounded-3xl shadow-2xl p-10 md:p-14 w-[90%] max-w-3xl text-center"
      >
        <h1 className="text-5xl md:text-6xl font-extrabold mb-6 text-green-200 drop-shadow-lg">
          Welcome to <span className="text-white">BookIndoor</span>
        </h1>

        <p className="text-lg md:text-xl text-green-100 mb-10 leading-relaxed">
          Discover, book, and play at top indoor sports arenas — all in one place.
          <br />Your game day starts here! 🏸🏀⚽
        </p>

        <a
          href="/user"
          className="inline-block px-10 py-3 bg-green-600 text-white font-semibold 
                     rounded-full shadow-lg hover:bg-green-400 hover:scale-105 
                     transition-all duration-300"
        >
          Explore Grounds
        </a>
      </motion.div>

      {/* Decorative Glow Circles */}
      <div className="absolute w-72 h-72 bg-green-900/15 rounded-full blur-3xl top-10 left-10 animate-pulse" />
      <div className="absolute w-80 h-80 bg-green-300/15 rounded-full blur-3xl bottom-10 right-10 animate-pulse" />
    </section>
  );
}
