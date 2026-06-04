"use client";
import { useEffect, useState, useMemo } from "react";
import GroundCard, { Ground as BaseGround } from "@/components/GroundCard";
import GroundFilter from "@/components/GroundFilter";
import { motion } from "framer-motion";
import { MapIcon, MagnifyingGlassIcon } from "@heroicons/react/24/outline";

interface Ground extends BaseGround {
  _id: string;
  id: number;
}

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
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<FilterState>({
    name: "",
    location: "",
    sport: "",
  });

  useEffect(() => {
    const fetchGrounds = async () => {
      try {
        const response = await fetch("/api/grounds");
        if (!response.ok) throw new Error("Failed to fetch grounds");

        const data: BackendGround[] = await response.json();

        const mappedGrounds: Ground[] = data.map((g: BackendGround) => ({
          _id: g._id,
          id: Number(g._id),
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
      } finally {
        setLoading(false);
      }
    };

    fetchGrounds();
  }, []);

  const availableSports = useMemo(() => {
    const sportsSet = new Set<string>();
    grounds.forEach((g) => g.sports?.forEach((s) => sportsSet.add(s)));
    return Array.from(sportsSet);
  }, [grounds]);

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

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
  };

  return (
    <div className="w-full text-slate-900 flex flex-col items-center">
      
      {/* Premium Page Header */}
      <section className="w-full bg-slate-900 relative overflow-hidden pt-16 pb-20">
        <div className="absolute inset-0 bg-gradient-to-r from-emerald-900/20 to-teal-900/20" />
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1521412644187-c49fa049e84d?auto=format&fit=crop&w=1920&q=80')] bg-cover bg-center opacity-10 mix-blend-overlay" />
        
        <div className="container mx-auto px-6 lg:px-20 relative z-10 flex flex-col items-center text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
          >
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 border border-white/10 mb-6">
              <MapIcon className="w-4 h-4 text-emerald-400" />
              <span className="text-xs font-bold text-emerald-50 uppercase tracking-widest">Discover Venues</span>
            </div>
            <h1 className="text-4xl md:text-6xl font-black text-white font-outfit tracking-tighter mb-4 drop-shadow-lg">
              Find Your <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-400">Perfect Arena</span>
            </h1>
            <p className="text-slate-300 text-sm md:text-base max-w-2xl mx-auto font-medium">
              Browse through the city's finest indoor sports facilities. Book instantly and elevate your game today.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Main Content Area */}
      <section className="w-full max-w-7xl mx-auto px-4 sm:px-8 -mt-10 relative z-20 pb-24">
        
        {/* Filter Widget - Elevated */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="bg-white rounded-2xl shadow-xl shadow-slate-200/50 border border-slate-100 p-4 mb-12"
        >
          <div className="flex items-center gap-2 mb-4 px-2">
            <MagnifyingGlassIcon className="w-5 h-5 text-emerald-600" />
            <h3 className="font-bold text-slate-800 font-outfit">Filter Arenas</h3>
          </div>
          <GroundFilter
            onFilterChange={(f) => setFilters(f)}
            availableSports={availableSports}
          />
        </motion.div>

        {/* Grounds Grid - Bento Box Style */}
        <div className="w-full">
          {loading ? (
            <div className="flex flex-col items-center justify-center min-h-[30vh]">
              <div className="relative w-20 h-20">
                <div className="absolute inset-0 rounded-full border-4 border-slate-100 border-t-emerald-500 animate-spin"></div>
                <div className="absolute inset-0 rounded-full border-4 border-transparent border-b-teal-400 animate-spin duration-700"></div>
              </div>
              <p className="mt-4 text-slate-500 font-medium animate-pulse">Loading arenas...</p>
            </div>
          ) : filteredGrounds.length > 0 ? (
            <motion.div 
              variants={containerVariants}
              initial="hidden"
              animate="show"
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 justify-items-center"
            >
              {filteredGrounds.map((g, idx) => (
                <motion.div key={g._id || g.id || idx} variants={itemVariants} className="w-full">
                  <GroundCard ground={g} role="user" id={g.id} />
                </motion.div>
              ))}
            </motion.div>
          ) : (
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              className="text-center py-20 bg-white rounded-3xl border border-slate-100 shadow-sm"
            >
              <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
                <MagnifyingGlassIcon className="w-8 h-8 text-slate-300" />
              </div>
              <h3 className="text-xl font-bold text-slate-800 font-outfit mb-2">No arenas found</h3>
              <p className="text-slate-500">Try adjusting your filters to find what you're looking for.</p>
            </motion.div>
          )}
        </div>
      </section>
    </div>
  );
}
