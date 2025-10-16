"use client";
import { motion } from "framer-motion";

export default function AboutSection() {
  return (
    <section className="py-24 px-6 md:px-16 bg-green-900/30 text-center">
      <motion.h2
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="text-4xl font-bold text-green-100 mb-6"
      >
        About BookIndoor
      </motion.h2>
      <motion.p
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="max-w-3xl mx-auto text-lg text-green-200 leading-relaxed"
      >
        BookIndoor is your all-in-one platform for discovering and booking indoor sports facilities. 
        Whether you're looking for a badminton court, a futsal arena, or a basketball hall — 
        we connect players with venues effortlessly. Experience a smoother, faster, and smarter way to play.
      </motion.p>
    </section>
  );
}
