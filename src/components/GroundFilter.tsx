"use client";
import { useState } from "react";

interface GroundFilterProps {
  onFilterChange: (filters: {
    name: string;
    location: string;
    sport: string;
  }) => void;
  availableSports: string[];
}

export default function GroundFilter({
  onFilterChange,
  availableSports,
}: GroundFilterProps) {
  const [filters, setFilters] = useState({
    name: "",
    location: "",
    sport: "",
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    const newFilters = { ...filters, [name]: value };
    setFilters(newFilters);
    onFilterChange(newFilters);
  };

  return (
    <div className="w-xl bg-white p-6 rounded-2xl mb-24">
      <h2 className="text-xl font-semibold mb-4 text-green-800">
        Filter Grounds
      </h2>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        {/* Ground Name */}
        <div className="flex flex-col">
          <label className="text-sm text-green-700 font-medium mb-1">
            Ground Name
          </label>
          <input
            type="text"
            name="name"
            value={filters.name}
            onChange={handleChange}
            placeholder="Search by name..."
            className="p-2 border border-green-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
          />
        </div>

        {/* Location */}
        <div className="flex flex-col">
          <label className="text-sm text-green-700 font-medium mb-1">
            Location
          </label>
          <input
            type="text"
            name="location"
            value={filters.location}
            onChange={handleChange}
            placeholder="Search by location..."
            className="p-2 border border-green-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
          />
        </div>

        {/* Sport */}
        <div className="flex flex-col">
          <label className="text-sm text-green-700 font-medium mb-1">
            Sport
          </label>
          <select
            name="sport"
            value={filters.sport}
            onChange={handleChange}
            className="p-2 border border-green-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
          >
            <option value="">All Sports</option>
            {availableSports.map((sport, idx) => (
              <option key={idx} value={sport}>
                {sport}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
}
