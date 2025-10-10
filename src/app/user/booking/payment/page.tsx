"use client";

import { useSearchParams } from "next/navigation";
import BookingForm, { BookingSummary } from "@/components/BookingForm";
import PaymentForm from "@/components/PaymentForm";
import { useState, useEffect } from "react";

export default function PaymentPage() {
  const searchParams = useSearchParams();
  const [step, setStep] = useState<"form" | "payment">("form");
  const [bookingDetails, setBookingDetails] = useState<
    BookingSummary & { name?: string; phone?: string; nic?: string }
  >({
    groundName: "",
    date: "",
    times: [],
  });

  const amount = 2000; // Example amount, can be dynamic

  useEffect(() => {
    const date = searchParams.get("date") || "";
    const times = searchParams.get("times")?.split(",") || [];
    const groundName = searchParams.get("groundName") || "";
    setBookingDetails({ date, times, groundName: groundName });
  }, [searchParams]);

  const handleNext = (formData: {
    name: string;
    phone: string;
    nic: string;
  }) => {
    setBookingDetails((prev) => ({ ...prev, ...formData }));
    setStep("payment");
  };

  return (
    <div className=" py-10 px-4">
      <div className="w-full max-w-3xl bg-white/20 backdrop-blur-md border border-green-700/30 rounded-2xl shadow-lg p-8 sm:p-12">
        <h1 className="text-3xl font-bold text-green-900 text-center mb-6">
          {step === "form" ? "Booking Information" : "Payment"}
        </h1>

        <div className="space-y-6">
          {step === "form" ? (
            <BookingForm bookingSummary={bookingDetails} onNext={handleNext} />
          ) : (
            <PaymentForm
              bookingSummary={bookingDetails as any}
              amount={amount}
              onPaymentSuccess={(data: any) => {
                console.log("Payment Success:", data);
              }}
            />
          )}
        </div>

        {/* Step Indicator */}
        <div className="flex justify-center mt-8 gap-3">
          <span
            className={`w-4 h-4 rounded-full transition-all ${
              step === "form" ? "bg-green-700 scale-110" : "bg-green-400"
            }`}></span>
          <span
            className={`w-4 h-4 rounded-full transition-all ${
              step === "payment" ? "bg-green-700 scale-110" : "bg-green-400"
            }`}></span>
        </div>
      </div>
    </div>
  );
}
