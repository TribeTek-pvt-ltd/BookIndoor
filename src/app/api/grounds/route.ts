import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Ground from "@/models/Grounds";
import User from "@/models/User";
import { verifyToken } from "@/lib/auth";

interface SportInput {
  name: string;
  pricePerHour: number;
}

interface GroundBody {
  token: string;
  ownerId?: string;
  name: string;
  location: { address: string; lat?: number; lng?: number };
  contactNumber: string;
  groundType: string;
  sports: SportInput[];
  availableTime: { from: string; to: string };
  amenities?: string[];
  images?: string[];
  description?: string;
}

// ✅ CREATE Ground
export async function POST(req: Request) {
  try {
    await dbConnect();
    const body: GroundBody = await req.json();

    const decoded = verifyToken(body.token);
    if (!decoded || !["admin", "super_admin"].includes(decoded.role)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const owner = await User.findById(body.ownerId);
    if (!owner || owner.role !== "admin") {
      return NextResponse.json(
        { error: "Invalid ground owner" },
        { status: 400 }
      );
    }

    const ground = await Ground.create({
      name: body.name,
      location: body.location,
      contactNumber: body.contactNumber,
      groundType: body.groundType,
      owner: body.ownerId,
      sports: body.sports,
      availableTime: body.availableTime,
      amenities: body.amenities || [],
      images: body.images || [],
      description: body.description,
    });

    return NextResponse.json({ success: true, ground });
  } catch (err: any) {
    console.error("Ground Creation Error:", err);
    if (err.name === "ValidationError") {
      return NextResponse.json({ error: err.errors }, { status: 400 });
    }
    return NextResponse.json(
      { error: "Failed to create ground" },
      { status: 500 }
    );
  }
}

// ✅ GET all Grounds
export async function GET(req: Request) {
  try {
    await dbConnect();
    const url = new URL(req.url);
    const token = url.searchParams.get("token");

    const decoded = token ? verifyToken(token) : null;

    let grounds;
    if (decoded && ["admin", "super_admin"].includes(decoded.role)) {
      grounds = await Ground.find().populate("owner", "name email role");
    } else if (decoded && decoded.role === "admin") {
      grounds = await Ground.find({ owner: decoded.id }).populate(
        "owner",
        "name email"
      );
    } else {
      grounds = await Ground.find().select(
        "name location sports images availableTime"
      );
    }

    return NextResponse.json(grounds);
  } catch (err: any) {
    console.error("Ground Fetch Error:", err);
    return NextResponse.json(
      { error: "Failed to fetch grounds" },
      { status: 500 }
    );
  }
}
