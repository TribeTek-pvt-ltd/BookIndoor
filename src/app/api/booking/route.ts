import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Booking from "@/models/Booking";
import Ground from "@/models/Grounds";

interface BookingItem {
  date: string; // "YYYY-MM-DD"
  timeSlots: { startTime: string }[];
}

interface BookingInput {
  token?: string; // optional for guest
  guest?: { name: string; email?: string; phone: string; nicNumber: string };
  ground: string;
  sportName: string;
  bookings: BookingItem[];
  paymentStatus: "pending" | "advanced_paid" | "full_paid";
}

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

    const format = (d: Date) => d.toTimeString().slice(0, 5); // "HH:mm"
    slots.push(`${format(current)}-${format(next)}`);
    current.setMinutes(current.getMinutes() + 30);
  }

  return slots;
}

// ✅ CREATE Booking (Supports Multiple Dates & Authenticated Users)
export async function POST(req: Request) {
  try {
    await dbConnect();
    const body: BookingInput = await req.json();

    // 0️⃣ Authenticate if token present
    let userId = null;
    if (body.token) {
      const { verifyToken } = await import("@/lib/auth");
      const decoded = verifyToken(body.token);
      if (decoded) userId = decoded.id;
    }

    // 1️⃣ Find Ground
    const ground = await Ground.findById(body.ground);
    if (!ground)
      return NextResponse.json({ error: "Ground not found" }, { status: 404 });

    // 2️⃣ Check slot availability for all dates
    for (const item of body.bookings) {
      const existing = await Booking.find({
        ground: body.ground,
        date: item.date,
        "timeSlots.startTime": { $in: item.timeSlots.map((t) => t.startTime) },
      });

      if (existing.length > 0) {
        return NextResponse.json(
          { error: `Some time slots on ${item.date} are already booked` },
          { status: 400 }
        );
      }
    }

    // 3️⃣ Find Sport and calculate total
    const sport = ground.sports.find(
      (s: { name: string }) => s.name === body.sportName
    );
    if (!sport)
      return NextResponse.json({ error: "Sport not found" }, { status: 404 });

    const pricePerSlot = sport.pricePerHour;

    // ✅ Allow "pending" status for admins (or anyone if logic allows, but restricted in frontend)
    // Default to "advanced_paid" if invalid status provided, but respect "pending" and "full_paid"
    const validStatuses = ["pending", "advanced_paid", "full_paid"];
    const paymentStatus = validStatuses.includes(body.paymentStatus)
      ? body.paymentStatus
      : "advanced_paid";

    const createdBookings = [];
    let grandTotal = 0;

    // 4️⃣ Create booking documents
    for (const item of body.bookings) {
      const slotCount = item.timeSlots.length;
      const totalAmount = slotCount * pricePerSlot;
      grandTotal += totalAmount;

      const booking = await Booking.create({
        ground: body.ground,
        sportName: body.sportName,
        user: userId, // ✅ Link to user if logged in
        guest: body.guest,
        date: item.date,
        timeSlots: item.timeSlots,
        totalAmount,
        paymentStatus,
        status: "reserved",
      });
      createdBookings.push(booking._id);
    }

    return NextResponse.json({
      success: true,
      bookingIds: createdBookings,
      amount: grandTotal,
    });
  } catch (err: unknown) {
    console.error("Booking Creation Error:", err);
    return NextResponse.json(
      { error: "Failed to create bookings" },
      { status: 500 }
    );
  }
}

// ✅ GET Bookings (Available slots OR List for Admin)
export async function GET(req: Request) {
  try {
    await dbConnect();
    const url = new URL(req.url);
    const groundId = url.searchParams.get("ground");
    const date = url.searchParams.get("date");
    const token = url.searchParams.get("token");

    // 🛡️ Admin List Mode: Fetch all bookings for admin's grounds
    const adminGroundId = url.searchParams.get("ground");

    if (token && !date) {
      const { verifyToken } = await import("@/lib/auth");
      const decoded = verifyToken(token);
      if (!decoded || !["admin", "super_admin"].includes(decoded.role)) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
      }

      let query: any = {};
      if (decoded.role === "admin") {
        const ownedGrounds = await Ground.find({ owner: decoded.id }).select("_id");
        const ownedIds = ownedGrounds.map(g => g._id.toString());

        if (adminGroundId) {
          if (!ownedIds.includes(adminGroundId)) {
            return NextResponse.json({ error: "Forbidden: You don't own this ground" }, { status: 403 });
          }
          query = { ground: adminGroundId };
        } else {
          query = { ground: { $in: ownedIds } };
        }
      } else if (adminGroundId) {
        // SuperAdmin can filter by any ground
        query = { ground: adminGroundId };
      }

      const bookings = await Booking.find(query)
        .populate("ground", "name")
        .sort({ date: -1, createdAt: -1 });

      return NextResponse.json(bookings);
    }

    if (!groundId || !date) {
      return NextResponse.json(
        { error: "Missing ground or date" },
        { status: 400 }
      );
    }

    // 🏟️ Get Ground Data for Slot Generation
    const ground = await Ground.findById(groundId);
    if (!ground) {
      return NextResponse.json({ error: "Ground not found" }, { status: 404 });
    }

    const { from, to } = ground.availableTime;
    const timeSlots = generateTimeSlots(from, to);

    // 📅 Get Bookings for that specific date and ground
    const bookings = await Booking.find({ ground: groundId, date });

    // Flatten booked slots
    const bookedSet = new Set(
      bookings.flatMap((b) =>
        b.timeSlots.map((ts: { startTime: string }) => ts.startTime)
      )
    );

    // 🟢 Return slot availability
    const response = timeSlots.map((slot) => {
      const startTime = slot.split("-")[0];
      return {
        timeSlot: slot,
        status: bookedSet.has(startTime) ? "booked" : "available",
      };
    });

    return NextResponse.json(response);
  } catch (err: unknown) {
    console.error("Fetch Bookings Error:", err);
    return NextResponse.json(
      { error: "Failed to fetch bookings" },
      { status: 500 }
    );
  }
}
