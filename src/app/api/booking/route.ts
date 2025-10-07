import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Booking from "@/models/Booking";
import Ground from "@/models/Grounds";
import { verifyToken } from "@/lib/auth";

interface BookingBody {
  token: string;
  groundId: string;
  sport: string;
  date: string; // YYYY-MM-DD
  slots: string[]; // ["06:00-07:00", "07:00-08:00"]
  paymentStatus: "advanced_paid" | "full_paid";
}

// ✅ CREATE Booking
export async function POST(req: Request) {
  try {
    await dbConnect();
    const body: BookingBody = await req.json();
    const decoded = verifyToken(body.token);

    if (!decoded)
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });

    const ground = await Ground.findById(body.groundId);
    if (!ground)
      return NextResponse.json({ error: "Ground not found" }, { status: 404 });

    if (!ground.sports.some((s: { name: string }) => s.name === body.sport)) {
      return NextResponse.json(
        { error: "Sport not available" },
        { status: 400 }
      );
    }

    const slots = body.slots.map((slot) => ({
      timeSlot: slot,
      status: body.paymentStatus === "advanced_paid" ? "reserved" : "confirmed",
    }));

    const booking = await Booking.create({
      user: decoded.id,
      ground: body.groundId,
      sport: body.sport,
      date: body.date,
      slots,
      paymentStatus: body.paymentStatus,
    });

    return NextResponse.json({ success: true, booking });
  } catch (err: any) {
    console.error("Booking Error:", err);
    if (err.code === 11000) {
      return NextResponse.json(
        { error: "One or more slots already booked" },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: "Failed to book slots" },
      { status: 500 }
    );
  }
}

// ✅ GET Bookings
export async function GET(req: Request) {
  try {
    await dbConnect();
    const url = new URL(req.url);
    const token = url.searchParams.get("token");
    const decoded = token ? verifyToken(token) : null;

    if (!decoded)
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });

    let bookings;
    if (["admin", "super_admin"].includes(decoded.role)) {
      bookings = await Booking.find()
        .populate("user", "name email")
        .populate("ground", "name location");
    } else {
      bookings = await Booking.find({ user: decoded.id }).populate(
        "ground",
        "name location"
      );
    }

    return NextResponse.json(bookings);
  } catch (err: any) {
    console.error("Fetch Booking Error:", err);
    return NextResponse.json(
      { error: "Failed to fetch bookings" },
      { status: 500 }
    );
  }
}

// ✅ CANCEL Booking or Slot
export async function DELETE(
  req: Request,
  { params }: { params: { id: string; slot?: string } }
) {
  try {
    await dbConnect();
    const { id, slot } = params;
    const { token } = await req.json();
    const decoded = verifyToken(token);

    if (!decoded)
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });

    const booking = await Booking.findById(id);
    if (!booking)
      return NextResponse.json({ error: "Booking not found" }, { status: 404 });

    if (
      decoded.role !== "super_admin" &&
      decoded.role !== "admin" &&
      booking.user.toString() !== decoded.id
    ) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    if (slot) {
      // Remove a specific slot
      booking.slots = booking.slots.filter(
        (s: { timeSlot: string }) => s.timeSlot !== slot
      );
      if (booking.slots.length === 0) {
        await booking.deleteOne();
      } else {
        await booking.save();
      }
    } else {
      // Remove entire booking
      await booking.deleteOne();
    }

    return NextResponse.json({ success: true, message: "Booking cancelled" });
  } catch (err: any) {
    console.error("Booking Delete Error:", err);
    return NextResponse.json(
      { error: "Failed to cancel booking" },
      { status: 500 }
    );
  }
}
