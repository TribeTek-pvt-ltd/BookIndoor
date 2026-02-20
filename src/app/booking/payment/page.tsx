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

export default function PaymentPage({ isModal = false }: { isModal?: boolean }) {
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
            <div className={`flex items-center justify-center ${isModal ? "p-12" : "min-h-screen bg-slate-50"}`}>
                <div className="w-16 h-16 rounded-full border-4 border-slate-200 border-t-emerald-600 animate-spin"></div>
            </div>
        );
    }

    if (!bookingDetails) {
        return null;
    }

    return (
        <div className={`${isModal ? "" : "bg-slate-50 py-8 px-4 sm:px-6 lg:px-8"} flex flex-col justify-center`}>
            <div className={isModal ? "w-full" : "max-w-4xl mx-auto"}>


                <div className="w-full">
                    <div className={`${isModal ? "" : "bg-white rounded-[2rem] shadow-xl border border-slate-100"} overflow-hidden`}>
                        <div className="p-6 sm:p-8 text-center">
                            <h1 className="text-2xl sm:text-3xl font-black font-outfit">Complete Your Booking</h1>
                            <p className="mt-1 sm:mt-2 font-medium text-sm sm:base">
                                Please review your details and proceed to payment.
                            </p>
                        </div>

                        <div className="p-4 sm:p-6 max-h-[60vh] overflow-y-auto scrollbar-thin scrollbar-thumb-emerald-500 scrollbar-track-emerald-50/50">
                            <style jsx>{`
                                div::-webkit-scrollbar {
                                    width: 6px;
                                }
                                div::-webkit-scrollbar-track {
                                    background: transparent;
                                }
                                div::-webkit-scrollbar-thumb {
                                    background: #10b981;
                                    border-radius: 10px;
                                }
                                div::-webkit-scrollbar-thumb:hover {
                                    background: #059669;
                                }
                            `}</style>
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
