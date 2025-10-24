"use client";

interface Sport {
  name: string;
  pricePerHour: number;
}

interface SportSelectorProps {
  sports: Sport[];
  selectedSport: string | null;
  onSelect: (sportName: string) => void;
}

export default function SportSelector({
  sports,
  selectedSport,
  onSelect,
}: SportSelectorProps) {
  return (
    <div className="bg-white/10 backdrop-blur-md border border-green-900/30 rounded-2xl shadow-lg p-6">
      <h2 className="text-lg sm:text-xl font-semibold text-green-100 mb-4">
        Select a Sport to Book
      </h2>
      <div className="flex flex-wrap gap-3 sm:gap-4">
        {sports.map((sport) => (
          <button
            key={sport.name}
            onClick={() => onSelect(sport.name)}
            className={`px-4 py-2 sm:px-5 sm:py-3 rounded-xl border font-semibold text-sm sm:text-base transition ${
              selectedSport === sport.name
                ? "bg-green-600 text-white border-green-600 scale-105"
                : "bg-white text-green-900 border-green-600 hover:bg-green-100 hover:text-green-900"
            }`}>
            {sport.name} – Rs {sport.pricePerHour}
          </button>
        ))}
      </div>
    </div>
  );
}
