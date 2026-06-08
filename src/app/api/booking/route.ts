import { NextResponse } from "next/server";
import mongoose from "mongoose";
import dbConnect from "@/lib/mongodb";
import Booking from "@/models/Booking";
import Ground from "@/models/Grounds";
import { verifyToken } from "@/lib/auth";
import { BatchBookingSchema } from "@/lib/schemas";

// ✅ Helper function to generate 30-minute slots
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
    const format = (d: Date) => d.toTimeString().slice(0, 5);
    slots.push(`${format(current)}-${format(next)}`);
    current.setMinutes(current.getMinutes() + 30);
  }
  return slots;
}

// ✅ CREATE Booking
export async function POST(req: Request) {
  try {
    await dbConnect();
    const body = await req.json();
    
    // Zod validation
    const validation = BatchBookingSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json({ error: validation.error?.issues?.[0]?.message || "Validation failed" }, { status: 400 });
    }
    const data = validation.data;

    // Authenticate
    const authHeader = req.headers.get("Authorization");
    let userId = null;
    if (authHeader?.startsWith("Bearer ")) {
      const decoded = verifyToken(authHeader.split(" ")[1]);
      if (decoded) userId = decoded.id;
    }

    const ground = await Ground.findById(data.ground).lean();
    if (!ground) return NextResponse.json({ error: "Ground not found" }, { status: 404 });

    // Check availability (parallelize if multiple dates)
    const availabilityChecks = data.bookings.map(item => 
      Booking.findOne({
        ground: data.ground,
        date: item.date,
        status: { $ne: 'cancelled' },
        "timeSlots.startTime": { $in: item.timeSlots.map(t => t.startTime) },
      }).lean()
    );
    
    const results = await Promise.all(availabilityChecks);
    if (results.some(r => r !== null)) {
      return NextResponse.json({ error: "Some time slots are already booked" }, { status: 400 });
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const sport = (ground as any).sports?.find((s: any) => s.name === data.sportName);
    if (!sport) return NextResponse.json({ error: "Sport not found" }, { status: 404 });

    const pricePerSlot = sport.pricePerHour;
    const paymentGroupId = new mongoose.Types.ObjectId().toString();
    const createdBookings = [];
    let grandTotal = 0;

    for (const item of data.bookings) {
      const totalAmount = item.timeSlots.length * pricePerSlot;
      grandTotal += totalAmount;

      const booking = await Booking.create({
        ground: data.ground,
        sportName: data.sportName,
        user: userId,
        guest: data.guest,
        date: item.date,
        timeSlots: item.timeSlots,
        totalAmount,
        paymentStatus: data.paymentStatus,
        paymentGroupId,
        status: "reserved",
      });
      createdBookings.push(booking._id);
    }

    return NextResponse.json({ success: true, bookingIds: createdBookings, paymentGroupId, amount: grandTotal });
  } catch (err) {
    console.error("Booking Creation Error:", err);
    return NextResponse.json({ error: "Failed to create bookings" }, { status: 500 });
  }
}

// ✅ GET Bookings
export async function GET(req: Request) {
  try {
    await dbConnect();
    const url = new URL(req.url);
    const groundId = url.searchParams.get("ground");
    const date = url.searchParams.get("date");
    const authHeader = req.headers.get("Authorization");

    // Admin List Mode
    if (authHeader?.startsWith("Bearer ") && !date) {
      const decoded = verifyToken(authHeader.split(" ")[1]);
      if (!decoded || !["admin", "super_admin"].includes(decoded.role)) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
      }

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const query: any = {};
      if (decoded.role === "admin") {
        const ownedGrounds = await Ground.find({ owner: decoded.id }).select("_id").lean();
        const ownedIds = ownedGrounds.map(g => String(g._id));
        if (groundId) {
          if (!ownedIds.includes(groundId)) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
          query.ground = groundId;
        } else query.ground = { $in: ownedIds };
      } else if (groundId) query.ground = groundId;

      const page = parseInt(url.searchParams.get("page") || "1", 10);
      const limit = parseInt(url.searchParams.get("limit") || "10", 10);
      const skip = (page - 1) * limit;

      const total = await Booking.countDocuments(query);
      const bookings = await Booking.find(query)
        .populate("ground", "name")
        .sort({ date: -1, createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean();

      return NextResponse.json({ bookings, total, page, limit });
    }

    if (!groundId || !date) return NextResponse.json({ error: "Missing parameters" }, { status: 400 });

    const ground = await Ground.findById(groundId).select("availableTime").lean();
    if (!ground) return NextResponse.json({ error: "Ground not found" }, { status: 404 });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const timeSlots = generateTimeSlots((ground as any).availableTime.from, (ground as any).availableTime.to);
    const bookings = await Booking.find({ ground: groundId, date, status: { $ne: "cancelled" } }).select("timeSlots").lean();

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const bookedSet = new Set(bookings.flatMap(b => b.timeSlots.map((ts: any) => ts.startTime)));

    const response = timeSlots.map(slot => ({
      timeSlot: slot,
      status: bookedSet.has(slot.split("-")[0]) ? "booked" : "available",
    }));

    return NextResponse.json(response);
  } catch (err) {
    console.error("Fetch Bookings Error:", err);
    return NextResponse.json({ error: "Failed to fetch bookings" }, { status: 500 });
  }
}

