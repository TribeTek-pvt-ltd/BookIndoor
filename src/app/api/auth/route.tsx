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
  token?: string;
}

export async function POST(req: Request) {
  try {
    await dbConnect();
    const { name, email, password, role, token }: RegisterBody =
      await req.json();

    // ✅ Check if Super Admin already exists
    const existingSuper = await User.findOne({ role: "super_admin" });

    // --- Create Super Admin (only if none exists)
    if (!existingSuper && role === "super_admin") {
      const passwordHash = await bcrypt.hash(password, 10);
      const user = await User.create({ name, email, passwordHash, role });
      const jwtToken = createToken({ id: String(user._id), role: user.role });
      return NextResponse.json({ token: jwtToken, user });
    }

    // --- Only Super Admin can add Admins
    if (role === "admin") {
      const decoded = token ? verifyToken(token) : null;
      if (!decoded || decoded.role !== "super_admin") {
        return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
      }

      const passwordHash = await bcrypt.hash(password, 10);
      const user = await User.create({ name, email, passwordHash, role });
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
