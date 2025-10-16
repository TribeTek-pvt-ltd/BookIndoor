"use client";

import { useParams } from "next/navigation";
import { useEffect, useState, JSX } from "react";
import {
  WifiIcon,
  UserGroupIcon,
  ShoppingBagIcon,
  TruckIcon,
  HomeIcon,
  MapPinIcon,
  ClockIcon,
  XMarkIcon,
} from "@heroicons/react/24/solid";
import Calendar from "@/components/Calendar";
import PaymentForm from "@/components/PaymentForm";

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

interface BookingDetails {
  date: string;
  times: string[];
}

const facilityIcons: Record<string, JSX.Element> = {
  Parking: <TruckIcon className="w-5 h-5 text-green-500" />,
  Lighting: <WifiIcon className="w-5 h-5 text-green-500" />,
  Restrooms: <UserGroupIcon className="w-5 h-5 text-green-500" />,
  Cafeteria: <ShoppingBagIcon className="w-5 h-5 text-green-500" />,
};

export default function UserGroundDetails() {
  const params = useParams();
  const id = Array.isArray(params.id) ? params.id[0] : params.id;

  const [ground, setGround] = useState<Ground | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentImage, setCurrentImage] = useState(0);
  const [selectedSport, setSelectedSport] = useState<string | null>(null);
  const [bookingDetails, setBookingDetails] = useState<BookingDetails | null>(null);
  const [showCalendarModal, setShowCalendarModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);

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

  // 🌀 Auto image slider (every 3 seconds)
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
    return <p className="text-center mt-10 text-green-500">Loading...</p>;
  if (!ground)
    return <p className="text-center mt-10 text-red-500">Ground not found</p>;

  const prevImage = () =>
    setCurrentImage((prev) => (prev === 0 ? ground.images.length - 1 : prev - 1));
  const nextImage = () =>
    setCurrentImage((prev) => (prev === ground.images.length - 1 ? 0 : prev + 1));

  const glassCardClasses =
    "bg-white/10 backdrop-blur-md border border-green-900/30 rounded-2xl shadow-lg p-6";

  const calculateAmount = () => {
    if (!selectedSport || !bookingDetails) return 0;
    const sport = ground.sports.find((s) => s.name === selectedSport);
    return sport ? sport.pricePerHour * bookingDetails.times.length : 0;
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-10 space-y-8 sm:space-y-10">
      {/* Image + Info Row */}
      <div className="flex flex-col lg:flex-row gap-8">
        {/* 🖼️ Image Carousel */}
        <div className="relative w-full lg:w-1/2 rounded-2xl overflow-hidden shadow-lg">
          <div className="relative h-64 sm:h-[26rem]">
            {ground.images.map((img, index) => (
              <img
                key={index}
                src={img}
                alt={`${ground.name}-${index}`}
                className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-1000 ${
                  index === currentImage ? "opacity-100" : "opacity-0"
                }`}
              />
            ))}
          </div>
          <button
            onClick={prevImage}
            className="absolute top-1/2 left-3 sm:left-4 -translate-y-1/2 bg-white/80 p-2 rounded-full shadow hover:scale-105 transition"
          >
            ◀
          </button>
          <button
            onClick={nextImage}
            className="absolute top-1/2 right-3 sm:right-4 -translate-y-1/2 bg-white/80 p-2 rounded-full shadow hover:scale-105 transition"
          >
            ▶
          </button>
        </div>

        {/* 🏟️ Ground Info */}
        <div className={`${glassCardClasses} flex-1 flex flex-col justify-center space-y-4`}>
          <h1 className="text-2xl sm:text-3xl font-bold text-green-100 flex items-center gap-2">
            {ground.name}
          </h1>

          <p className="text-green-200 flex items-center gap-2 flex-wrap">
            <MapPinIcon className="w-5 h-5 text-green-400" />
            {ground.location.address}
            <a
              href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                ground.location.address
              )}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-green-300 hover:underline text-sm ml-2"
            >
              View on Map
            </a>
          </p>

          <div className="flex items-center gap-2 text-green-200">
            <ClockIcon className="w-5 h-5 text-green-400" />
            Open Time: {ground.availableTime.from} – {ground.availableTime.to}
          </div>

          {/* Facilities */}
          <div className="flex flex-wrap gap-2 mt-4">
            {ground.amenities.map((facility) => (
              <span
                key={facility}
                className="px-3 py-1.5 sm:px-4 sm:py-2 bg-green-700 text-white rounded-full text-sm sm:text-base font-medium flex items-center gap-1"
              >
                {facilityIcons[facility] || <HomeIcon className="w-5 h-5 text-green-400" />}
                {facility}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* 🏀 Sports Selection */}
      <div className={glassCardClasses}>
        <h2 className="text-lg sm:text-xl font-semibold text-green-100 mb-4">
          Select a Sport to Book
        </h2>
        <div className="flex flex-wrap gap-3 sm:gap-4">
          {ground.sports.map((sport) => (
            <button
              key={sport.name}
              onClick={() => {
                setSelectedSport(sport.name);
                setBookingDetails(null);
                setShowCalendarModal(true);
              }}
              className={`px-4 py-2 sm:px-5 sm:py-3 rounded-xl border font-semibold text-sm sm:text-base transition ${
                selectedSport === sport.name
                  ? "bg-green-600 text-white border-green-600 scale-105"
                  : "bg-white text-green-900 border-green-600 hover:bg-green-100 hover:text-green-900"
              }`}
            >
              {sport.name} – Rs {sport.pricePerHour}
            </button>
          ))}
        </div>
      </div>

      {/* 📅 Calendar Modal */}
      {showCalendarModal && selectedSport && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-2xl w-11/12 max-w-lg p-6 relative">
            <button
              onClick={() => setShowCalendarModal(false)}
              className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
            >
              <XMarkIcon className="w-6 h-6" />
            </button>
            <h3 className="text-xl font-semibold mb-4">
              Booking Calendar – {selectedSport}
            </h3>
            <Calendar
              groundId={id}
              groundName={ground.name}
              onSlotClick={(date, times) => {
                setBookingDetails({ date, times });
                setShowCalendarModal(false);
                setShowPaymentModal(true);
              }}
            />
          </div>
        </div>
      )}

      {/* 💳 Payment Modal */}
      {showPaymentModal && bookingDetails && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-2xl w-11/12 max-w-md p-6 relative">
            <button
              onClick={() => setShowPaymentModal(false)}
              className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
            >
              <XMarkIcon className="w-6 h-6" />
            </button>
            <PaymentForm
              bookingDetails={{
                groundId: id,
                sportName: selectedSport || "",
                groundName: ground.name,
                location: ground.location.address,
                date: bookingDetails.date,
                times: bookingDetails.times,
              }}
              amount={calculateAmount()}
              onPaymentSuccess={() => {
                setBookingDetails(null);
                setSelectedSport(null);
                setShowPaymentModal(false);
                alert("Booking completed successfully!");
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
}
