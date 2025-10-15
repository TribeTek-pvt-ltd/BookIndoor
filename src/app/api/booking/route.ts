import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Booking from "@/models/Booking";
import Ground from "@/models/Grounds";
import { verifyToken } from "@/lib/auth";

interface BookingInput {
  token?: string; // optional for guest
  guest?: { name: string; email?: string; phone: string; nicNumber: string };
  ground: string;
  sportName: string;
  date: string; // "YYYY-MM-DD"
  timeSlots: { startTime: string }[];
  totalAmount: number;
  paymentStatus: "advanced_paid" | "full_paid";
}

// Helper function to generate 30-minute slots

// Helper function to generate 30-minute slots
function generateTimeSlots(from: string, to: string) {
  const slots: string[] = [];
  const [fromH, fromM] = from.split(":").map(Number);
  const [toH, toM] = to.split(":").map(Number);

  const start = new Date();
  start.setHours(fromH, fromM, 0, 0);
  const end = new Date();
  end.setHours(toH, toM, 0, 0);

  const current = new Date(start);

  while (current < end) {
    const next = new Date(current);
    next.setMinutes(next.getMinutes() + 30);

    const format = (d: Date) => d.toTimeString().slice(0, 5); // "HH:mm"

    slots.push(`${format(current)}-${format(next)}`);
    current.setMinutes(current.getMinutes() + 30);
  }

  return slots;
}

// ✅ CREATE Booking
// api/booking/route.ts
export async function POST(req: Request) {
  try {
    await dbConnect();
    const body: BookingInput = await req.json();

    // 1️⃣ Find Ground
    const ground = await Ground.findById(body.ground);
    console.log(body.guest);
    if (!ground)
      return NextResponse.json({ error: "Ground not found" }, { status: 404 });

    // 2️⃣ Check slot availability
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

    // 3️⃣ Recalculate total securely
    const slotCount = body.timeSlots.length;
    const sport = ground.sports.find(
      (s: { name: string }) => s.name === body.sportName
    );
    if (!sport)
      return NextResponse.json({ error: "Sport not found" }, { status: 404 });

    const pricePerSlot = sport.pricePerHour;
    const totalAmount = slotCount * pricePerSlot;

    // 4️⃣ Determine payment status
    const paymentStatus =
      body.paymentStatus === "full_paid" ? "full_paid" : "advanced_paid";

    // 5️⃣ Create booking
    const booking = await Booking.create({
      ground: body.ground,
      sportName: body.sportName,
      guest: body.guest,
      date: body.date,
      timeSlots: body.timeSlots,
      totalAmount,
      paymentStatus,
      status: "reserved",
    });

    return NextResponse.json({
      success: true,
      bookingId: booking._id,
      amount: totalAmount, // secure amount
    });
  } catch (err) {
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
    const token = url.searchParams.get("token");

    if (!groundId || !date) {
      return NextResponse.json(
        { error: "Missing ground or date" },
        { status: 400 }
      );
    }

    const decoded = token ? verifyToken(token) : null;

    // 🏟️ Get Ground Data
    const ground = await Ground.findById(groundId);
    if (!ground) {
      return NextResponse.json({ error: "Ground not found" }, { status: 404 });
    }

    const { from, to } = ground.availableTime;
    const timeSlots = generateTimeSlots(from, to);

    // 📅 Get Bookings for that date
    const bookings = await Booking.find({ ground: groundId, date });

    // Flatten booked slots from all bookings
    const bookedSet = new Set(
      bookings.flatMap((b) =>
        b.timeSlots.map((ts: { startTime: any }) => ts.startTime)
      )
    );

    // 🟢 Build Response with slot status
    const response = timeSlots.map((slot) => {
      const startTime = slot.split("-")[0];
      return {
        timeSlot: slot,
        status: bookedSet.has(startTime) ? "booked" : "available",
      };
    });

    return NextResponse.json(response);
  } catch (err: any) {
    console.error("Fetch Bookings Error:", err);
    return NextResponse.json(
      { error: "Failed to fetch available slots" },
      { status: 500 }
    );
  }
}
