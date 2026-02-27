"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { FaCalendarAlt, FaClock, FaExclamationTriangle, FaCheckCircle, FaSpinner } from "react-icons/fa";

function CancellationContent() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const id = searchParams.get("id");

    const [loading, setLoading] = useState(true);
    const [bookingData, setBookingData] = useState<any>(null);
    const [error, setError] = useState<string | null>(null);
    const [cancelling, setCancelling] = useState(false);
    const [done, setDone] = useState(false);

    useEffect(() => {
        if (!id) {
            setError("Invalid cancellation link.");
            setLoading(false);
            return;
        }

        const fetchBooking = async () => {
            try {
                const res = await fetch(`/api/booking/cancel?id=${id}`);
                const data = await res.json();

                if (!res.ok) {
                    setError(data.error || "Failed to fetch booking details.");
                } else {
                    setBookingData(data);
                }
            } catch (err) {
                setError("Something went wrong. Please try again later.");
            } finally {
                setLoading(false);
            }
        };

        fetchBooking();
    }, [id]);

    const handleCancel = async () => {
        if (!id) return;

        setCancelling(true);
        try {
            const res = await fetch("/api/booking/cancel", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ id }),
            });

            if (!res.ok) {
                const data = await res.json();
                setError(data.error || "Failed to cancel booking.");
            } else {
                setDone(true);
            }
        } catch (err) {
            setError("Failed to cancel booking. Please try again.");
        } finally {
            setCancelling(false);
        }
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh]">
                <FaSpinner className="animate-spin text-4xl text-green-600 mb-4" />
                <p className="text-gray-600">Loading booking details...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] max-w-md mx-auto text-center px-4">
                <FaExclamationTriangle className="text-5xl text-red-500 mb-6" />
                <h1 className="text-2xl font-bold mb-4">Oops!</h1>
                <p className="text-gray-600 mb-8">{error}</p>
                <button
                    onClick={() => router.push('/')}
                    className="bg-green-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-green-700 transition"
                >
                    Go Back Home
                </button>
            </div>
        );
    }

    if (done) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] max-w-md mx-auto text-center px-4">
                <FaCheckCircle className="text-5xl text-green-500 mb-6" />
                <h1 className="text-2xl font-bold mb-4">Booking Cancelled</h1>
                <p className="text-gray-600 mb-8">
                    Your reservation has been successfully cancelled. The slots are now available for others.
                </p>
                <button
                    onClick={() => router.push('/')}
                    className="bg-green-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-green-700 transition"
                >
                    Return to Home
                </button>
            </div>
        );
    }

    const isCancelled = bookingData.bookings.some((b: any) => b.status === 'cancelled');

    return (
        <div className="max-w-2xl mx-auto py-12 px-4">
            <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
                <div className="bg-green-600 p-8 text-white text-center">
                    <h1 className="text-3xl font-bold mb-2">Cancel Your Booking</h1>
                    <p className="opacity-90">{bookingData.groundName}</p>
                </div>

                <div className="p-8">
                    {isCancelled ? (
                        <div className="bg-blue-50 border-l-4 border-blue-500 p-4 mb-8">
                            <p className="text-blue-700 font-medium">This booking is already cancelled.</p>
                        </div>
                    ) : (
                        <>
                            <div className="mb-8">
                                <h2 className="text-lg font-semibold mb-4 text-gray-800 border-bottom pb-2">Booking Details</h2>
                                <div className="space-y-4">
                                    {bookingData.bookings.map((booking: any, idx: number) => (
                                        <div key={idx} className="flex flex-col sm:flex-row sm:items-center gap-4 bg-gray-50 p-4 rounded-xl">
                                            <div className="flex items-center gap-3 text-gray-700">
                                                <FaCalendarAlt className="text-green-600" />
                                                <span className="font-medium">{booking.date}</span>
                                            </div>
                                            <div className="flex items-center gap-3 text-gray-700">
                                                <FaClock className="text-green-600" />
                                                <span>{booking.timeSlots.map((ts: any) => ts.startTime).join(", ")}</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="bg-yellow-50 border-l-4 border-yellow-400 p-6 mb-8 rounded-r-xl">
                                <div className="flex gap-4">
                                    <FaExclamationTriangle className="text-yellow-500 text-xl flex-shrink-0 mt-1" />
                                    <div>
                                        <h3 className="font-bold text-yellow-800 mb-1">Cancellation Policy</h3>
                                        <p className="text-yellow-700 text-sm leading-relaxed">
                                            Cancellations must be made at least 24 hours before the scheduled time.
                                            Once cancelled, this action cannot be undone.
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {!bookingData.isEligible ? (
                                <div className="bg-red-50 p-4 rounded-xl text-red-700 text-center text-sm font-medium mb-8">
                                    {bookingData.reason}
                                </div>
                            ) : (
                                <div className="flex flex-col gap-4">
                                    <button
                                        onClick={handleCancel}
                                        disabled={cancelling}
                                        className="w-full bg-red-600 text-white py-4 rounded-xl font-bold text-lg hover:bg-red-700 transition disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-red-200"
                                    >
                                        {cancelling ? "Processing..." : "Confirm Cancellation"}
                                    </button>
                                    <button
                                        onClick={() => router.push('/')}
                                        disabled={cancelling}
                                        className="w-full bg-gray-100 text-gray-700 py-3 rounded-xl font-semibold hover:bg-gray-200 transition"
                                    >
                                        Keep Booking
                                    </button>
                                </div>
                            )}
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}

export default function CancelBookingPage() {
    return (
        <div className="min-h-screen bg-gray-50">
            <Suspense fallback={
                <div className="flex flex-col items-center justify-center min-h-screen">
                    <FaSpinner className="animate-spin text-4xl text-green-600" />
                </div>
            }>
                <CancellationContent />
            </Suspense>
        </div>
    );
}
