import { NextResponse } from "next/server";
import mongoose from "mongoose";
import dbConnect from "@/lib/mongodb";
import User from "@/models/User";
import Ground from "@/models/Grounds";
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

    const now = new Date();
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - now.getDay());
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfYear = new Date(now.getFullYear(), 0, 1);

    if (decoded.role === "super_admin") {
      const [totalGrounds, totalAdmins, statsAgg, periodStats] = await Promise.all([
        Ground.countDocuments().lean(),
        User.countDocuments({ role: "admin" }).lean(),
        Booking.aggregate([
          {
            $facet: {
              overall: [
                { $group: { _id: null, totalBookings: { $sum: 1 }, totalRevenue: { $sum: { $cond: [{ $eq: ["$paymentStatus", "full_paid"] }, "$totalAmount", 0] } } } }
              ],
              groundWise: [
                { $group: { _id: "$ground", totalBookings: { $sum: 1 }, totalRevenue: { $sum: { $cond: [{ $eq: ["$paymentStatus", "full_paid"] }, "$totalAmount", 0] } } } },
                { $lookup: { from: "grounds", localField: "_id", foreignField: "_id", as: "groundInfo" } },
                { $unwind: "$groundInfo" },
                { $project: { _id: 0, groundId: "$groundInfo._id", groundName: "$groundInfo.name", totalBookings: 1, totalRevenue: 1 } }
              ]
            }
          }
        ]),
        Booking.aggregate([
          {
            $facet: {
              weekly: [{ $match: { createdAt: { $gte: startOfWeek } } }, { $count: "count" }],
              monthly: [{ $match: { createdAt: { $gte: startOfMonth } } }, { $count: "count" }]
            }
          }
        ])
      ]);

      const overall = statsAgg?.[0]?.overall?.[0] || { totalBookings: 0, totalRevenue: 0 };
      
      return NextResponse.json({
        role: "super_admin",
        totalGrounds,
        totalAdmins,
        totalRevenue: overall.totalRevenue,
        totalBookings: overall.totalBookings,
        monthlyBookings: periodStats?.[0]?.monthly?.[0]?.count || 0,
        weeklyBookings: periodStats?.[0]?.weekly?.[0]?.count || 0,
        groundWiseStats: statsAgg?.[0]?.groundWise || []
      });
    }

    // Admin Mode
    const url = new URL(req.url);
    const groundFilter = url.searchParams.get("ground");
    const ownedGrounds = await Ground.find({ owner: decoded.id }).select("_id name").lean();
    const ownedIds = ownedGrounds.map(g => g._id);

    let matchQuery: any = { ground: { $in: ownedIds } };
    if (groundFilter) {
      if (!ownedIds.some(id => id.toString() === groundFilter)) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
      }
      matchQuery.ground = new mongoose.Types.ObjectId(groundFilter);
    }

    const [overallStats, groundBreakdown] = await Promise.all([
      Booking.aggregate([
        { $match: matchQuery },
        {
          $facet: {
            summary: [
              { $group: { 
                _id: null, 
                totalBookings: { $sum: 1 }, 
                totalRevenue: { $sum: { $cond: [{ $eq: ["$paymentStatus", "full_paid"] }, "$totalAmount", 0] } } 
              }}
            ],
            periods: [
              {
                $group: {
                  _id: null,
                  weekly: { $sum: { $cond: [{ $gte: ["$createdAt", startOfWeek] }, 1, 0] } },
                  weeklyIncome: { $sum: { $cond: [{ $and: [{ $gte: ["$createdAt", startOfWeek] }, { $eq: ["$paymentStatus", "full_paid"] }] }, "$totalAmount", 0] } },
                  monthly: { $sum: { $cond: [{ $gte: ["$createdAt", startOfMonth] }, 1, 0] } },
                  monthlyIncome: { $sum: { $cond: [{ $and: [{ $gte: ["$createdAt", startOfMonth] }, { $eq: ["$paymentStatus", "full_paid"] }] }, "$totalAmount", 0] } },
                  yearly: { $sum: { $cond: [{ $gte: ["$createdAt", startOfYear] }, 1, 0] } },
                  yearlyIncome: { $sum: { $cond: [{ $and: [{ $gte: ["$createdAt", startOfYear] }, { $eq: ["$paymentStatus", "full_paid"] }] }, "$totalAmount", 0] } }
                }
              }
            ],
            sports: [
              { $group: { _id: "$sportName", count: { $sum: 1 } } }
            ]
          }
        }
      ]),
      Booking.aggregate([
        { $match: matchQuery },
        { $group: { 
          _id: "$ground", 
          totalBookings: { $sum: 1 }, 
          totalRevenue: { $sum: { $cond: [{ $eq: ["$paymentStatus", "full_paid"] }, "$totalAmount", 0] } } 
        }},
        { $lookup: { from: "grounds", localField: "_id", foreignField: "_id", as: "info" } },
        { $unwind: "$info" },
        { $project: { _id: 0, groundId: "$_id", groundName: "$info.name", totalBookings: 1, totalRevenue: 1 } }
      ])
    ]);

    const summary = overallStats?.[0]?.summary?.[0] || { totalBookings: 0, totalRevenue: 0 };
    const periods = overallStats?.[0]?.periods?.[0] || { weekly: 0, weeklyIncome: 0, monthly: 0, monthlyIncome: 0, yearly: 0, yearlyIncome: 0 };
    const sportsMap: Record<string, number> = {};
    if (overallStats?.[0]?.sports) {
      overallStats[0].sports.forEach((s: any) => sportsMap[s._id] = s.count);
    }

    return NextResponse.json({
      role: "admin",
      totalGrounds: ownedGrounds.length,
      totalRevenue: summary.totalRevenue,
      totalBookings: summary.totalBookings,
      summary: {
        weekly: { income: periods.weeklyIncome, totalBookings: periods.weekly, sports: sportsMap },
        monthly: { income: periods.monthlyIncome, totalBookings: periods.monthly, sports: sportsMap },
        yearly: { income: periods.yearlyIncome, totalBookings: periods.yearly, sports: sportsMap }
      },
      groundWiseStats: groundBreakdown || []
    });

  } catch (err) {
    console.error("Stats Error:", err);
    return NextResponse.json({ error: "Failed to fetch stats" }, { status: 500 });
  }
}

