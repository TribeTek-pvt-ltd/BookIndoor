import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Ground, { IGround } from "@/models/Grounds";
import { verifyToken } from "@/lib/auth";

type Params = { params: { id: string } };

// Define a safe error interface
interface AppError extends Error {
  name: string;
  errors?: Record<string, unknown>;
}

/** ✅ GET GROUND BY ID **/
export async function GET(
  req: NextRequest,
  context: Params | { params: Promise<{ id: string }> }
) {
  try {
    await dbConnect();

    const { id } =
      context.params instanceof Promise ? await context.params : context.params;

    const url = new URL(req.url);
    const token = url.searchParams.get("token");
    const decoded = token ? verifyToken(token) : null;

    let ground: IGround | null = null;

    if (decoded) {
      if (["admin", "super_admin"].includes(decoded.role)) {
        ground = await Ground.findById(id).populate("owner", "name email role");
      } else {
        ground = await Ground.findById(id);
      }
    } else {
      ground = await Ground.findById(id);
    }

    if (!ground) {
      return NextResponse.json({ error: "Ground not found" }, { status: 404 });
    }

    if (
      decoded &&
      (["admin", "super_admin"].includes(decoded.role) ||
        decoded.id === String(ground.owner?._id))
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
  } catch (err) {
    console.error("Get Ground by ID Error:", err);
    return NextResponse.json(
      { error: "Failed to fetch ground" },
      { status: 500 }
    );
  }
}

/** ✅ UPDATE GROUND **/
export async function PUT(
  req: NextRequest,
  context: Params | { params: Promise<{ id: string }> }
) {
  try {
    await dbConnect();

    const { id } =
      context.params instanceof Promise ? await context.params : context.params;

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
  } catch (err) {
    const error = err as AppError;
    console.error("Ground Update Error:", error);
    if (error.name === "ValidationError") {
      return NextResponse.json({ error: error.errors }, { status: 400 });
    }
    return NextResponse.json(
      { error: "Failed to update ground" },
      { status: 500 }
    );
  }
}

/** ✅ DELETE GROUND **/
export async function DELETE(
  req: NextRequest,
  context: Params | { params: Promise<{ id: string }> }
) {
  try {
    await dbConnect();

    const { id } =
      context.params instanceof Promise ? await context.params : context.params;

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
  } catch (err) {
    console.error("Ground Delete Error:", err);
    return NextResponse.json(
      { error: "Failed to delete ground" },
      { status: 500 }
    );
  }
}
