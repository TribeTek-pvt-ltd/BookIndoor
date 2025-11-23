"use client";

import { useState, useEffect, ChangeEvent, FormEvent } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Image from "next/image";

interface Sport {
  sport: string;
  price: number;
}

interface GroundFormData {
  ground_name: string;
  location: string;
  latitude: string;
  longitude: string;
  open_from: string;
  open_to: string;
  facilities: string[];
  phone_no: string;
  court_type: string;
  sports: Sport[];
  images: File[];
}

interface StoredGround {
  id: string | number;
  name: string;
  location: string;
  latitude?: string;
  longitude?: string;
  open_from?: string;
  open_to?: string;
  facilities?: string;
  phone_no: string;
  court_type: string;
  sports: string[];
  priceList: number[];
  images?: string[];
  image?: string;
}

const defaultSports = [
  "Football",
  "Cricket",
  "Badminton",
  "Tennis",
  "Basketball",
  "Volleyball",
];

const defaultFacilities = [
  "Parking",
  "Restrooms",
  "Changing Rooms",
  "Cafeteria",
  "Lighting",
  "Seating Area",
  "First Aid",
];
interface AddGroundFormProps {
  ground?: StoredGround; // optional for add mode
  isEditing?: boolean;
  onClose?: () => void; // optional callback for modal
}
const courtTypes = ["Indoor", "Outdoor", "Hybrid"];

export default function AddGroundForm({
  ground,
  isEditing = false,
  onClose,
}: AddGroundFormProps) {
  const router = useRouter();

  const [formData, setFormData] = useState<GroundFormData>({
    ground_name: "",
    location: "",
    latitude: "",
    longitude: "",
    open_from: "",
    open_to: "",
    facilities: [],
    phone_no: "",
    court_type: "",
    sports: [{ sport: "", price: 0 }],
    images: [],
  });

  const [previewImages, setPreviewImages] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // ✅ Load ground data if editing
  useEffect(() => {
    if (isEditing && ground) {
      setFormData({
        ground_name: ground.name,
        location: ground.location,
        latitude: ground.latitude || "",
        longitude: ground.longitude || "",
        open_from: ground.open_from || "",
        open_to: ground.open_to || "",
        facilities: ground.facilities ? ground.facilities.split(", ") : [],
        phone_no: ground.phone_no,
        court_type: ground.court_type,
        sports: ground.sports.map((s, i) => ({
          sport: s,
          price: ground.priceList?.[i] || 0,
        })),
        images: [], // keep empty; we handle previews separately
      });
      setPreviewImages(ground.images || [ground.image || ""]);
    }
  }, [isEditing, ground]);

  // ✅ Handle changes
  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSportChange = (
    index: number,
    field: keyof Sport,
    value: string
  ) => {
    const updated = [...formData.sports];
    updated[index] = {
      ...updated[index],
      [field]: field === "price" ? Number(value) : value,
    };
    setFormData((prev) => ({ ...prev, sports: updated }));
  };

  const addSport = () =>
    setFormData((prev) => ({
      ...prev,
      sports: [...prev.sports, { sport: "", price: 0 }],
    }));
  const removeSport = (index: number) =>
    setFormData((prev) => ({
      ...prev,
      sports: prev.sports.filter((_, i) => i !== index),
    }));

  const handleFacilityChange = (facility: string) => {
    setFormData((prev) => ({
      ...prev,
      facilities: prev.facilities.includes(facility)
        ? prev.facilities.filter((f) => f !== facility)
        : [...prev.facilities, facility],
    }));
  };

  // ✅ Handle images
  const handleImageChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    const files = Array.from(e.target.files);
    setFormData((prev) => ({ ...prev, images: [...prev.images, ...files] }));
    setPreviewImages((prev) => [
      ...prev,
      ...files.map((f) => URL.createObjectURL(f)),
    ]);
  };

  const removeImage = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index),
    }));
    setPreviewImages((prev) => prev.filter((_, i) => i !== index));
  };

  // ✅ Use browser location
  const useMyLocation = () => {
    if (!navigator.geolocation) return alert("Geolocation not supported!");
    navigator.geolocation.getCurrentPosition(
      (pos) =>
        setFormData((prev) => ({
          ...prev,
          latitude: String(pos.coords.latitude),
          longitude: String(pos.coords.longitude),
        })),
      () => alert("Unable to fetch location!")
    );
  };

  // ✅ Submit
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const token = localStorage.getItem("token");
      if (!token) return alert("You are not logged in!");

      const body = new FormData();
      body.append("token", token);
      body.append("name", formData.ground_name);
      body.append("location[address]", formData.location);
      body.append("location[lat]", formData.latitude);
      body.append("location[lng]", formData.longitude);
      body.append("contactNumber", formData.phone_no);
      body.append("groundType", formData.court_type);
      body.append("availableTime[from]", formData.open_from);
      body.append("availableTime[to]", formData.open_to);
      body.append("amenities", JSON.stringify(formData.facilities));
      body.append(
        "sports",
        JSON.stringify(
          formData.sports.map((s) => ({ name: s.sport, pricePerHour: s.price }))
        )
      );
      formData.images.forEach((file) => body.append("images", file));

      const res = await fetch(
        isEditing ? `/api/grounds/${ground?.id}` : "/api/grounds",
        {
          method: isEditing ? "PUT" : "POST",
          body,
        }
      );

      if (!res.ok) throw new Error("Failed to save ground");
      alert("✅ Ground saved successfully!");
      onClose ? onClose() : router.push("/admin");
    } catch (err: unknown) {
      if (err instanceof Error) {
        alert("❌ " + err.message);
      } else {
        alert("❌ An unexpected error occurred");
      }
    }
  };

  return (
    <div className="max-w-2xl mx-auto mt-6 bg-white p-6 rounded-xl">
      <form onSubmit={handleSubmit} className="space-y-5">
        <input
          type="text"
          name="ground_name"
          value={formData.ground_name}
          onChange={handleChange}
          placeholder="Ground Name"
          className="input"
          required
        />
        <input
          type="text"
          name="location"
          value={formData.location}
          onChange={handleChange}
          placeholder="Location"
          className="input"
          required
        />
        {/* Latitude/Longitude */}
        <div className="flex gap-3">
          <input
            type="text"
            name="latitude"
            value={formData.latitude}
            onChange={handleChange}
            placeholder="Latitude"
            className="input flex-1"
          />
          <input
            type="text"
            name="longitude"
            value={formData.longitude}
            onChange={handleChange}
            placeholder="Longitude"
            className="input flex-1"
          />
          <button type="button" onClick={useMyLocation} className="btn">
            Use My Location
          </button>
        </div>
        {/* Open Time, Court Type, Sports, Facilities, Phone, Images */}
        {/* ...keep your existing inputs here, just ensure they use formData state */}
        <button type="submit" className="btn w-full">
          {isSubmitting
            ? isEditing
              ? "Updating..."
              : "Adding..."
            : isEditing
            ? "Update Ground"
            : "Add Ground"}
        </button>
      </form>
    </div>
  );
}
