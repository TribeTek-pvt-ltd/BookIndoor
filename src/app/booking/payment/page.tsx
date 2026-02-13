"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import PaymentForm from "@/components/PaymentForm";
import { ChevronLeftIcon } from "@heroicons/react/24/solid";

interface BookingItem {
    date: string;
    times: string[];
}

interface BookingDetails {
    groundId: string;
    sportName: string;
    groundName: string;
    location: string;
    bookings: BookingItem[];
    amount: number;
}

export default function PaymentPage() {
    const router = useRouter();
    const [bookingDetails, setBookingDetails] = useState<BookingDetails | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const storedDetails = sessionStorage.getItem("pendingBooking");
        if (storedDetails) {
            try {
                setBookingDetails(JSON.parse(storedDetails));
            } catch (err) {
                console.error("Failed to parse booking details:", err);
                router.push("/");
            }
        } else {
            router.push("/");
        }
        setLoading(false);
    }, [router]);

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-slate-50">
                <div className="w-16 h-16 rounded-full border-4 border-slate-200 border-t-emerald-600 animate-spin"></div>
            </div>
        );
    }

    if (!bookingDetails) {
        return null;
    }

    return (
        <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto">
                <button
                    onClick={() => router.back()}
                    className="mb-8 flex items-center gap-2 text-slate-600 hover:text-emerald-600 transition-colors font-medium"
                >
                    <ChevronLeftIcon className="w-5 h-5" />
                    Back to Ground Details
                </button>

                <div className="grid grid-cols-1 lg:grid-cols-1 gap-8">
                    <div className="bg-white rounded-[2rem] shadow-xl border border-slate-100 overflow-hidden">
                        <div className="bg-emerald-600 p-8 text-white">
                            <h1 className="text-3xl font-black font-outfit">Complete Your Booking</h1>
                            <p className="text-emerald-100 mt-2 font-medium">
                                Please review your details and proceed to payment.
                            </p>
                        </div>

                        <div className="p-8">
                            <PaymentForm
                                bookingDetails={{
                                    groundId: bookingDetails.groundId,
                                    sportName: bookingDetails.sportName,
                                    groundName: bookingDetails.groundName,
                                    location: bookingDetails.location,
                                    bookings: bookingDetails.bookings,
                                }}
                                amount={bookingDetails.amount}
                                onPaymentSuccess={() => {
                                    sessionStorage.removeItem("pendingBooking");
                                    // PaymentForm already handles redirect to success page via PayHere return_url
                                    // But onPaymentSuccess can be used for extra cleanup if needed.
                                }}
                            />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
