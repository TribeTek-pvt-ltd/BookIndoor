import Link from "next/link";

export interface Ground {
  id: number;
  name: string;
  location: string;
  image: string;
  sports?: string[];
}

interface GroundCardProps {
  ground: Ground;
  role?: "Admin" | "User";
}

export default function GroundCard({ ground, role = "User" }: GroundCardProps) {
  const link =
    role === "Admin"
      ? `/admin/ground/${ground.id}`
      : `/user/ground/${ground.id}`;

  return (
    <div className="bg-white shadow-lg rounded-2xl overflow-hidden hover:shadow-2xl transition-all transform hover:-translate-y-1 w-full max-w-[500px] ">
      {/* Image Section */}
      <div className="relative w-7xl h-56">
        <img
          src={ground.image}
          alt={ground.name}
          className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
        />
        <div className="absolute bottom-0 left-0 w-full bg-gradient-to-t from-black/70 to-transparent p-4">
          <h3 className="text-white text-lg font-bold truncate">{ground.name}</h3>
          <p className="text-gray-200 text-sm flex items-center gap-1">
            📍 {ground.location}
          </p>
        </div>
      </div>

      {/* Card Content */}
      <div className="p-5 space-y-4 text-center">
        {ground.sports && ground.sports.length > 0 && (
          <div className="flex flex-wrap justify-center gap-2">
            {ground.sports.map((sport) => (
              <span
                key={sport}
                className="text-xs bg-indigo-100 text-indigo-700 px-3 py-1 rounded-full font-medium"
              >
                {sport}
              </span>
            ))}
          </div>
        )}

        {/* Button */}
        <Link
          href={link}
          className="block w-full text-center px-5 py-2 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700 transition-all shadow-md"
        >
          View Details
        </Link>
      </div>
    </div>
  );
}
