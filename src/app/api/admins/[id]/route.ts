import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import { verifyToken } from "@/lib/auth";
import User from "@/models/User";
import Ground from "@/models/Grounds";

type Params = {
  params: { id: string };
};

export async function GET(
  req: NextRequest,
  context: Params | { params: Promise<{ id: string }> } // 👈 accept both
) {
  try {
    // ✅ Fix TypeScript issue by normalizing params
    const paramsData =
      context.params instanceof Promise ? await context.params : context.params;

    const { id } = paramsData;

    await dbConnect();

    const token = new URL(req.url).searchParams.get("token");
    if (!token) {
      return NextResponse.json({ error: "Token required" }, { status: 401 });
    }

    const decoded = verifyToken(token);
    if (!decoded || decoded.role !== "super_admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const admin = await User.findById(id).select("-passwordHash");
    if (!admin) {
      return NextResponse.json({ error: "Admin not found" }, { status: 404 });
    }

    if (admin.role !== "admin") {
      return NextResponse.json(
        { error: "This user is not an admin" },
        { status: 400 }
      );
    }

    const grounds = await Ground.find({ owner: id }).select(
      "name location sports images"
    );

    return NextResponse.json({ admin, grounds });
  } catch (err) {
    console.error("Get Admin Data Error:", err);
    return NextResponse.json(
      { error: "Failed to fetch admin data" },
      { status: 500 }
    );
  }
}
