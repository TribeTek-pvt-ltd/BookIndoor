"use client";
import { useEffect, useState } from "react";
import GroundCard, { Ground } from "@/components/GroundCard";

// ✅ Smooth scrolling banner for full-width top section
function GroundBanner({ images }: { images: string[] }) {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrent((prev) => (prev + 1) % images.length);
    }, 3000);
    return () => clearInterval(interval);
  }, [images.length]);

  return (
    <div className="relative w-full h-[60vh] sm:h-[70vh] overflow-hidden shadow-xl">
      {images.map((img, index) => (
        <img
          key={index}
          src={img}
          alt={`Ground ${index}`}
          className={`absolute top-0 left-0 w-full h-full object-cover transition-transform duration-1000 ease-in-out ${
            index === current
              ? "translate-x-0 opacity-100"
              : "translate-x-full opacity-0"
          }`}
        />
      ))}
      {/* Overlay for text visibility */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/20 to-transparent" />
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 text-center text-white drop-shadow-md">
        {/* <h1 className="text-4xl sm:text-5xl font-extrabold">
          Explore Our Grounds
        </h1>
        <p className="text-lg sm:text-xl text-green-200 mt-2">
          Book your perfect spot today!
        </p> */}
      </div>
    </div>
  );
}

export default function UserPage() {
  const [grounds, setGrounds] = useState<Ground[]>([]);

  useEffect(() => {
    const fetchGrounds = async () => {
      try {
        const response = await fetch("/api/grounds", {
          headers: { "Content-Type": "application/json" },
        });
        if (!response.ok) throw new Error("Failed to fetch grounds");

        const data = await response.json();
        const mappedGrounds: Ground[] = data.map((g: any) => ({
          id: g._id,
          name: g.name,
          location:
            typeof g.location === "string"
              ? g.location
              : g.location?.address || "Unknown",
          image: g.images?.[0] || "/placeholder.png",
          sports: g.sports?.map((s: any) => s.name) || [],
        }));

        setGrounds(mappedGrounds);
      } catch (err) {
        console.error("❌ Error fetching grounds:", err);
      }
    };

    fetchGrounds();
  }, []);

  const bannerImages = grounds.map((g) => g.image);

  return (
    <div className="min-h-screen w-full bg-white text-gray-900 flex flex-col overflow-x-hidden">
      {/* ✅ Full-width Banner */}
      {bannerImages.length > 0 && <GroundBanner images={bannerImages} />}

      {/* ✅ Grounds Section */}
      <section className="w-full max-w-[1600px] mx-auto flex-1 px-4 sm:px-8 py-16">
        
        <h1 className="text-4xl sm:text-5xl text-center font-extrabold">
          Explore Our Grounds
        </h1>
        <p className="text-lg sm:text-xl mb-24 text-center text-green-200 mt-2">
          Book your perfect spot today!
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10 justify-items-center">
          {grounds.map((g) => (
            <div
              key={g.id}
              className="">
              <GroundCard key={g.id} ground={g} role={"User"} id={0} />
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
