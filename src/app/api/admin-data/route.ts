import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import User from "@/models/User";
import Grounds from "@/models/Grounds";
import Booking from "@/models/Booking";
import { verifyToken } from "@/lib/auth";

export async function GET(req: Request) {
    try {
        await dbConnect();

        const url = new URL(req.url);
        const token = url.searchParams.get("token");

        if (!token) {
            return NextResponse.json({ error: "Token required" }, { status: 403 });
        }

        const decoded = verifyToken(token);
        if (!decoded || (decoded.role !== "super_admin" && decoded.role !== "admin")) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
        }

        let users, groundsList, bookings;

        if (decoded.role === "super_admin") {
            users = await User.find({}).select("-passwordHash");
            groundsList = await Grounds.find({});
            bookings = await Booking.find({}).populate("ground");
        } else {
            // For Admin:
            // 1. Grounds owned by this admin
            groundsList = await Grounds.find({ owner: decoded.id });
            const groundIds = groundsList.map((g) => g._id);

            // 2. Bookings for these grounds
            bookings = await Booking.find({ ground: { $in: groundIds } }).populate(
                "ground"
            );

            // 3. Users: Admin's own profile + Customers who booked their grounds
            const customerIds = bookings
                .map((b) => b.user)
                .filter((id) => id !== undefined && id !== null);
            const uniqueCustomerIds = [...new Set(customerIds.map(String))];

            users = await User.find({
                $or: [{ _id: decoded.id }, { _id: { $in: uniqueCustomerIds } }],
            }).select("-passwordHash");
        }

        return NextResponse.json({
            users,
            grounds: groundsList,
            bookings,
        });
    } catch (err: unknown) {
        console.error("Fetch All Data Error:", err);
        return NextResponse.json(
            { error: "Failed to fetch all data" },
            { status: 500 }
        );
    }
}
