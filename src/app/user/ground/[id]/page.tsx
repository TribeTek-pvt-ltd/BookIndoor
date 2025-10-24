"use client";

import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import GroundImageCarousel from "@/components/GroundImageCarousel";
import GroundInfoCard from "@/components/GroundInfoCard";
import SportSelector from "@/components/SportSelector";
import CalendarModal from "@/components/CalendarModal";
import PaymentModal from "@/components/PaymentModal";

export default function UserGroundDetails() {
  const params = useParams();
  const id = Array.isArray(params.id) ? params.id[0] : params.id;

  const [ground, setGround] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [selectedSport, setSelectedSport] = useState<string | null>(null);
  const [bookingDetails, setBookingDetails] = useState<any>(null);
  const [showCalendarModal, setShowCalendarModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);

  // 🧩 Fetch ground details
  useEffect(() => {
    if (!id) return;
    (async () => {
      const res = await fetch(`/api/grounds/${id}`);
      const data = await res.json();
      setGround(data);
      setLoading(false);
    })();
  }, [id]);
  const handleBooking = async (date: string, times: string[]) => {
    try {
      if (!selectedSport || !ground) return;

      const payload = {
        ground: ground.id || id,
        sportName: selectedSport,
        guest: {
          name: "Dinushan",
          email: "dinushan@example.com",
          phone: "0771234567",
          nicNumber: "123456789V",
        },
        date,
        timeSlots: times.map((t) => ({ startTime: t })),
        totalAmount: 0, // backend will recalc
        paymentStatus: "advanced_paid",
      };

      const res = await fetch("/api/booking", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.error || "Booking failed");

      alert(`✅ Booking successful! Amount: ${data.amount}`);

      // Close modals after successful booking
      setShowPaymentModal(false);
      setShowCalendarModal(false);
      setBookingDetails(null);
      setSelectedSport(null);
    } catch (err: any) {
      console.error("Booking error:", err);
      alert(`❌ Booking failed: ${err.message}`);
    }
  };

  const calculateAmount = () => {
    if (!ground || !selectedSport || !bookingDetails) return 0;
    const sport = ground.sports.find((s: any) => s.name === selectedSport);
    return sport ? sport.pricePerHour * bookingDetails.times.length : 0;
  };

  if (loading)
    return <p className="text-center mt-10 text-green-500">Loading...</p>;
  if (!ground)
    return <p className="text-center mt-10 text-red-500">Ground not found</p>;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-10 space-y-8 sm:space-y-10">
      <div className="flex flex-col lg:flex-row gap-8">
        <GroundImageCarousel images={ground.images} />
        <GroundInfoCard ground={ground} />
      </div>

      <SportSelector
        sports={ground.sports}
        selectedSport={selectedSport}
        onSelect={(sport) => {
          setSelectedSport(sport);
          setBookingDetails(null);
          setShowCalendarModal(true);
        }}
      />

      <CalendarModal
        isOpen={showCalendarModal}
        sport={selectedSport}
        groundId={ground.id || id}
        groundName={ground.name}
        onClose={() => setShowCalendarModal(false)}
        onSelectSlot={(date, times) => {
          setBookingDetails({ date, times });
          setShowCalendarModal(false);
          setShowPaymentModal(true);
        }}
      />

      <PaymentModal
        isOpen={showPaymentModal}
        bookingDetails={bookingDetails}
        ground={ground}
        selectedSport={selectedSport}
        amount={calculateAmount()}
        onClose={() => setShowPaymentModal(false)}
        onSuccess={async () => {
          if (bookingDetails) {
            await handleBooking(bookingDetails.date, bookingDetails.times);
          }
          setBookingDetails(null);
          setSelectedSport(null);
          setShowPaymentModal(false);
        }}
      />
    </div>
  );
}
function setOpenModal(arg0: boolean) {
  throw new Error("Function not implemented.");
}
