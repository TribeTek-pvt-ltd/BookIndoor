import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Ground from "@/models/Grounds";
import { verifyToken } from "@/lib/auth";
import cloudinary from "@/lib/cloudinary";
import { GroundSchema } from "@/lib/schemas";

// ✅ CREATE Ground
export async function POST(req: Request) {
  try {
    await dbConnect();

    // 1. Auth check from headers
    const authHeader = req.headers.get("Authorization");
    const token = authHeader?.split(" ")[1];
    const decoded = token ? verifyToken(token) : null;

    if (!decoded || !["admin", "super_admin"].includes(decoded.role)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const formData = await req.formData();
    
    // 2. Extract and Parse Data
    const rawSports = formData.get("sports");
    const rawAmenities = formData.get("amenities");
    const rawLocation = {
      address: formData.get("location[address]"),
      lat: formData.get("location[lat]"),
      lng: formData.get("location[lng]"),
    };
    const rawAvailableTime = {
      from: formData.get("availableTime[from]"),
      to: formData.get("availableTime[to]"),
    };

    const payload = {
      name: formData.get("name"),
      contactNumber: formData.get("contactNumber"),
      groundType: formData.get("groundType"),
      owner: (formData.get("ownerId") as string) || decoded.id,
      sports: rawSports ? JSON.parse(rawSports as string) : [],
      amenities: rawAmenities ? JSON.parse(rawAmenities as string) : [],
      location: {
        address: rawLocation.address,
        lat: rawLocation.lat ? Number(rawLocation.lat) : undefined,
        lng: rawLocation.lng ? Number(rawLocation.lng) : undefined,
      },
      availableTime: rawAvailableTime,
      description: formData.get("description"),
    };

    // 3. Validate with Zod
    const validation = GroundSchema.safeParse(payload);
    if (!validation.success) {
      return NextResponse.json(
        { error: "Validation Failed", details: validation.error.format() },
        { status: 400 }
      );
    }

    // 4. Upload images in parallel
    const files = formData.getAll("images") as File[];
    const uploadPromises = files
      .filter(file => file instanceof File)
      .map(async (file) => {
        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);
        const dataURI = `data:${file.type};base64,${buffer.toString("base64")}`;
        const res = await cloudinary.uploader.upload(dataURI, { folder: "grounds" });
        return res.secure_url;
      });

    const images = await Promise.all(uploadPromises);

    // 5. Create Database Entry
    const ground = await Ground.create({
      ...validation.data,
      images,
    });

    return NextResponse.json({ success: true, ground }, { status: 201 });
  } catch (err: unknown) {
    console.error("Ground Creation Error:", err);
    const errorMessage = err instanceof Error ? err.message : "Failed to create ground";
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}

// ✅ GET all Grounds
export async function GET(req: Request) {
  try {
    await dbConnect();

    const authHeader = req.headers.get("Authorization");
    const token = authHeader?.split(" ")[1];
    const decoded = token ? verifyToken(token) : null;



    if (decoded?.role === "super_admin") {
      // Super admin sees everything
      const grounds = await Ground.find()
        .populate("owner", "name email role")
        .lean();
      return NextResponse.json(grounds);
    } 
    
    if (decoded?.role === "admin") {
      // Admin sees their own grounds
      const grounds = await Ground.find({ owner: decoded.id })
        .populate("owner", "name email")
        .lean();
      return NextResponse.json(grounds);
    }

    // Public view: limited fields for better performance
    const grounds = await Ground.find({}, {
      name: 1,
      location: 1,
      sports: 1,
      images: 1,
      availableTime: 1,
      groundType: 1,
      amenities: 1
    }).lean();

    return NextResponse.json(grounds);
  } catch (err: unknown) {
    console.error("Ground Fetch Error:", err);
    return NextResponse.json(
      { error: "Failed to fetch grounds" },
      { status: 500 }
    );
  }
}

