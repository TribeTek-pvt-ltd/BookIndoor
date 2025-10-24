"use client";

import { useParams } from "next/navigation";
import { useEffect, useState, JSX } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  WifiIcon,
  UserGroupIcon,
  ShoppingBagIcon,
  TruckIcon,
  HomeIcon,
  MapPinIcon,
  ClockIcon,
  XMarkIcon,
  StarIcon,
  PencilSquareIcon,
  TrashIcon,
} from "@heroicons/react/24/solid";
import Calendar from "@/components/Calendar";
import PaymentForm from "@/components/PaymentForm";
import BookingDetailsTab from "@/components/BookingDetailsTab";
import BookingSummaryTab from "@/components/BookingSummaryTab";

interface Location {
  address: string;
  lat: number;
  lng: number;
}

interface Sport {
  price: number;
  name: string;
  pricePerHour: number;
}

interface Ground {
  closeTime: string | undefined;
  openTime: string | undefined;
  _id: string;
  name: string;
  location: Location | string;
  sports: Sport[];
  amenities: string[];
  images: string[];
  availableTime?: {
    from: string;
    to: string;
  };
  owner?: { name: string; email: string; role: string };
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
  "Locker Room": <UserGroupIcon className="w-5 h-5" />,
  "Wi-Fi": <WifiIcon className="w-5 h-5" />,
};

export default function UserGroundDetails() {
  const params = useParams();
  const id = Array.isArray(params.id) ? params.id[0] : params.id;

  const [ground, setGround] = useState<Ground | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentImage, setCurrentImage] = useState(0);
  const [selectedSport, setSelectedSport] = useState<string | null>(null);
  const [bookingDetails, setBookingDetails] = useState<BookingDetails | null>(
    null
  );
  const [showCalendarModal, setShowCalendarModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [activeTab, setActiveTab] = useState<
    "calendar" | "details" | "summary"
  >("calendar");

  const token =
    typeof window !== "undefined" ? localStorage.getItem("token") : null;
  const userRole =
    typeof window !== "undefined" ? localStorage.getItem("role") : "user";

  useEffect(() => {
    const fetchGround = async () => {
      if (!id) return;
      try {
        setLoading(true);
        const res = await fetch(`/api/grounds/${id}?token=${token}`);
        const data = await res.json();
        if (res.ok) setGround(data);
        else console.error("Error:", data.error);
      } catch (err) {
        console.error("Fetch Ground Error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchGround();
  }, [id]);

  if (loading)
    return (
      <div className="flex justify-center items-center min-h-[60vh] text-green-800">
        Loading ground details...
      </div>
    );

  if (!ground)
    return (
      <div className="flex justify-center items-center min-h-[60vh] text-red-600">
        Ground not found.
      </div>
    );

  const prevImage = () =>
    setCurrentImage((prev) =>
      ground && prev === 0 ? ground.images.length - 1 : prev - 1
    );
  const nextImage = () =>
    setCurrentImage((prev) =>
      ground && prev === ground.images.length - 1 ? 0 : prev + 1
    );

  const glassCardClasses =
    "bg-white/10 backdrop-blur-md border border-green-900/30 rounded-2xl shadow-lg p-6";

  const calculateAmount = () => {
    if (!selectedSport || !bookingDetails) return 0;
    const sport = ground.sports.find((s) => s.name === selectedSport);
    return sport ? sport.pricePerHour * bookingDetails.times.length : 0;
  };

  return <div className="max-w-7xl mx-auto px-6 py-10"></div>;
}
