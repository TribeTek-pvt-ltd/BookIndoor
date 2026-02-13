"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useState, JSX } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import {
  MapPinIcon,
  ClockIcon,
  XMarkIcon,
  PencilSquareIcon,
  CheckIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  HomeIcon,
} from "@heroicons/react/24/solid";
import {
  FaChair,
  FaUtensils,
  FaRestroom,
  FaPersonDress,
  FaPlus,
  FaLightbulb,
  FaWifi,
  FaTruck,
  FaLock,
  FaGlassWater
} from "react-icons/fa6";
import Calendar from "@/components/Calendar";
import PaymentForm from "@/components/PaymentForm";
import AddGroundForm from "@/components/AddGroundForm"; // ✅ Import existing form
// local helper to detect role (fallbacks to server endpoint)
// This avoids relying on a specific export from "@/lib/auth"
async function getUserRole(): Promise<"admin" | "super_admin" | "user" | null> {
  try {
    const role = localStorage.getItem("user");
    return (role as "admin" | "super_admin" | "user") ?? null;
  } catch (err) {
    console.error("Failed to fetch user role:", err);
    return null;
  }
}

interface Location {
  address: string;
  lat: number;
  lng: number;
}

interface Sport {
  name: string;
  pricePerHour: number;
}

interface Ground {
  _id?: string;
  name: string;
  location: Location;
  sports: Sport[];
  amenities: string[];
  images: string[];
  availableTime: {
    from: string;
    to: string;
  };
}

interface BookingItem {
  date: string;
  times: string[];
}

interface BookingDetails {
  bookings: BookingItem[];
}

const facilityIcons: Record<string, JSX.Element> = {
  Parking: <FaTruck className="w-5 h-5 text-emerald-600" />,
  Lighting: <FaLightbulb className="w-5 h-5 text-emerald-600" />,
  Restrooms: <FaRestroom className="w-5 h-5 text-emerald-600" />,
  Cafeteria: <FaUtensils className="w-5 h-5 text-emerald-600" />,
  "Changing Rooms": <FaPersonDress className="w-5 h-5 text-emerald-600" />,
  "Seating Area": <FaChair className="w-5 h-5 text-emerald-600" />,
  "First Aid": <FaPlus className="w-5 h-5 text-emerald-600" />,
  Wifi: <FaWifi className="w-5 h-5 text-emerald-600" />,
  Water: <FaGlassWater className="w-5 h-5 text-emerald-600" />,
  Lockers: <FaLock className="w-5 h-5 text-emerald-600" />,
};

