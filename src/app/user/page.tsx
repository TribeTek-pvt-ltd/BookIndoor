"use client";
import { useEffect, useState } from "react";
import GroundCard from "@/components/GroundCard";

export default function UserPage() {
  const [grounds, setGrounds] = useState<any[]>([]);

  useEffect(() => {
    const defaultGrounds = [
      {
        id: 1,
        name: "Arena Hub",
        location: "Colombo",
        image: "/arena.jpg",
        sports: ["Badminton", "Futsal"],
      },
      {
        id: 2,
        name: "Indoor Sports Hub",
        location: "Kandy",
        image: "/hub.jpg",
        sports: ["Basketball", "Volleyball"],
      },
    ];

    const stored = JSON.parse(localStorage.getItem("grounds") || "[]");
    setGrounds([...defaultGrounds, ...stored]);
  }, []);

  return (
    <section className="max-w-6xl mx-auto px-6 py-10">
      <h2 className="text-3xl font-bold mb-8 text-indigo-700 text-center">
        Available Grounds
      </h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10 justify-items-center">
        {grounds.map((g) => (
          <GroundCard key={g.id} ground={g} />
        ))}
      </div>
    </section>
  );
}
