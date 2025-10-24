"use client";
import { useState } from "react";

interface GroundImageCarouselProps {
  images: string[];
}

export default function GroundImageCarousel({
  images,
}: GroundImageCarouselProps) {
  const [currentImage, setCurrentImage] = useState(0);

  const prevImage = () =>
    setCurrentImage((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  const nextImage = () =>
    setCurrentImage((prev) => (prev === images.length - 1 ? 0 : prev + 1));

  return (
    <div className="relative w-full lg:w-1/2 rounded-2xl overflow-hidden shadow-lg">
      <img
        src={images[currentImage]}
        alt="Ground image"
        className="w-full h-64 sm:h-[26rem] object-cover transition-all duration-500"
      />
      <button
        onClick={prevImage}
        className="absolute top-1/2 left-3 sm:left-4 -translate-y-1/2 bg-white/80 p-2 rounded-full shadow hover:scale-105 transition">
        ◀
      </button>
      <button
        onClick={nextImage}
        className="absolute top-1/2 right-3 sm:right-4 -translate-y-1/2 bg-white/80 p-2 rounded-full shadow hover:scale-105 transition">
        ▶
      </button>
    </div>
  );
}
