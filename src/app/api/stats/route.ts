import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import User from "@/models/User";
import Ground from "@/models/Grounds";
import Booking from "@/models/Booking";
import { verifyToken } from "@/lib/auth";

export async function GET(req: Request) {
  try {
    await dbConnect();

    const authHeader = req.headers.get("authorization");
    if (!authHeader) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const token = authHeader.split(" ")[1];
    const decoded: any = verifyToken(token);
    if (!decoded) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }

    const userRole = decoded.role;
    const userId = decoded.id;

    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - now.getDay());

    // ---------- 📊 COMMON STATS ----------
    let totalGrounds = 0;
    let totalAdmins = 0;
    let totalRevenue = 0;
    let totalBookings = 0;
    let monthlyBookings = 0;
    let weeklyBookings = 0;
    let groundWiseStats: any[] = [];

    if (userRole === "super_admin") {
      totalGrounds = await Ground.countDocuments();
      totalAdmins = await User.countDocuments({ role: "admin" });
      totalBookings = await Booking.countDocuments();

      // total revenue
      const revenueAgg = await Booking.aggregate([
        { $match: { paymentStatus: "fully_paid" } },
        { $group: { _id: null, total: { $sum: "$totalAmount" } } },
      ]);
      totalRevenue = revenueAgg[0]?.total || 0;

      // monthly bookings
      monthlyBookings = await Booking.countDocuments({
        date: { $gte: startOfMonth },
      });

      // weekly bookings
      weeklyBookings = await Booking.countDocuments({
        date: { $gte: startOfWeek },
      });

      // ground wise stats
      groundWiseStats = await Booking.aggregate([
        {
          $group: {
            _id: "$ground",
            totalBookings: { $sum: 1 },
            totalRevenue: {
              $sum: {
                $cond: [
                  { $eq: ["$paymentStatus", "fully_paid"] },
                  "$totalAmount",
                  0,
                ],
              },
            },
          },
        },
        {
          $lookup: {
            from: "grounds",
            localField: "_id",
            foreignField: "_id",
            as: "groundInfo",
          },
        },
        { $unwind: "$groundInfo" },
        {
          $project: {
            _id: 0,
            groundId: "$groundInfo._id",
            groundName: "$groundInfo.name",
            totalBookings: 1,
            totalRevenue: 1,
          },
        },
      ]);
    }

    if (userRole === "admin") {
      // get only grounds owned by this admin
      const ownedGrounds = await Ground.find({ owner: userId }).select("_id");

      const ownedGroundIds = ownedGrounds.map((g) => g._id);
      totalGrounds = ownedGrounds.length;

      totalBookings = await Booking.countDocuments({
        ground: { $in: ownedGroundIds },
      });

      const revenueAgg = await Booking.aggregate([
        {
          $match: {
            ground: { $in: ownedGroundIds },
            paymentStatus: "fully_paid",
          },
        },
        { $group: { _id: null, total: { $sum: "$totalAmount" } } },
      ]);
      totalRevenue = revenueAgg[0]?.total || 0;
    }

    return NextResponse.json({
      role: userRole,
      totalGrounds,
      totalAdmins,
      totalRevenue,
      totalBookings,
      monthlyBookings,
      weeklyBookings,
      groundWiseStats,
    });
  } catch (err) {
    console.error("Stats Error:", err);
    return NextResponse.json(
      { error: "Failed to fetch stats" },
      { status: 500 }
    );
  }
}
