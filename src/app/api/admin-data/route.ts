import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import User from "@/models/User";
import Grounds from "@/models/Grounds";
import Booking from "@/models/Booking";
import { verifyToken } from "@/lib/auth";

export async function GET(req: Request) {
  try {
    await dbConnect();

    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const decoded = verifyToken(authHeader.split(" ")[1]);
    if (!decoded || !["super_admin", "admin"].includes(decoded.role)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    let users, groundsList, bookings;

    if (decoded.role === "super_admin") {
      [users, groundsList, bookings] = await Promise.all([
        User.find({}).select("-passwordHash").lean(),
        Grounds.find({}).lean(),
        Booking.find({}).populate("ground", "name").lean(),
      ]);
    } else {
      // Admin: Fetch owned grounds first
      groundsList = await Grounds.find({ owner: decoded.id }).lean();
      const groundIds = groundsList.map((g) => g._id);

      // Parallelize bookings and users fetch
      [bookings, users] = await Promise.all([
        Booking.find({ ground: { $in: groundIds } }).populate("ground", "name").lean(),
        (async () => {
          const bks = await Booking.find({ ground: { $in: groundIds } }).select("user").lean();
          const uniqueCustomerIds = [...new Set(bks.map(b => b.user?.toString()).filter(Boolean))];
          return User.find({
            $or: [{ _id: decoded.id }, { _id: { $in: uniqueCustomerIds } }],
          }).select("-passwordHash").lean();
        })()
      ]);
    }

    return NextResponse.json({ users, grounds: groundsList, bookings });
  } catch (err) {
    console.error("Fetch Admin Data Error:", err);
    return NextResponse.json({ error: "Failed to fetch data" }, { status: 500 });
  }
}

