import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import { verifyToken } from "@/lib/auth";
import User from "@/models/User";
import Ground from "@/models/Grounds"; // only if you want their grounds too

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    await dbConnect();
    const { id } = params;

    // ✅ Get token from query
    const url = new URL(req.url);
    const token = url.searchParams.get("token");

    if (!token) {
      return NextResponse.json({ error: "Token required" }, { status: 401 });
    }

    const decoded = verifyToken(token);

    if (!decoded || decoded.role !== "super_admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // ✅ Fetch the admin user by ID
    const admin = await User.findById(id).select("-passwordHash"); // hide password

    if (!admin) {
      return NextResponse.json({ error: "Admin not found" }, { status: 404 });
    }

    if (admin.role !== "admin") {
      return NextResponse.json(
        { error: "This user is not an admin" },
        { status: 400 }
      );
    }

    // ✅ Optionally fetch all grounds owned by this admin
    const grounds = await Ground.find({ owner: id }).select(
      "name location sports images"
    );

    return NextResponse.json({
      admin,
      grounds,
    });
  } catch (err) {
    console.error("Get Admin Data Error:", err);
    return NextResponse.json(
      { error: "Failed to fetch admin data" },
      { status: 500 }
    );
  }
}
