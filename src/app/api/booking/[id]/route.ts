import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Booking, { IBooking } from "@/models/Booking";
import { verifyToken } from "@/lib/auth";

export async function PUT(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        await dbConnect();

        // The params argument needs to be awaited in Next.js 15+ (if using dynamic routes in app router, though here params is direct argument)
        // However, in some Next.js versions params might be a promise.
        // For standard route handlers, params is an object.
        const { id } = await params;

        const body = await req.json();
        const { token, paymentStatus, bookingStatus } = body;

        if (!token) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const decoded = verifyToken(token);
        if (!decoded || (decoded.role !== "admin" && decoded.role !== "super_admin")) {
            return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        }

        const updateData: Partial<IBooking> = {};
        if (paymentStatus) updateData.paymentStatus = paymentStatus;
        if (bookingStatus) updateData.status = bookingStatus;

        const booking = await Booking.findByIdAndUpdate(
            id,
            { $set: updateData },
            { new: true }
        );

        if (!booking) {
            return NextResponse.json({ error: "Booking not found" }, { status: 404 });
        }

        return NextResponse.json(booking);
    } catch (err: unknown) {
        console.error("Update Booking Error:", err);
        return NextResponse.json(
            { error: "Failed to update booking" },
            { status: 500 }
        );
    }
}
