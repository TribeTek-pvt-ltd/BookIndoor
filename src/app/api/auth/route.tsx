import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import User from "@/models/User";
import bcrypt from "bcryptjs";
import { createToken, verifyToken } from "@/lib/auth";

interface RegisterBody {
  name: string;
  email: string;
  password: string;
  role: "super_admin" | "admin";
  phone?: string;
  address?: string;
  nicNumber?: string;
  bankName?: string;
  accountNumber?: string;
  branchName?: string;
  managingGrounds?: string[];
  token?: string; // super admin token when adding admin
}

export async function POST(req: Request) {
  try {
    await dbConnect();
    const body: RegisterBody = await req.json();

    const { name, email, password, role, token } = body;

    // Check if Super Admin exists
    const existingSuper = await User.findOne({ role: "super_admin" });

    // {
    //   "name": "Super Admin",
    //   "email": "superadmin@example.com",
    //   "password": "SuperSecure123!",
    //   "role": "super_admin"
    // }

    // Create Super Admin (only if none exists)
    if (!existingSuper && role === "super_admin") {
      const passwordHash = await bcrypt.hash(password, 10);
      const user = await User.create({ ...body, passwordHash });
      const jwtToken = createToken({ id: String(user._id), role: user.role });
      return NextResponse.json({ token: jwtToken, user });
    }

    // Only Super Admin can add Admins
    if (role === "admin") {
      const decoded = token ? verifyToken(token) : null;
      if (!decoded || decoded.role !== "super_admin") {
        return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
      }

      const passwordHash = await bcrypt.hash(password, 10);
      const user = await User.create({ ...body, passwordHash });
      return NextResponse.json(user);
    }

    return NextResponse.json(
      { error: "Invalid registration flow" },
      { status: 400 }
    );
  } catch (err: any) {
    console.error("Registration Error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
export async function GET(req: Request) {
  try {
    await dbConnect();

    const url = new URL(req.url);
    const token = url.searchParams.get("token");

    if (!token) {
      return NextResponse.json({ error: "Token required" }, { status: 403 });
    }

    const decoded = verifyToken(token);
    if (!decoded || decoded.role !== "super_admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    // Fetch all admins
    const admins = await User.find({ role: "admin" }).select("-passwordHash"); // Exclude password hash

    return NextResponse.json({ admins });
  } catch (err: any) {
    console.error("Fetch Admins Error:", err);
    return NextResponse.json(
      { error: "Failed to fetch admins" },
      { status: 500 }
    );
  }
}
