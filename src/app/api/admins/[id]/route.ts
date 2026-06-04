import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import { verifyToken } from "@/lib/auth";
import User from "@/models/User";
import Ground from "@/models/Grounds";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await dbConnect();

    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const decoded = verifyToken(authHeader.split(" ")[1]);
    if (!decoded || decoded.role !== "super_admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const [admin, grounds] = await Promise.all([
      User.findById(id).select("-passwordHash").lean(),
      Ground.find({ owner: id }).select("name location sports images").lean()
    ]);

    if (!admin) return NextResponse.json({ error: "Admin not found" }, { status: 404 });
    if (admin.role !== "admin") return NextResponse.json({ error: "This user is not an admin" }, { status: 400 });

    return NextResponse.json({ admin, grounds });
  } catch (err) {
    console.error("Get Admin Data Error:", err);
    return NextResponse.json({ error: "Failed to fetch admin data" }, { status: 500 });
  }
}

