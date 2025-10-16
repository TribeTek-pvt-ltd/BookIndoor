"use client";
import Image from "next/image";
import { motion } from "framer-motion";

const groundImages = [
  "/images/indoor1.jpg",
  "/images/indoor2.jpg",
  "/images/indoor3.jpg",
  "/images/indoor4.jpg",
  "/images/indoor5.jpg",
  "/images/indoor6.jpg",
];

export default function GroundsCarousel() {
  return (
    <section className="py-20 bg-green-900/30 overflow-hidden">
      <h2 className="text-center text-3xl font-bold text-green-100 mb-10">
        Popular Indoor Grounds
      </h2>

      <div className="relative flex overflow-x-hidden">
        <motion.div
          className="flex gap-8"
          animate={{ x: ["0%", "-50%"] }}
          transition={{
            repeat: Infinity,
            duration: 25,
            ease: "linear",
          }}
        >
          {[...groundImages, ...groundImages].map((src, i) => (
            <div key={i} className="flex-shrink-0">
              <Image
                src={src}
                alt={`Ground ${i + 1}`}
                width={400}
                height={250}
                className="rounded-2xl shadow-lg object-cover"
              />
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
