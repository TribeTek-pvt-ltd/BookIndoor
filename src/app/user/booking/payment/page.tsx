"use client";

import { useSearchParams } from "next/navigation";
import BookingForm, { BookingSummary } from "@/components/BookingForm";
import PaymentForm from "@/components/PaymentForm";
import { useState, useEffect } from "react";

export default function PaymentPage() {
  const searchParams = useSearchParams();
  const [step, setStep] = useState<"form" | "payment">("form");
  const [bookingDetails, setBookingDetails] = useState<BookingSummary & { name?: string; phone?: string; nic?: string }>({
    groundName: "",
    date: "",
    times: [],
  });

  const amount = 2000; // Example amount, can be dynamic

  useEffect(() => {
    const date = searchParams.get("date") || "";
    const times = searchParams.get("times")?.split(",") || [];
    const ground = searchParams.get("ground") || "";
    setBookingDetails({ date, times, groundName: ground });
  }, [searchParams]);

  const handleNext = (formData: { name: string; phone: string; nic: string }) => {
    setBookingDetails(prev => ({ ...prev, ...formData }));
    setStep("payment");
  };

  return (
    <div className="min-h-screen bg-gray-100 py-10">
      {step === "form" ? (
        <BookingForm bookingSummary={bookingDetails} onNext={handleNext} />
      ) : (
        <PaymentForm bookingSummary={bookingDetails as any} amount={amount} onPaymentSuccess={function (data: any): void {
                      throw new Error("Function not implemented.");
                  } } />
      )}
    </div>
  );
}
