"use client";

import React, { useState, useMemo, useCallback } from "react";
import { api } from "@/lib/api-client";
import { BatchBookingSchema } from "@/lib/schemas";

interface BookingItem {
  date: string;
  times: string[];
}

interface BookingSummary {
  groundName: string;
  location: string;
  groundId: string;
  sportName: string;
  bookings: BookingItem[];
}

interface BookingResponse {
  bookingIds: string[];
  paymentGroupId?: string;
  message?: string;
  error?: string;
  amount?: number;
}

interface PaymentFormProps {
  bookingDetails: BookingSummary;
  amount: number;
  onPaymentSuccess?: () => void;
}

interface UserDetails {
  name: string;
  phone: string;
  nic: string;
  email: string;
  address: string;
  city: string;
}

export default function PaymentForm({ bookingDetails, amount }: PaymentFormProps) {
  const [userDetails, setUserDetails] = useState<UserDetails>({
    name: "",
    phone: "",
    nic: "",
    email: "",
    address: "",
    city: "",
  });

  const [isAdvance, setIsAdvance] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleUserChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setUserDetails((prev) => ({ ...prev, [name]: value }));
  }, []);

  const finalAmount = useMemo(() => isAdvance ? amount * 0.5 : amount, [isAdvance, amount]);

  const handlePayHerePayment = async (orderId: string, payAmount: number) => {
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const hashData: any = await api.post("/api/payhere/hash", {
        order_id: orderId,
        amount: payAmount,
        currency: "LKR",
      });

      if (!hashData.hash) throw new Error("Failed to generate payment hash");

      const payhereParams = {
        merchant_id: hashData.merchantId,
        return_url: `${window.location.origin}/booking/success`,
        cancel_url: `${window.location.origin}/booking/cancel`,
        notify_url: `${window.location.origin}/api/payhere/notify`,
        order_id: orderId,
        items: `Ground Booking - ${bookingDetails.groundName}`,
        currency: "LKR",
        amount: payAmount.toFixed(2),
        first_name: userDetails.name?.split(" ")?.[0] || "",
        last_name: userDetails.name?.split(" ")?.slice(1)?.join(" ") || "",
        email: userDetails.email,
        phone: userDetails.phone,
        address: userDetails.address,
        city: userDetails.city,
        country: "Sri Lanka",
        hash: hashData.hash,
        custom_1: isAdvance ? "advance" : "full",
      };

      const form = document.createElement("form");
      form.setAttribute("method", "POST");
      form.setAttribute("action", "https://sandbox.payhere.lk/pay/checkout");

      Object.entries(payhereParams).forEach(([key, value]) => {
        const hiddenField = document.createElement("input");
        hiddenField.setAttribute("type", "hidden");
        hiddenField.setAttribute("name", key);
        hiddenField.setAttribute("value", value as string);
        form.appendChild(hiddenField);
      });

      document.body.appendChild(form);
      form.submit();
    } catch (error) {
      console.error("PayHere Error:", error);
      alert("Failed to initiate payment. Please try again.");
      setLoading(false);
    }
  };

  const handleBooking = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    try {
      const bookingPayload = {
        ground: bookingDetails.groundId,
        sportName: bookingDetails.sportName,
        guest: {
          name: userDetails.name,
          phone: userDetails.phone,
          nicNumber: userDetails.nic,
          email: userDetails.email,
        },
        bookings: bookingDetails.bookings.map((b) => ({
          date: b.date,
          timeSlots: b.times.map((t) => ({ startTime: t?.split("-")?.[0] || t })),
        })),
        paymentStatus: "pending" as const,
      };

      const validation = BatchBookingSchema.safeParse(bookingPayload);
      if (!validation.success) {
        alert(validation.error?.issues?.[0]?.message || "Please check all fields.");
        setLoading(false);
        return;
      }

      const data: BookingResponse = await api.post("/api/booking", bookingPayload);
      if (data.paymentGroupId) {
        await handlePayHerePayment(data.paymentGroupId, finalAmount);
      } else {
        throw new Error("No payment group ID returned");
      }
    } catch (err: unknown) {
      console.error("Booking Error:", err);
      const msg = err instanceof Error ? err.message : "Failed to create booking.";
      alert(msg);
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-5xl mx-auto animate-fadeIn mt-8">
      <form onSubmit={handleBooking} className="flex flex-col lg:flex-row gap-6 lg:gap-8 items-start">
        
        {/* Left Side: Premium Booking Summary Ticket */}
        <div className="w-full lg:w-2/5 shrink-0 bg-slate-900 text-slate-100 p-8 rounded-[2.5rem] shadow-2xl shadow-slate-900/20 relative overflow-hidden flex flex-col justify-between min-h-[500px]">
          {/* Subtle gradient glow */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-[80px] -translate-y-1/2 translate-x-1/3 pointer-events-none"></div>
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-[80px] translate-y-1/3 -translate-x-1/3 pointer-events-none"></div>

          <div className="relative z-10">
            <h3 className="font-black text-white mb-8 text-xl uppercase tracking-widest flex items-center gap-3">
              <span className="w-8 h-8 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-400">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M9 5l7 7-7 7" /></svg>
              </span>
              Booking Summary
            </h3>
            
            <div className="space-y-6">
              <div>
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 block mb-1">Ground</span>
                <span className="text-xl font-bold text-white leading-tight block">{bookingDetails.groundName}</span>
              </div>
              
              <div>
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 block mb-1">Location</span>
                <span className="text-sm font-medium text-slate-300 block">{bookingDetails.location}</span>
              </div>
            </div>

            <div className="mt-8 pt-8 border-t border-slate-700/50 space-y-4 max-h-48 overflow-y-auto pr-2 custom-scrollbar">
              {bookingDetails.bookings.map((booking, index) => (
                <div key={index} className="bg-slate-800/50 backdrop-blur-sm p-4 rounded-2xl border border-slate-700/50">
                  <p className="text-xs font-black text-emerald-400 uppercase tracking-widest mb-2">{booking.date}</p>
                  <div className="flex flex-wrap gap-2">
                    {booking.times.map((t, i) => (
                      <span key={i} className="bg-slate-900/50 text-slate-200 text-xs font-bold px-3 py-1.5 rounded-lg border border-slate-700/50">
                        {t}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          <div className="relative z-10 mt-8 pt-8 border-t border-slate-700/50">
            <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 block mb-2">Total Amount</span>
            <div className="text-4xl font-black text-white">Rs.{finalAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })}</div>
            {isAdvance && <div className="mt-2 text-xs font-bold text-emerald-400 bg-emerald-400/10 inline-block px-3 py-1 rounded-full">50% Advance Selected</div>}
          </div>
        </div>

        {/* Right Side: Guest Details & Payment */}
        <div className="w-full lg:w-3/5 bg-white p-6 sm:p-10 rounded-[2.5rem] border border-slate-100 shadow-xl shadow-slate-100/50">
          
          <div className="mb-10">
            <h3 className="font-black text-slate-800 text-xl uppercase tracking-widest mb-6">Payment Options</h3>
            <div className="flex bg-slate-100 p-1.5 rounded-2xl w-full max-w-md">
              <button type="button" onClick={() => setIsAdvance(false)} className={`flex-1 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${!isAdvance ? "bg-white text-slate-900 shadow-sm" : "text-slate-400 hover:text-slate-600"}`}>Full Payment</button>
              <button type="button" onClick={() => setIsAdvance(true)} className={`flex-1 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${isAdvance ? "bg-emerald-500 text-white shadow-md shadow-emerald-500/20" : "text-slate-400 hover:text-slate-600"}`}>50% Advance</button>
            </div>
          </div>

          <div className="mb-10">
            <h3 className="font-black text-slate-800 text-xl uppercase tracking-widest mb-6">Guest Details</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              {[
                { id: "name", label: "Full Name", type: "text" },
                { id: "email", label: "Email Address", type: "email" },
                { id: "phone", label: "Phone Number", type: "tel" },
                { id: "nic", label: "NIC / Passport (Optional)", type: "text", required: false },
                { id: "address", label: "Address", type: "text" },
                { id: "city", label: "City", type: "text" },
              ].map((field) => (
                <div key={field.id} className="space-y-1.5">
                  <label htmlFor={field.id} className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">
                    {field.label}
                  </label>
                  <input
                    id={field.id}
                    type={field.type}
                    name={field.id}
                    value={userDetails[field.id as keyof UserDetails]}
                    onChange={handleUserChange}
                    placeholder={`Enter ${field.label.split(' ')[0].toLowerCase()}`}
                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3.5 text-sm font-bold text-slate-800 placeholder:text-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all hover:bg-white"
                    required={field.required !== false}
                  />
                </div>
              ))}
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-5 bg-slate-900 text-white font-black uppercase tracking-widest rounded-2xl hover:bg-slate-800 transition-all disabled:opacity-50 shadow-xl shadow-slate-900/10 flex items-center justify-center gap-3 group relative overflow-hidden"
          >
            {loading ? (
              <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            ) : (
              <>
                <span className="relative z-10">Confirm & Pay Rs.{finalAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                <svg className="w-5 h-5 relative z-10 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
                <div className="absolute inset-0 bg-white/10 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out"></div>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}

