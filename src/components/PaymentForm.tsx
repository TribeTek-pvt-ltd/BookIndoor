"use client";

import { useState } from "react";

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
  onPaymentSuccess?: (data: BookingResponse) => void;
}

// ✅ User details type
interface UserDetails {
  name: string;
  phone: string;
  nic: string;
  email: string;
  address: string;
  city: string;
}

// ✅ Keys type for iteration
type UserDetailKeys = keyof UserDetails;

export default function PaymentForm({
  bookingDetails,
  amount,
}: PaymentFormProps) {
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

  // ✅ Type-safe handler
  const handleUserChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    if (name in userDetails) {
      setUserDetails((prev) => ({ ...prev, [name as UserDetailKeys]: value }));
    }
  };

  const finalAmount = isAdvance ? amount * 0.5 : amount;
  const toggleAdvancePayment = () => setIsAdvance((prev) => !prev);

  const handlePayHerePayment = async (orderId: string, amount: number) => {
    try {
      // 1. Generate Hash
      // orderId is now the paymentGroupId (or single booking ID)
      const currency = "LKR";

      const hashResponse = await fetch("/api/payhere/hash", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          order_id: orderId,
          amount: amount,
          currency: currency,
        }),
      });

      const hashData = await hashResponse.json();

      if (!hashData.hash) {
        throw new Error("Failed to generate payment hash");
      }

      // 2. Prepare PayHere Form Data
      const payhereParams = {
        merchant_id: hashData.merchantId,
        return_url: `${window.location.origin}/booking/success`,
        cancel_url: `${window.location.origin}/booking/cancel`,
        notify_url: `${window.location.origin}/api/payhere/notify`,
        order_id: orderId,
        items: `Ground Booking - ${bookingDetails.groundName}`,
        currency: currency,
        amount: amount.toFixed(2),
        first_name: userDetails.name.split(" ")[0],
        last_name: userDetails.name.split(" ").slice(1).join(" ") || "",
        email: userDetails.email,
        phone: userDetails.phone,
        address: userDetails.address,
        city: userDetails.city,
        country: "Sri Lanka",
        hash: hashData.hash,
        custom_1: isAdvance ? "advance" : "full", // Pass payment type
        custom_2: "",
      };

      // 3. Submit Form programmatically
      const form = document.createElement("form");
      form.setAttribute("method", "POST");
      form.setAttribute("action", "https://sandbox.payhere.lk/pay/checkout"); // Use sandbox for testing
      // For production, use: https://www.payhere.lk/pay/checkout

      for (const key in payhereParams) {
        if (Object.prototype.hasOwnProperty.call(payhereParams, key)) {
          const hiddenField = document.createElement("input");
          hiddenField.setAttribute("type", "hidden");
          hiddenField.setAttribute("name", key);
          hiddenField.setAttribute("value", payhereParams[key as keyof typeof payhereParams]);
          form.appendChild(hiddenField);
        }
      }

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

    if (
      !userDetails.name ||
      !userDetails.phone ||
      !userDetails.nic ||
      !userDetails.email ||
      !userDetails.address ||
      !userDetails.city
    ) {
      alert("Please fill in all your details including address and city.");
      return;
    }

    setLoading(true);

    try {
      // Step 0: Get token
      const token = localStorage.getItem("token");

      // Step 1: Create booking with "pending" status
      const response = await fetch("/api/booking", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          token, // ✅ Pass token to link booking to user
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
            timeSlots: b.times.map((t) => ({ startTime: t })),
          })),
          paymentStatus: "pending", // Initially pending
        }),
      });

      const data: BookingResponse = await response.json();
      if (!response.ok) {
        alert(data.error || "Booking failed!");
        setLoading(false);
        return;
      }

      console.log("✅ Booking Created (Pending Payment):", data);

      if (data.paymentGroupId) {
        // Initiate PayHere Payment with Group ID
        await handlePayHerePayment(data.paymentGroupId, finalAmount);
      } else if (data.bookingIds && data.bookingIds.length > 0) {
        // Fallback to first ID if no group ID (shouldn't happen with new API)
        await handlePayHerePayment(data.bookingIds[0], finalAmount);
      } else {
        alert("Booking created but no ID returned.");
        setLoading(false);
      }

    } catch (err) {
      console.error("Booking Error:", err);
      alert("Failed to create booking. Please try again.");
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto">
      <form
        onSubmit={handleBooking}
        className="p-4 sm:p-8  space-y-6 "
      >
        {/* Booking Summary */}
        <div className=" p-5 ">
          <h3 className="font-semibold text-green-800 mb-3 text-lg">
            Booking Summary
          </h3>
          <div className="space-y-1 text-green-900">
            <p>
              <span className="font-medium">Ground:</span>{" "}
              {bookingDetails.groundName}
            </p>
            <p>
              <span className="font-medium">Location:</span>{" "}
              {bookingDetails.location}
            </p>
            <div className="max-h-40 overflow-y-auto space-y-3 pr-2 scrollbar-thin scrollbar-thumb-green-200">
              {bookingDetails.bookings.map((booking, index) => (
                <div key={index} className="bg-white/50 p-3 rounded-lg border border-green-100/50">
                  <p className="text-sm font-bold text-green-800 flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-green-500"></span>
                    {booking.date}
                  </p>
                  <p className="text-sm text-green-700 mt-1 pl-4">
                    {booking.times.join(", ")}
                  </p>
                </div>
              ))}
            </div>
            <p className="border-t border-green-200 pt-3">
              <span className="font-medium">Payment Type:</span>{" "}
              {isAdvance ? "Advance (50%)" : "Full"}
            </p>
            <div className="mt-4 text-green-900 font-bold text-xl text-center bg-green-100 py-3 rounded-lg shadow-sm">
              Grand Total:{" "}
              <span className="text-green-700">
                Rs.{finalAmount.toFixed(2)}
              </span>
            </div>
          </div>
        </div>

        {/* Advance Payment Toggle */}
        <div className="flex justify-center">
          <button
            type="button"
            onClick={toggleAdvancePayment}
            className={`px-4 py-2 rounded-lg font-semibold transition ${isAdvance
              ? "bg-green-700 text-white"
              : "bg-green-100 text-green-700 border border-green-300"
              }`}>
            {isAdvance ? "Pay Full Payment" : "Pay 50% Advance"}
          </button>
        </div>

        {/* User Details */}
        <div className="space-y-4">
          {(["name", "email", "phone", "nic", "address", "city"] as UserDetailKeys[]).map(
            (field) => (
              <div key={field}>
                <label className="block text-green-700 font-medium mb-1 capitalize">
                  {field === "nic" ? "NIC / Passport Number" : field}
                </label>
                <input
                  type={
                    field === "email"
                      ? "email"
                      : field === "phone"
                        ? "tel"
                        : "text"
                  }
                  name={field}
                  value={userDetails[field]}
                  onChange={handleUserChange}
                  placeholder={`Enter your ${field}`}
                  className="w-full border border-gray-300 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-green-600"
                  required
                />
              </div>
            )
          )}
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full mt-4 px-4 py-3 bg-green-700 !text-white font-bold rounded-lg hover:bg-green-800 transition disabled:opacity-50 shadow-lg"
        >
          {loading
            ? "Processing..."
            : `Pay Rs.${finalAmount.toFixed(2)} with PayHere`}
        </button>
      </form>
    </div>
  );
}
