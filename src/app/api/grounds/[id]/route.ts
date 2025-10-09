import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Ground from "@/models/Grounds";
import { verifyToken } from "@/lib/auth";

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    await dbConnect();
    const { id } = params;

    const url = new URL(req.url);
    const token = url.searchParams.get("token");
    const decoded = token ? verifyToken(token) : null;

    const ground = await Ground.findById(id).populate(
      "owner",
      "name email role"
    );
    if (!ground)
      return NextResponse.json({ error: "Ground not found" }, { status: 404 });

    if (
      decoded &&
      (["admin", "super_admin"].includes(decoded.role) ||
        decoded.id === String(ground.owner._id))
    ) {
      return NextResponse.json(ground);
    }

    const publicGround = {
      name: ground.name,
      location: ground.location,
      sports: ground.sports,
      images: ground.images,
      availableTime: ground.availableTime,
      amenities: ground.amenities,
    };
    return NextResponse.json(publicGround);
  } catch (err: any) {
    console.error("Get Ground by ID Error:", err);
    return NextResponse.json(
      { error: "Failed to fetch ground" },
      { status: 500 }
    );
  }
}

export async function PUT(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    await dbConnect();
    const { id } = params;
    const body = await req.json();
    const decoded = verifyToken(body.token);
    if (!decoded)
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });

    const ground = await Ground.findById(id);
    if (!ground)
      return NextResponse.json({ error: "Ground not found" }, { status: 404 });

    if (
      !["admin", "super_admin"].includes(decoded.role) &&
      decoded.id !== String(ground.owner)
    ) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    Object.assign(ground, body);
    await ground.save();

    return NextResponse.json({ success: true, ground });
  } catch (err: any) {
    console.error("Ground Update Error:", err);
    if (err.name === "ValidationError") {
      return NextResponse.json({ error: err.errors }, { status: 400 });
    }
    return NextResponse.json(
      { error: "Failed to update ground" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    await dbConnect();
    const { id } = params;
    const { token } = await req.json();

    const decoded = verifyToken(token);
    if (!decoded)
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });

    const ground = await Ground.findById(id);
    if (!ground)
      return NextResponse.json({ error: "Ground not found" }, { status: 404 });

    if (
      !["admin", "super_admin"].includes(decoded.role) &&
      decoded.id !== String(ground.owner)
    ) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    await ground.deleteOne();
    return NextResponse.json({ success: true, message: "Ground deleted" });
  } catch (err: any) {
    console.error("Ground Delete Error:", err);
    return NextResponse.json(
      { error: "Failed to delete ground" },
      { status: 500 }
    );
  }
}
