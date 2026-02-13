import { NextResponse } from "next/server";
import mongoose from "mongoose";
import dbConnect from "@/lib/mongodb";
import User from "@/models/User";
import Ground from "@/models/Grounds";
import Booking, { IBooking } from "@/models/Booking";
import { verifyToken } from "@/lib/auth";

interface DecodedToken {
  id: string;
  role: "super_admin" | "admin";
}

interface GroundStat {
  groundId: string;
  groundName: string;
  totalBookings: number;
  totalRevenue: number;
}

interface PeriodStats {
  income: number;
  totalBookings: number;
  sports: Record<string, number>;
}

interface GroundBreakdown {
  groundId: mongoose.Types.ObjectId;
  groundName: string;
  totalRevenue: number;
  totalBookings: number;
  summary: {
    weekly: PeriodStats;
    monthly: PeriodStats;
    yearly: PeriodStats;
  };
}

export async function GET(req: Request) {
  try {
    await dbConnect();

    const authHeader = req.headers.get("authorization");
    if (!authHeader) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const token = authHeader.split(" ")[1];
    const decoded = verifyToken(token) as DecodedToken | null;
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
    let groundWiseStats: GroundStat[] = [];

    if (userRole === "super_admin") {
      totalGrounds = await Ground.countDocuments();
      totalAdmins = await User.countDocuments({ role: "admin" });
      totalBookings = await Booking.countDocuments();

      // total revenue
      const revenueAgg = await Booking.aggregate<{ _id: null; total: number }>([
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
      groundWiseStats = await Booking.aggregate<GroundStat>([
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

    const url = new URL(req.url);
    const groundFilter = url.searchParams.get("ground");

    if (userRole === "admin") {
      const ownedGrounds = await Ground.find({ owner: userId }).select("_id name");
      const ownedGroundIds = ownedGrounds.map((g) => g._id.toString());
      totalGrounds = ownedGrounds.length;

      let query: mongoose.FilterQuery<IBooking> = { ground: { $in: ownedGroundIds } };
      if (groundFilter) {
        if (!ownedGroundIds.includes(groundFilter)) {
          return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        }
        query = { ground: groundFilter };
      }

      const getStatsForBookings = (bookings: IBooking[]) => {
        const getStatsForPeriod = (startDate: Date) => {
          const filtered = bookings.filter((b) => new Date(b.createdAt) >= startDate);
          const income = filtered
            .filter((b) => b.paymentStatus === "full_paid")
            .reduce((sum, b) => sum + b.totalAmount, 0);

          const sports: Record<string, number> = {};
          filtered.forEach(b => {
            sports[b.sportName] = (sports[b.sportName] || 0) + 1;
          });

          return { income, totalBookings: filtered.length, sports };
        };

        const startOfYear = new Date(now.getFullYear(), 0, 1);

        return {
          weekly: getStatsForPeriod(startOfWeek),
          monthly: getStatsForPeriod(startOfMonth),
          yearly: getStatsForPeriod(startOfYear),
        };
      };

      const adminBookings = await Booking.find(query);
      totalBookings = adminBookings.length;

      let perGroundBreakdown: GroundBreakdown[] = [];
      if (!groundFilter) {
        perGroundBreakdown = ownedGrounds.map(g => {
          const groundBookings = adminBookings.filter(b => b.ground.toString() === g._id.toString());
          return {
            groundId: g._id,
            groundName: g.name,
            totalRevenue: groundBookings
              .filter(b => b.paymentStatus === "full_paid")
              .reduce((sum, b) => sum + b.totalAmount, 0),
            totalBookings: groundBookings.length,
            summary: getStatsForBookings(groundBookings)
          };
        });
      }

      return NextResponse.json({
        role: userRole,
        totalGrounds,
        totalRevenue: adminBookings
          .filter(b => b.paymentStatus === "full_paid")
          .reduce((sum, b) => sum + b.totalAmount, 0),
        totalBookings,
        summary: getStatsForBookings(adminBookings),
        groundWiseStats: perGroundBreakdown
      });
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
  } catch (err: unknown) {
    console.error("Stats Error:", err);
    return NextResponse.json(
      { error: "Failed to fetch stats" },
      { status: 500 }
    );
  }
}
