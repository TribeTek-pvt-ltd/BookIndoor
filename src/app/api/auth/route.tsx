import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import User from "@/models/User";
import bcrypt from "bcryptjs";
import { createToken, verifyToken } from "@/lib/auth";
import { UserSchema } from "@/lib/schemas";

export async function POST(req: Request) {
  try {
    await dbConnect();
    const body = await req.json();

    // 1. Validate input
    const validation = UserSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { error: "Validation Failed", details: validation.error.format() },
        { status: 400 }
      );
    }

    const { email, password, role } = validation.data;

    // 2. Check if email already exists
    const existingUser = await User.findOne({ email }).lean();
    if (existingUser) {
      return NextResponse.json(
        { error: "A user with this email already exists" },
        { status: 400 }
      );
    }

    // 3. Super Admin logic
    const existingSuper = await User.findOne({ role: "super_admin" }).lean();

    if (!existingSuper && role === "super_admin") {
      if (!password) {
        return NextResponse.json({ error: "Password is required" }, { status: 400 });
      }
      const passwordHash = await bcrypt.hash(password, 10);
      const user = await User.create({ ...validation.data, passwordHash });
      const jwtToken = createToken({ id: String(user._id), role: user.role });
      
      const { passwordHash: _, ...userWithoutPassword } = user.toObject();
      return NextResponse.json({ token: jwtToken, user: userWithoutPassword });
    }

    // 4. Admin addition logic (Super Admin only)
    if (role === "admin") {
      const authHeader = req.headers.get("Authorization");
      const token = authHeader?.split(" ")[1];
      const decoded = token ? verifyToken(token) : null;

      if (!decoded || decoded.role !== "super_admin") {
        return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
      }

      if (!password) {
        return NextResponse.json({ error: "Password is required" }, { status: 400 });
      }
      const passwordHash = await bcrypt.hash(password, 10);
      const user = await User.create({ ...validation.data, passwordHash });
      
      const { passwordHash: _, ...userWithoutPassword } = user.toObject();
      return NextResponse.json(userWithoutPassword);
    }

    return NextResponse.json(
      { error: "Invalid registration flow" },
      { status: 400 }
    );
  } catch (err: unknown) {
    console.error("Registration Error:", err);
    const errorMessage = err instanceof Error ? err.message : "Server error";
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}

export async function GET(req: Request) {
  try {
    await dbConnect();

    const authHeader = req.headers.get("Authorization");
    const token = authHeader?.split(" ")[1];

    if (!token) {
      return NextResponse.json({ error: "Token required" }, { status: 403 });
    }

    const decoded = verifyToken(token);
    if (!decoded || decoded.role !== "super_admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    // Fetch all admins with optimization
    const admins = await User.find({ role: "admin" })
      .select("-passwordHash")
      .lean();

    return NextResponse.json({ admins });
  } catch (err: unknown) {
    console.error("Fetch Admins Error:", err);
    return NextResponse.json(
      { error: "Failed to fetch admins" },
      { status: 500 }
    );
  }
}

