import Link from "next/link";

export interface Ground {
  id: number;
  name: string;
  location: string;
  image: string;
  sports?: string[];
  facilities?: string[]; // optional facilities for future use
}

interface GroundCardProps {
  id: number;
  ground: Ground;
  role?: "Admin" | "User" | "SuperAdmin";
}

export default function GroundCard({ ground, role = "User" }: GroundCardProps) {
  const link =
    role === "Admin"
      ? `/admin/ground/${ground.id}`
      : `/user/ground/${ground.id}`;

  return (
    <div className="bg-green-100/10 backdrop-blur-md border border-green-100/10 rounded-2xl shadow-lg overflow-hidden w-full max-w-[400px] transition-all transform hover:scale-105 hover:shadow-2xl">
      {/* Image Section */}
      <div className="relative w-82 h-56">
        <img
          src={ground.image}
          alt={ground.name}
          className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
        />
        <div className="absolute bottom-0 left-0 w-full bg-gradient-to-t from-black/60 to-transparent p-4">
          <h3 className="text-white text-lg font-bold truncate">
            {ground.name}
          </h3>
          <p className="text-green-900 text-sm flex items-center gap-1">
            📍 {ground.location}
          </p>
        </div>
      </div>

      {/* Card Content */}
      <div className="p-5 space-y-4 text-center">
        {/* Sports Tags */}
        {ground.sports && ground.sports.length > 0 && (
          <div className="flex flex-wrap justify-center gap-2">
            {ground.sports.map((sport) => (
              <span
                key={sport}
                className="text-xs bg-green-800/30 text-green-800 px-3 py-1 rounded-full font-medium backdrop-blur-sm">
                {sport}
              </span>
            ))}
          </div>
        )}

        {/* Facilities (Optional) */}
        {Array.isArray(ground.facilities) && ground.facilities.length > 0 && (
          <div className="flex flex-wrap justify-center gap-2 mt-2">
            {ground.facilities.map((facility) => (
              <span
                key={facility}
                className="text-xs bg-green-600/40 text-white px-2 py-1 rounded-full flex items-center gap-1 font-medium backdrop-blur-sm">
                {/* Example icons for some facilities */}
                {facility === "Wi-Fi" && "📶"}
                {facility === "Parking" && "🅿️"}
                {facility === "Cafeteria" && "☕"}
                {facility === "Locker Room" && "🧳"}
                {facility}
              </span>
            ))}
          </div>
        )}

        {/* Button */}
        <Link
          href={link}
          className="block w-full text-center px-5 py-2 bg-green-800 text-white font-semibold rounded-lg hover:bg-green-700 transition-all shadow-md">
          View Details
        </Link>
      </div>
    </div>
  );
}
