"use client";

import { useState, useEffect, ChangeEvent, FormEvent } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api-client";
import { GroundSchema } from "@/lib/schemas";

interface Sport {
  name: string;
  pricePerHour: number;
}

interface StoredGround {
  _id: string;
  name: string;
  location: { address: string; lat?: number; lng?: number };
  contactNumber: string;
  groundType: string;
  availableTime: { from: string; to: string };
  amenities: string[];
  sports: Sport[];
  images: string[];
  description?: string;
}

const defaultSports = ["Football", "Cricket", "Badminton", "Tennis", "Basketball", "Volleyball"];
const defaultFacilities = ["Parking", "Restrooms", "Changing Rooms", "Cafeteria", "Lighting", "Seating Area", "First Aid"];
const courtTypes = ["Indoor", "Outdoor", "Hybrid"];

interface AddGroundFormProps {
  ground?: StoredGround;
  isEditing?: boolean;
  onClose?: () => void;
}

export default function AddGroundForm({ ground, isEditing = false, onClose }: AddGroundFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [previewImages, setPreviewImages] = useState<string[]>([]);
  const [images, setImages] = useState<File[]>([]);

  const [formData, setFormData] = useState({
    name: "",
    location: { address: "", lat: undefined as number | undefined, lng: undefined as number | undefined },
    contactNumber: "",
    groundType: "Indoor",
    availableTime: { from: "06:00", to: "22:00" },
    amenities: [] as string[],
    sports: [{ name: "", pricePerHour: 0 }] as Sport[],
    description: "",
  });

  useEffect(() => {
    if (isEditing && ground) {
      setFormData({
        name: ground.name,
        location: {
          address: ground.location.address,
          lat: ground.location.lat,
          lng: ground.location.lng,
        },
        contactNumber: ground.contactNumber,
        groundType: ground.groundType,
        availableTime: ground.availableTime,
        amenities: ground.amenities || [],
        sports: ground.sports || [{ name: "", pricePerHour: 0 }],
        description: ground.description || "",
      });
      setPreviewImages(ground.images || []);
    }
  }, [isEditing, ground]);

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    if (name.includes(".")) {
      const [parent, child] = name.split(".");
      setFormData(prev => ({
        ...prev,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        [parent]: { ...(prev as any)[parent], [child]: value }
      }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSportChange = (index: number, field: keyof Sport, value: string | number) => {
    const updated = [...formData.sports];
    updated[index] = { ...updated[index], [field]: field === "pricePerHour" ? Number(value) : value };
    setFormData(prev => ({ ...prev, sports: updated }));
  };

  const handleFacilityChange = (facility: string) => {
    setFormData(prev => ({
      ...prev,
      amenities: prev.amenities.includes(facility)
        ? prev.amenities.filter(f => f !== facility)
        : [...prev.amenities, facility],
    }));
  };

  const handleImageChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    const files = Array.from(e.target.files);
    setImages(prev => [...prev, ...files]);
    setPreviewImages(prev => [...prev, ...files.map(f => URL.createObjectURL(f))]);
  };

  const removeImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index));
    setPreviewImages(prev => prev.filter((_, i) => i !== index));
  };

  const useMyLocation = () => {
    if (!navigator.geolocation) return alert("Geolocation not supported!");
    navigator.geolocation.getCurrentPosition(
      (pos) => setFormData(prev => ({
        ...prev,
        location: { ...prev.location, lat: pos.coords.latitude, lng: pos.coords.longitude }
      })),
      () => alert("Unable to fetch location!")
    );
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Client-side validation
      const validation = GroundSchema.safeParse(formData);
      if (!validation.success) {
        throw new Error("Please check all fields: " + validation.error.issues[0]?.message);
      }

      const body = new FormData();
      body.append("name", formData.name);
      body.append("location[address]", formData.location.address);
      if (formData.location.lat) body.append("location[lat]", String(formData.location.lat));
      if (formData.location.lng) body.append("location[lng]", String(formData.location.lng));
      body.append("contactNumber", formData.contactNumber);
      body.append("groundType", formData.groundType);
      body.append("availableTime[from]", formData.availableTime.from);
      body.append("availableTime[to]", formData.availableTime.to);
      body.append("amenities", JSON.stringify(formData.amenities));
      body.append("sports", JSON.stringify(formData.sports));
      body.append("description", formData.description);
      images.forEach(file => body.append("images", file));

      const endpoint = isEditing ? `/api/grounds/${ground?._id}` : "/api/grounds";
      if (isEditing) {
        await api.put(endpoint, body);
      } else {
        await api.post(endpoint, body);
      }

      alert("✅ Ground saved successfully!");
      if (onClose) {
        onClose();
      } else {
        router.push("/admin");
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "An error occurred";
      alert("❌ " + message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto mt-6 bg-white p-6 rounded-xl">
      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 px-1">Arena Identity</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Ground Name"
              className="w-full pl-4 pr-4 py-4 bg-slate-50 border-none rounded-2xl text-slate-900 placeholder:text-slate-300 focus:ring-4 focus:ring-emerald-500/10 transition-all font-medium"
              required
            />
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 px-1">Precise Location</label>
            <input
              type="text"
              name="location.address"
              value={formData.location.address}
              onChange={handleChange}
              placeholder="Full Address"
              className="w-full pl-4 pr-4 py-4 bg-slate-50 border-none rounded-2xl text-slate-900 placeholder:text-slate-300 focus:ring-4 focus:ring-emerald-500/10 transition-all font-medium"
              required
            />
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 px-1">Geo Coordinates</label>
          <div className="flex flex-col sm:flex-row gap-3">
            <input
              type="number"
              name="location.lat"
              value={formData.location.lat || ""}
              onChange={handleChange}
              placeholder="Latitude"
              className="flex-1 pl-4 pr-4 py-4 bg-slate-50 border-none rounded-2xl text-slate-900 placeholder:text-slate-300 focus:ring-4 focus:ring-emerald-500/10 transition-all font-medium"
            />
            <input
              type="number"
              name="location.lng"
              value={formData.location.lng || ""}
              onChange={handleChange}
              placeholder="Longitude"
              className="flex-1 pl-4 pr-4 py-4 bg-slate-50 border-none rounded-2xl text-slate-900 placeholder:text-slate-300 focus:ring-4 focus:ring-emerald-500/10 transition-all font-medium"
            />
            <button
              type="button"
              onClick={useMyLocation}
              className="px-6 py-4 bg-slate-900 text-white font-bold rounded-2xl hover:bg-slate-800 transition-all shadow-lg active:scale-95 text-xs whitespace-nowrap"
            >
              📍 Use GPS
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-bold text-slate-700">Opening Hours</label>
            <div className="flex items-center gap-2">
              <input
                type="time"
                name="availableTime.from"
                value={formData.availableTime.from}
                onChange={handleChange}
                className="flex-1 pl-4 pr-4 py-4 bg-slate-50 border-none rounded-2xl text-slate-900 focus:ring-4 focus:ring-emerald-500/10 transition-all font-medium"
                required
              />
              <span className="text-slate-400 font-bold text-xs uppercase">to</span>
              <input
                type="time"
                name="availableTime.to"
                value={formData.availableTime.to}
                onChange={handleChange}
                className="flex-1 pl-4 pr-4 py-4 bg-slate-50 border-none rounded-2xl text-slate-900 focus:ring-4 focus:ring-emerald-500/10 transition-all font-medium"
                required
              />
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-bold text-slate-700">Contact Number</label>
            <input
              type="tel"
              name="contactNumber"
              value={formData.contactNumber}
              onChange={handleChange}
              placeholder="e.g., +94 77 123 4567"
              className="w-full pl-4 pr-4 py-4 bg-slate-50 border-none rounded-2xl text-slate-900 placeholder:text-slate-300 focus:ring-4 focus:ring-emerald-500/10 transition-all font-medium"
              required
            />
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-bold text-slate-700">Court Type</label>
          <div className="flex gap-4">
            {courtTypes.map((type) => (
              <label key={type} className="flex items-center gap-2 cursor-pointer group">
                <input
                  type="radio"
                  name="groundType"
                  value={type}
                  checked={formData.groundType === type}
                  onChange={handleChange}
                  className="w-4 h-4 text-emerald-600 focus:ring-emerald-500"
                  required
                />
                <span className="text-slate-600 group-hover:text-slate-900 transition-colors">{type}</span>
              </label>
            ))}
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <label className="text-sm font-bold text-slate-700">Available Sports & Pricing</label>
            <button
              type="button"
              onClick={() => setFormData(prev => ({ ...prev, sports: [...prev.sports, { name: "", pricePerHour: 0 }] }))}
              className="text-xs font-bold text-emerald-600 hover:text-emerald-700 flex items-center gap-1"
            >
              + Add Another Sport
            </button>
          </div>
          <div className="space-y-3">
            {formData.sports.map((s, idx) => (
              <div key={idx} className="flex gap-3 items-end bg-slate-50 p-3 rounded-lg border border-slate-100">
                <div className="flex-1 space-y-1">
                  <select
                    value={s.name}
                    onChange={(e) => handleSportChange(idx, "name", e.target.value)}
                    className="w-full pl-4 pr-8 py-4 bg-white border-none rounded-xl text-slate-900 focus:ring-4 focus:ring-emerald-500/10 transition-all font-medium text-sm appearance-none"
                    required
                  >
                    <option value="">Select Sport</option>
                    {defaultSports.map(ds => <option key={ds} value={ds}>{ds}</option>)}
                  </select>
                </div>
                <div className="w-32 space-y-1">
                  <input
                    type="number"
                    value={s.pricePerHour || ""}
                    onChange={(e) => handleSportChange(idx, "pricePerHour", e.target.value)}
                    placeholder="LKR/hr"
                    className="w-full pl-4 pr-4 py-4 bg-white border-none rounded-xl text-slate-900 focus:ring-4 focus:ring-emerald-500/10 transition-all font-black text-sm"
                    required
                  />
                </div>
                {formData.sports.length > 1 && (
                  <button
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, sports: prev.sports.filter((_, i) => i !== idx) }))}
                    className="p-3 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    ✕
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-bold text-slate-700">Facilities & Amenities</label>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {defaultFacilities.map((f) => (
              <label key={f} className="flex items-center gap-2 cursor-pointer p-2 rounded-lg hover:bg-slate-50 transition-colors">
                <input
                  type="checkbox"
                  checked={formData.amenities.includes(f)}
                  onChange={() => handleFacilityChange(f)}
                  className="rounded text-emerald-600 focus:ring-emerald-500"
                />
                <span className="text-xs text-slate-600">{f}</span>
              </label>
            ))}
          </div>
        </div>

        <div className="space-y-3">
          <label className="text-sm font-bold text-slate-700">Gallery Images</label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {previewImages.map((src, idx) => (
              <div key={idx} className="relative aspect-square rounded-lg overflow-hidden group">
                <img src={src} alt="Preview" className="w-full h-full object-cover" />
                <button
                  type="button"
                  onClick={() => removeImage(idx)}
                  className="absolute top-1 right-1 bg-black/60 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  ✕
                </button>
              </div>
            ))}
            <label className="aspect-square rounded-lg border-2 border-dashed border-slate-200 flex flex-col items-center justify-center gap-2 cursor-pointer hover:border-emerald-500 hover:bg-emerald-50 transition-all">
              <span className="text-2xl text-slate-400">+</span>
              <span className="text-[10px] font-bold text-slate-500">Upload</span>
              <input type="file" multiple accept="image/*" onChange={handleImageChange} className="hidden" />
            </label>
          </div>
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full py-5 bg-emerald-600 text-white rounded-[2rem] font-black text-lg hover:bg-emerald-700 transition-all shadow-2xl shadow-emerald-100 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed mt-8 uppercase tracking-widest"
        >
          {isSubmitting ? "Processing..." : isEditing ? "Save Arena Details" : "Publish This Arena"}
        </button>
      </form>
    </div>
  );
}
