"use client";
import { useState } from "react";
import { MagnifyingGlassIcon, XMarkIcon } from "@heroicons/react/24/outline";

interface GroundFilterProps {
  onFilterChange: (filters: {
    search: string;
    sport: string;
  }) => void;
  availableSports: string[];
}

export default function GroundFilter({
  onFilterChange,
  availableSports,
}: GroundFilterProps) {
  const [search, setSearch] = useState("");
  const [sport, setSport] = useState("");

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setSearch(val);
    onFilterChange({ search: val, sport });
  };

  const handleSportSelect = (selectedSport: string) => {
    const newSport = sport === selectedSport ? "" : selectedSport;
    setSport(newSport);
    onFilterChange({ search, sport: newSport });
  };

  const handleClear = () => {
    setSearch("");
    setSport("");
    onFilterChange({ search: "", sport: "" });
  };

  const hasFilters = search || sport;

  return (
    <div className="w-full flex flex-col gap-6">
      {/* Unified Search Bar */}
      <div className="relative group w-full max-w-3xl mx-auto">
        <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none text-slate-400 group-focus-within:text-emerald-500 transition-colors">
          <MagnifyingGlassIcon className="h-6 w-6" />
        </div>
        <input
          type="text"
          value={search}
          onChange={handleSearchChange}
          placeholder="Search by arena name or location..."
          className="w-full pl-14 pr-12 py-5 bg-white border border-slate-200 rounded-[2rem] text-slate-900 placeholder:text-slate-400 focus:ring-4 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all font-medium text-lg shadow-[0_8px_30px_rgba(0,0,0,0.04)]"
        />
        {search && (
          <button
            onClick={() => {
              setSearch("");
              onFilterChange({ search: "", sport });
            }}
            className="absolute inset-y-0 right-0 pr-5 flex items-center text-slate-400 hover:text-slate-600 transition-colors"
          >
            <XMarkIcon className="h-5 w-5 bg-slate-100 rounded-full p-0.5" />
          </button>
        )}
      </div>

      {/* Horizontal Pill Sport Categories */}
      <div className="flex items-center gap-3 overflow-x-auto pb-4 custom-scrollbar px-2 max-w-full">
        <button
          onClick={() => handleSportSelect("")}
          className={`flex-shrink-0 px-6 py-2.5 rounded-full font-bold text-sm transition-all duration-300 border ${
            !sport
              ? "bg-slate-900 text-white border-slate-900 shadow-md"
              : "bg-white text-slate-600 border-slate-200 hover:border-slate-300 hover:bg-slate-50"
          }`}
        >
          All Sports
        </button>
        {availableSports.map((s, idx) => (
          <button
            key={idx}
            onClick={() => handleSportSelect(s)}
            className={`flex-shrink-0 px-6 py-2.5 rounded-full font-bold text-sm transition-all duration-300 border ${
              sport === s
                ? "bg-emerald-500 text-white border-emerald-500 shadow-md shadow-emerald-500/20"
                : "bg-white text-slate-600 border-slate-200 hover:border-slate-300 hover:bg-slate-50"
            }`}
          >
            {s}
          </button>
        ))}

        {hasFilters && (
           <button
             onClick={handleClear}
             className="flex-shrink-0 flex items-center gap-1.5 ml-auto pl-4 text-sm font-bold text-slate-400 hover:text-emerald-600 transition-colors"
           >
             <XMarkIcon className="w-4 h-4" />
             Clear Filters
           </button>
        )}
      </div>
    </div>
  );
}
