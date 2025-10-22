import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import User from "@/models/User";
import bcrypt from "bcryptjs";
import { createToken } from "@/lib/auth";

interface LoginBody {
  email: string;
  password: string;
}

export async function POST(req: Request) {
  try {
    await dbConnect();
    const { email, password }: LoginBody = await req.json();

    const user = await User.findOne({ email });
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) {
      return NextResponse.json({ error: "Invalid password" }, { status: 401 });
    }

    const token = createToken({ id: String(user._id), role: user.role });
    return NextResponse.json({ token, user });
  } catch (err: unknown) {
    // ✅ Safe error handling with proper type narrowing
    const message =
      err instanceof Error ? err.message : "An unexpected error occurred";
    console.error("Login Error:", message);

    return NextResponse.json(
      { error: "Server error", details: message },
      { status: 500 }
    );
  }
}
