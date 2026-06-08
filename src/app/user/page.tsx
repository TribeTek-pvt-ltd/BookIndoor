"use client";
import { useEffect, useState, useMemo } from "react";
import GroundCard, { Ground as BaseGround } from "@/components/GroundCard";
import GroundFilter from "@/components/GroundFilter";
import { motion, AnimatePresence } from "framer-motion";
import { MapIcon, FaceFrownIcon } from "@heroicons/react/24/outline";

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
  facilities?: string[];
  amenities?: string[];
}

interface FilterState {
  search: string;
  sport: string;
}

export default function UserPage() {
  const [grounds, setGrounds] = useState<Ground[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<FilterState>({
    search: "",
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
          image: g.images?.[0] || "https://images.unsplash.com/photo-1521412644187-c49fa049e84d?auto=format&fit=crop&w=800&q=80",
          sports: g.sports?.map((s) => s.name) || [],
          facilities: g.amenities || g.facilities || [], // Use actual facilities/amenities from DB
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
      const searchLower = filters.search.toLowerCase();
      const matchesSearch = 
        !filters.search || 
        g.name.toLowerCase().includes(searchLower) || 
        g.location.toLowerCase().includes(searchLower);
        
      const matchesSport =
        !filters.sport || (g.sports && g.sports.includes(filters.sport));
        
      return matchesSearch && matchesSport;
    });
  }, [grounds, filters]);

  // Framer Motion Variants
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
    hidden: { opacity: 0, y: 30, scale: 0.95 },
    show: { opacity: 1, y: 0, scale: 1, transition: { type: "spring" as const, stiffness: 300, damping: 24 } }
  };

  return (
    <div className="w-full bg-[#f8fafc] text-slate-900 min-h-screen flex flex-col items-center">
      
      {/* Premium Page Header */}
      <section className="w-full bg-[#020617] relative overflow-hidden pt-20 pb-32">
        {/* Dynamic Mesh Gradients */}
        <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-emerald-500/20 rounded-full blur-[120px] mix-blend-screen pointer-events-none" />
        <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-teal-500/20 rounded-full blur-[120px] mix-blend-screen pointer-events-none" />
        
        {/* Background Image Overlay */}
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1521412644187-c49fa049e84d?auto=format&fit=crop&w=1920&q=80')] bg-cover bg-center opacity-10 mix-blend-overlay" />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-[#020617]/90" />
        
        <div className="container mx-auto px-6 lg:px-20 relative z-10 flex flex-col items-center text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="w-full max-w-4xl flex flex-col items-center"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 mb-6 backdrop-blur-md shadow-[0_0_20px_rgba(16,185,129,0.1)]">
              <MapIcon className="w-4 h-4 text-emerald-400" />
              <span className="text-xs font-bold text-white uppercase tracking-widest">Discover Venues</span>
            </div>
            <h1 className="text-5xl md:text-7xl font-black text-white font-outfit tracking-tighter mb-6 drop-shadow-2xl">
              Find Your <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-300">Perfect Arena</span>
            </h1>
            <p className="text-slate-300/90 text-lg md:text-xl max-w-2xl mx-auto font-medium">
              Browse through the city&apos;s finest indoor sports facilities. Book instantly and elevate your game today.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Main Content Area */}
      <section className="w-full max-w-7xl mx-auto px-4 sm:px-8 -mt-24 relative z-20 pb-24">
        
        {/* Filter Widget - Refactored to be sticky and cleaner */}
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="sticky top-4 z-30 mb-12"
        >
          <GroundFilter
            onFilterChange={(f) => setFilters(f)}
            availableSports={availableSports}
          />
        </motion.div>

        {/* Grounds Grid */}
        <div className="w-full">
          <AnimatePresence mode="wait">
            {loading ? (
              // SKELETON LOADERS
              <motion.div 
                key="loading"
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 justify-items-center"
              >
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <div key={i} className="w-full max-w-[420px] bg-white rounded-[2rem] overflow-hidden shadow-sm border border-slate-100 h-[480px] animate-pulse">
                    <div className="w-full h-64 bg-slate-200" />
                    <div className="p-6">
                      <div className="h-8 bg-slate-200 rounded-lg w-3/4 mb-6" />
                      <div className="flex gap-2 mb-8">
                        <div className="h-6 w-20 bg-slate-200 rounded-xl" />
                        <div className="h-6 w-24 bg-slate-200 rounded-xl" />
                      </div>
                      <div className="mt-auto pt-4 h-14 bg-slate-200 rounded-2xl w-full" />
                    </div>
                  </div>
                ))}
              </motion.div>
            ) : filteredGrounds.length > 0 ? (
              // LOADED CARDS
              <motion.div 
                key="grid"
                variants={containerVariants}
                initial="hidden"
                animate="show"
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 justify-items-center"
              >
                {filteredGrounds.map((g, idx) => (
                  <motion.div key={g._id || g.id || idx} variants={itemVariants} className="w-full flex justify-center">
                    <GroundCard ground={g} role="user" id={g.id} />
                  </motion.div>
                ))}
              </motion.div>
            ) : (
              // EMPTY STATE
              <motion.div 
                key="empty"
                initial={{ opacity: 0, scale: 0.95 }} 
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.4 }}
                className="w-full max-w-2xl mx-auto mt-12 text-center py-20 px-6 bg-white rounded-[3rem] border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)]"
              >
                <div className="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner border border-slate-100">
                  <FaceFrownIcon className="w-12 h-12 text-slate-300" />
                </div>
                <h3 className="text-3xl font-black text-slate-900 font-outfit mb-4">No Arenas Found</h3>
                <p className="text-slate-500 text-lg mb-8 max-w-md mx-auto">
                  We couldn&apos;t find any arenas matching &quot;{filters.search}&quot; or the selected sport. Try broadening your search.
                </p>
                <button
                  onClick={() => setFilters({ search: "", sport: "" })}
                  className="px-8 py-3 bg-emerald-50 text-emerald-600 font-bold rounded-xl hover:bg-emerald-100 transition-colors"
                >
                  Clear All Filters
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </section>
    </div>
  );
}
