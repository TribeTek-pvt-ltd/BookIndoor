import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Booking from "@/models/Booking";
import Ground from "@/models/Grounds";
import { verifyToken } from "@/lib/auth";

interface BookingInput {
  token?: string; // optional for guest
  guest?: { name: string; email?: string; phone: string };
  ground: string;
  sportName: string;
  date: string; // "YYYY-MM-DD"
  timeSlots: { startTime: string }[];
  totalAmount: number;
  paymentStatus: "advanced_paid" | "full_paid";
}

// ✅ CREATE Booking
export async function POST(req: Request) {
  try {
    await dbConnect();
    const body: BookingInput = await req.json();

    let userId: string | undefined = undefined;
    if (body.token) {
      const decoded = verifyToken(body.token);
      if (!decoded || !["admin", "super_admin"].includes(decoded.role)) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
      }
      userId = decoded.id;
    }

    // Check if ground exists
    const ground = await Ground.findById(body.ground);
    if (!ground) {
      return NextResponse.json({ error: "Ground not found" }, { status: 404 });
    }

    // Check for overlapping slots
    const existing = await Booking.find({
      ground: body.ground,
      date: body.date,
      "timeSlots.startTime": { $in: body.timeSlots.map((t) => t.startTime) },
    });

    if (existing.length > 0) {
      return NextResponse.json(
        { error: "Some time slots are already booked" },
        { status: 400 }
      );
    }

    // Create booking
    const booking = await Booking.create({
      ground: body.ground,
      sportName: body.sportName,
      user: userId,
      guest: body.guest,
      date: body.date,
      timeSlots: body.timeSlots,
      totalAmount: body.totalAmount,
      paymentStatus: body.paymentStatus,
      status: body.paymentStatus === "full_paid" ? "confirmed" : "reserved",
    });

    return NextResponse.json({ success: true, booking });
  } catch (err: any) {
    console.error("Booking Creation Error:", err);
    return NextResponse.json(
      { error: "Failed to create booking" },
      { status: 500 }
    );
  }
}

// ✅ GET Booked Slots for a Ground on a Date
export async function GET(req: Request) {
  try {
    await dbConnect();
    const url = new URL(req.url);
    const groundId = url.searchParams.get("ground");
    const date = url.searchParams.get("date");
    const token = url.searchParams.get("token"); // optional

    if (!groundId || !date) {
      return NextResponse.json(
        { error: "Missing ground or date" },
        { status: 400 }
      );
    }

    const decoded = token ? verifyToken(token) : null;

    const bookings = await Booking.find({ ground: groundId, date });

    const response = bookings.map((b) => {
      const slotInfo: any = {
        timeSlots: b.timeSlots,
        status: b.status,
        paymentStatus: b.paymentStatus,
      };

      // Only admin or ground owner can see user/guest details
      if (
        decoded &&
        decoded.role &&
        ["admin", "super_admin"].includes(decoded.role)
      ) {
        slotInfo.user = b.user;
        slotInfo.guest = b.guest;
      }

      return slotInfo;
    });

    return NextResponse.json(response);
  } catch (err: any) {
    console.error("Fetch Bookings Error:", err);
    return NextResponse.json(
      { error: "Failed to fetch bookings" },
      { status: 500 }
    );
  }
}