export default function UserGroundDetails() {
  const params = useParams();
  const router = useRouter();
  const id = Array.isArray(params.id) ? params.id[0] : params.id;

  const [ground, setGround] = useState<Ground | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentImage, setCurrentImage] = useState(0);
  const [selectedSport, setSelectedSport] = useState<string | null>(null);
  const [bookingDetails, setBookingDetails] = useState<BookingDetails | null>(
    null
  );
  const [showCalendarModal, setShowCalendarModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false); // ✅ For editing
  const [role, setRole] = useState<"admin" | "super_admin" | "user" | null>(null);

  // 🧩 Fetch user role
  useEffect(() => {
    const fetchRole = async () => {
      const userRole = await getUserRole();
      setRole(userRole);
    };
    fetchRole();
  }, []);

  // 🧩 Fetch ground details
  useEffect(() => {
    const fetchGround = async () => {
      try {
        const res = await fetch(`/api/grounds/${id}`);
        if (!res.ok) throw new Error("Failed to fetch ground");
        const data: Ground = await res.json();
        setGround(data);
      } catch (err) {
        console.error("Failed to fetch ground:", err);
      } finally {
        setLoading(false);
      }
    };
    if (id) fetchGround();
  }, [id]);

  // 🌀 Auto image slider
  useEffect(() => {
    if (!ground || ground.images.length === 0) return;
    const interval = setInterval(() => {
      setCurrentImage((prev) =>
        prev === ground.images.length - 1 ? 0 : prev + 1
      );
    }, 3000);
    return () => clearInterval(interval);
  }, [ground]);

  if (!id)
    return <p className="text-center mt-10 text-red-500">Invalid ground ID</p>;
  if (loading)
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="relative">
          <div className="w-16 h-16 rounded-full border-4 border-slate-100 border-t-emerald-600 animate-spin"></div>
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
            <div className="w-2 h-2 bg-emerald-600 rounded-full animate-pulse"></div>
          </div>
        </div>
      </div>
    );
  if (!ground)
    return <p className="text-center mt-10 text-red-500">Ground not found</p>;

  const prevImage = () =>
    setCurrentImage((prev) =>
      prev === 0 ? ground.images.length - 1 : prev - 1
    );
  const nextImage = () =>
    setCurrentImage((prev) =>
      prev === ground.images.length - 1 ? 0 : prev + 1
    );

  const glassCardClasses = "glass-card p-6 sm:p-8";

  const calculateAmount = (bookings: BookingItem[]) => {
    if (!selectedSport || !ground) return 0;
    const sport = ground.sports.find((s) => s.name === selectedSport);
    if (!sport) return 0;

    const totalSlots = bookings.reduce(
      (acc, b) => acc + b.times.length,
      0
    );
    return sport.pricePerHour * totalSlots;
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-10 space-y-8 sm:space-y-10">
      {/* 🖼️ Hero Image Gallery & Info Section */}
      <div className="flex flex-col lg:flex-row gap-8 items-stretch">
        <div className="relative w-full lg:w-3/5 h-[300px] sm:h-[400px] md:h-[500px] rounded-xl overflow-hidden shadow-2xl group order-1">
          <div className="flex h-full transition-transform duration-700 ease-out"
            style={{ transform: `translateX(-${currentImage * 100}%)` }}>
            {ground.images.map((img, index) => (
              <div key={index} className="relative min-w-full h-full">
                <Image
                  src={img}
                  alt={ground.name}
                  fill
                  className="object-cover"
                />
              </div>
            ))}
          </div>

          {/* Navigation Arrows */}
          <button
            onClick={prevImage}
            className="absolute top-1/2 left-4 -translate-y-1/2 w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center bg-white/20 backdrop-blur-md border border-white/30 rounded-full text-white shadow-xl hover:bg-white/40 transition-all opacity-0 group-hover:opacity-100">
            <ChevronLeftIcon className="w-6 h-6" />
          </button>
          <button
            onClick={nextImage}
            className="absolute top-1/2 right-4 -translate-y-1/2 w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center bg-white/20 backdrop-blur-md border border-white/30 rounded-full text-white shadow-xl hover:bg-white/40 transition-all opacity-0 group-hover:opacity-100">
            <ChevronRightIcon className="w-6 h-6" />
          </button>

          {/* Image Dots */}
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2 p-2 bg-black/20 backdrop-blur-sm rounded-xl">
            {ground.images.map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrentImage(i)}
                className={`w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-xl transition-all ${currentImage === i ? "bg-white w-6" : "bg-white/50 hover:bg-white/80"}`}
              />
            ))}
          </div>
        </div>

        {/* 🏟️ Ground Hero Info Section */}
        <div className={`${glassCardClasses} w-full lg:w-2/5 flex flex-col justify-center order-2`}>
          <div className="space-y-6">
            <div className="flex items-start justify-between">
              <span className="inline-block px-4 py-1.5 bg-emerald-100 text-emerald-800 text-xs font-bold uppercase tracking-widest rounded-xl">
                Indoor Arena
              </span>
              {role === "admin" && (
                <button
                  onClick={() => setShowEditModal(true)}
                  className="p-2 text-slate-400 hover:text-emerald-600 transition-colors"
                  title="Edit Details"
                >
                  <PencilSquareIcon className="w-6 h-6" />
                </button>
              )}
            </div>

            <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-slate-900 font-outfit leading-tight">
              {ground.name}
            </h1>

            <div className="space-y-4 pt-2">
              <p className="text-slate-600 flex items-start gap-3 text-base sm:text-lg font-medium leading-relaxed">
                <MapPinIcon className="w-6 h-6 text-emerald-600 flex-shrink-0 mt-0.5" />
                <span>
                  {ground.location.address}
                  <a
                    href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(ground.location.address)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-emerald-600 hover:text-emerald-700 font-bold ml-2 underline-offset-4 hover:underline transition-all">
                    Navigate
                  </a>
                </span>
              </p>

              <div className="flex items-center gap-3 text-slate-700 font-semibold bg-slate-50 p-4 rounded-xl border border-slate-100">
                <ClockIcon className="w-6 h-6 text-emerald-600" />
                <span className="text-base sm:text-lg">Operates: {ground.availableTime.from} – {ground.availableTime.to}</span>
              </div>
            </div>

            {/* Facilities Highlight */}
            <div className="flex flex-wrap gap-2.5 pt-4">
              {ground.amenities.map((facility) => (
                <div
                  key={facility}
                  className="px-3 sm:px-4 py-2 bg-white border border-slate-200 text-slate-700 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 shadow-sm hover:border-emerald-200 transition-all cursor-default">
                  {facilityIcons[facility] || <HomeIcon className="w-4 h-4 text-emerald-600" />}
                  {facility}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* 🏀 Sports Selection Component */}
      <div className={glassCardClasses}>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
          <div>
            <h2 className="text-2xl font-bold text-slate-900 font-outfit">
              Select Your Sport
            </h2>
            <p className="text-slate-500 font-medium mt-1">
              Prices vary by sport. All bookings are instant.
            </p>
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {ground.sports.map((sport) => (
            <button
              key={sport.name}
              onClick={() => {
                setSelectedSport(sport.name);
                setBookingDetails(null);
                setShowCalendarModal(true);
              }}
              className={`group relative p-6 rounded-xl border-2 transition-all duration-300 text-left ${selectedSport === sport.name
                ? "bg-emerald-600 border-emerald-600 shadow-xl shadow-emerald-200 scale-105"
                : "bg-white border-slate-100 hover:border-emerald-200 hover:shadow-lg"
                }`}
            >
              <div
                className={`p-3 rounded-xl w-fit mb-4 transition-colors ${selectedSport === sport.name ? "bg-white/20" : "bg-emerald-50"
                  }`}
              >
                <span className="text-2xl">
                  {sport.name === "Cricket"
                    ? "🏏"
                    : sport.name === "Football"
                      ? "⚽"
                      : sport.name === "Badminton"
                        ? "🏸"
                        : "🏃"}
                </span>
              </div>
              <h3
                className={`text-lg font-bold transition-colors ${selectedSport === sport.name ? "text-white" : "text-slate-900"
                  }`}
              >
                {sport.name}
              </h3>
              <p
                className={`text-sm font-semibold mt-1 transition-colors ${selectedSport === sport.name ? "text-white/80" : "text-emerald-700"
                  }`}
              >
                Rs {sport.pricePerHour}{" "}
                <span className="text-[10px] opacity-60">/ HR</span>
              </p>
              <div
                className={`absolute top-4 right-4 transition-opacity ${selectedSport === sport.name ? "opacity-100" : "opacity-0"
                  }`}
              >
                <div className="w-6 h-6 bg-white rounded-xl flex items-center justify-center">
                  <CheckIcon className="w-4 h-4 text-emerald-600" />
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* 📅 Calendar Modal */}
      {showCalendarModal && selectedSport && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-xl w-11/12 max-w-lg p-6 relative">
            <button
              onClick={() => setShowCalendarModal(false)}
              className="absolute top-4 right-4 text-gray-500 hover:text-gray-700">
              <XMarkIcon className="w-6 h-6" />
            </button>
            <h3 className="text-xl font-semibold mb-4">
              Booking Calendar – {selectedSport}
            </h3>
            <Calendar
              groundId={id}
              groundName={ground.name}
              onConfirmBookings={(bookings) => {
                const amount = calculateAmount(bookings);
                sessionStorage.setItem("pendingBooking", JSON.stringify({
                  groundId: id,
                  sportName: selectedSport || "",
                  groundName: ground.name,
                  location: ground.location.address,
                  bookings: bookings,
                  amount: amount,
                }));
                setShowCalendarModal(false);
                router.push("/booking/payment");
              }}
            />
          </div>
        </div>
      )}


      {/* 🧾 Admin Edit Modal */}
      <AnimatePresence>
        {showEditModal && ground && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowEditModal(false)}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-md"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="relative w-full max-w-2xl bg-white rounded-[2.5rem] shadow-2xl overflow-hidden border border-slate-100 flex flex-col max-h-[90vh]"
            >
              {/* Header */}
              <div className="p-8 pb-4 flex items-center justify-between border-b border-slate-50 flex-shrink-0">
                <div>
                  <h3 className="text-2xl font-black text-slate-800 tracking-tight">
                    Update Arena
                  </h3>
                  <p className="text-slate-500 text-sm font-medium mt-1">
                    Modify facility details and operational settings
                  </p>
                </div>
                <button
                  onClick={() => setShowEditModal(false)}
                  className="w-12 h-12 flex items-center justify-center bg-slate-50 hover:bg-slate-100 text-slate-400 rounded-2xl transition-all"
                >
                  <XMarkIcon className="w-6 h-6" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto custom-scrollbar p-2">
                <AddGroundForm
                  ground={{
                    id: ground._id || "",
                    name: ground.name,
                    location: ground.location.address,
                    latitude: String(ground.location.lat),
                    longitude: String(ground.location.lng),
                    open_from: ground.availableTime.from,
                    open_to: ground.availableTime.to,
                    facilities: ground.amenities.join(", "),
                    phone_no: "", // if not available, can leave empty or add default
                    court_type: "Outdoor", // default value or fetch from API if exists
                    sports: ground.sports.map((s) => s.name),
                    priceList: ground.sports.map((s) => s.pricePerHour),
                    images: ground.images,
                  }}
                  isEditing={true}
                  onClose={() => setShowEditModal(false)}
                />
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
