"use client";
import { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import GroundCard, { Ground as BaseGround } from "@/components/GroundCard";
import GroundFilter from "@/components/GroundFilter";

// ✅ Extend the Ground interface to accept string IDs from MongoDB
interface Ground extends BaseGround {
  _id: string;
  id: number;
}

// ✅ Define backend response type
interface BackendGround {
  _id: string;
  name: string;
  location: { address?: string } | string;
  images?: string[];
  sports?: { name: string }[];
}

interface FilterState {
  name: string;
  location: string;
  sport: string;
}

export default function UserPage() {
  const [grounds, setGrounds] = useState<Ground[]>([]);
  const [filters, setFilters] = useState<FilterState>({
    name: "",
    location: "",
    sport: "",
  });
  const router = useRouter();

  useEffect(() => {
    const fetchGrounds = async () => {
      try {
        const response = await fetch("/api/grounds");
        if (!response.ok) throw new Error("Failed to fetch grounds");

        const data: BackendGround[] = await response.json();

        // ✅ Map backend response properly
        const mappedGrounds: Ground[] = data.map((g: BackendGround) => ({
          _id: g._id,
          id: Number(g._id), // Convert string ID to number
          name: g.name,
          location:
            typeof g.location === "string"
              ? g.location
              : g.location?.address || "Unknown",
          image: g.images?.[0] || "/placeholder.png",
          sports: g.sports?.map((s) => s.name) || [],
        }));

        setGrounds(mappedGrounds);
      } catch (err) {
        console.error("❌ Error fetching grounds:", err);
      }
    };

    fetchGrounds();
  }, []);

  // ✅ Extract available sports
  const availableSports = useMemo(() => {
    const sportsSet = new Set<string>();
    grounds.forEach((g) => g.sports?.forEach((s) => sportsSet.add(s)));
    return Array.from(sportsSet);
  }, [grounds]);

  // ✅ Filtering logic
  const filteredGrounds = useMemo(() => {
    return grounds.filter((g) => {
      const matchesName = g.name
        .toLowerCase()
        .includes(filters.name.toLowerCase());
      const matchesLocation = g.location
        .toLowerCase()
        .includes(filters.location.toLowerCase());
      const matchesSport =
        filters.sport === "" || (g.sports && g.sports.includes(filters.sport));
      return matchesName && matchesLocation && matchesSport;
    });
  }, [grounds, filters]);

  // ✅ Logout function
  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    router.push("/login"); // ✅ Redirect to login page
  };

  return (
    <div className="min-h-screen w-full bg-white text-gray-900 flex flex-col overflow-x-hidden">
      {/* ✅ Top bar with Logout button */}

      {/* Page Header */}
      <section className="w-full max-w-[1600px] mx-auto flex-1 px-4 sm:px-8 py-16">
        <div className="text-center mb-12">
          <h1 className="text-4xl sm:text-5xl font-extrabold text-green-800">
            Explore Our Grounds
          </h1>
          <p className="text-lg sm:text-xl text-green-600 mt-2">
            Find and book your perfect indoor ground today!
          </p>
        </div>

        {/* ✅ Filter Section */}
        <GroundFilter
          onFilterChange={(f) => setFilters(f)}
          availableSports={availableSports}
        />

        {/* ✅ Grounds Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10 justify-items-center mt-10">
          {filteredGrounds.length > 0 ? (
            filteredGrounds.map((g) => (
              <GroundCard
                key={
                  g._id?.toString() ||
                  g.id?.toString() ||
                  Math.random().toString()
                }
                ground={g}
                role="User"
                id={g.id}
              />
            ))
          ) : (
            <p className="col-span-full text-center text-gray-500 text-lg">
              No grounds found matching your filters.
            </p>
          )}
        </div>
      </section>
    </div>
  );
}
