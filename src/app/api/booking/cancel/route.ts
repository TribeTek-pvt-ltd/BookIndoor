import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Booking from "@/models/Booking";
import { IGround } from "@/models/Grounds";

export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const id = searchParams.get("id"); // this is paymentGroupId

        if (!id) {
            return NextResponse.json({ error: "Missing booking ID" }, { status: 400 });
        }

        await dbConnect();
        const bookings = await Booking.find({ paymentGroupId: id }).populate("ground");

        if (bookings.length === 0) {
            return NextResponse.json({ error: "Booking not found" }, { status: 404 });
        }

        const firstBooking = bookings[0];
        const ground = firstBooking.ground as unknown as IGround;

        // Check if cancellation is allowed (24 hours before the earliest booking)
        const sortedBookings = [...bookings].sort((a, b) => {
            const dateTimeA = new Date(`${a.date}T${a.timeSlots[0].startTime}`);
            const dateTimeB = new Date(`${b.date}T${b.timeSlots[0].startTime}`);
            return dateTimeA.getTime() - dateTimeB.getTime();
        });

        const earliestBooking = sortedBookings[0];
        const bookingDateTime = new Date(`${earliestBooking.date}T${earliestBooking.timeSlots[0].startTime}`);
        const now = new Date();

        // Calculate difference in hours
        const diffInMs = bookingDateTime.getTime() - now.getTime();
        const diffInHours = diffInMs / (1000 * 60 * 60);

        const isEligible = diffInHours >= 24;

        return NextResponse.json({
            bookings: bookings.map(b => ({
                date: b.date,
                timeSlots: b.timeSlots,
                status: b.status,
            })),
            groundName: ground.name,
            isEligible,
            reason: isEligible ? null : "Cancellations must be made at least 24 hours in advance.",
        });
    } catch (error) {
        console.error("Cancellation GET error:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        const { id } = await req.json(); // id is paymentGroupId

        if (!id) {
            return NextResponse.json({ error: "Missing booking ID" }, { status: 400 });
        }

        await dbConnect();
        const bookings = await Booking.find({ paymentGroupId: id });

        if (bookings.length === 0) {
            return NextResponse.json({ error: "Booking not found" }, { status: 404 });
        }

        // Double check eligibility
        const sortedBookings = [...bookings].sort((a, b) => {
            const dateTimeA = new Date(`${a.date}T${a.timeSlots[0].startTime}`);
            const dateTimeB = new Date(`${b.date}T${b.timeSlots[0].startTime}`);
            return dateTimeA.getTime() - dateTimeB.getTime();
        });

        const earliestBooking = sortedBookings[0];
        const bookingDateTime = new Date(`${earliestBooking.date}T${earliestBooking.timeSlots[0].startTime}`);
        const now = new Date();

        if ((bookingDateTime.getTime() - now.getTime()) / (1000 * 60 * 60) < 24) {
            return NextResponse.json({ error: "Cancellation period has passed" }, { status: 400 });
        }

        // Update status to cancelled
        await Booking.updateMany(
            { paymentGroupId: id },
            { $set: { status: "cancelled" } }
        );

        return NextResponse.json({ success: true, message: "Booking cancelled successfully" });
    } catch (error) {
        console.error("Cancellation POST error:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
