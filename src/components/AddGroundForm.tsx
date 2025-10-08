"use client";

import { useState, useEffect, ChangeEvent, FormEvent } from "react";
import { useSearchParams, useRouter } from "next/navigation";

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
  facilities: string;
  phone_no: string;
  court_type: string;
  sports: Sport[];
  images: File[];
}

export default function AddGroundForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const mode = searchParams.get("mode");
  const id = searchParams.get("id");

  const [formData, setFormData] = useState<GroundFormData>({
    ground_name: "",
    location: "",
    latitude: "",
    longitude: "",
    open_from: "",
    open_to: "",
    facilities: "",
    phone_no: "",
    court_type: "",
    sports: [{ sport: "", price: 0 }],
    images: [],
  });

  const [previewImages, setPreviewImages] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Load existing ground (edit mode)
  useEffect(() => {
    if (mode === "edit" && id) {
      const stored = JSON.parse(localStorage.getItem("grounds") || "[]");
      const ground = stored.find((g: any) => String(g.id) === id);
      if (ground) {
        setFormData({
          ground_name: ground.name,
          location: ground.location,
          latitude: ground.latitude || "",
          longitude: ground.longitude || "",
          open_from: ground.open_from || "",
          open_to: ground.open_to || "",
          facilities: ground.facilities,
          phone_no: ground.phone_no,
          court_type: ground.court_type,
          sports: ground.sports.map((sport: string, i: number) => ({
            sport,
            price: ground.priceList[i] || 0,
          })),
          images: [],
        });
        setPreviewImages(ground.images || [ground.image]);
      }
    }
  }, [mode, id]);

  // Input changes
  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSportChange = (index: number, field: keyof Sport, value: string) => {
    const updated = [...formData.sports];
    updated[index] = { ...updated[index], [field]: field === "price" ? Number(value) : value };
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

  // Image uploads
  const handleImageChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    const files = Array.from(e.target.files);
    const urls = files.map((f) => URL.createObjectURL(f));
    setFormData((prev) => ({ ...prev, images: [...prev.images, ...files] }));
    setPreviewImages((prev) => [...prev, ...urls]);
  };

  const removeImage = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index),
    }));
    setPreviewImages((prev) => prev.filter((_, i) => i !== index));
  };

  // Submit form
  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    const newGround = {
      id: mode === "edit" && id ? Number(id) : Date.now(),
      name: formData.ground_name,
      location: formData.location,
      latitude: formData.latitude,
      longitude: formData.longitude,
      open_from: formData.open_from,
      open_to: formData.open_to,
      image: previewImages[0] || "/default-ground.jpg",
      sports: formData.sports.map((s) => s.sport),
      priceList: formData.sports.map((s) => s.price),
      phone_no: formData.phone_no,
      court_type: formData.court_type,
      facilities: formData.facilities,
      images: previewImages,
    };

    const stored = JSON.parse(localStorage.getItem("grounds") || "[]");
    if (mode === "edit" && id) {
      const updated = stored.map((g: any) => (String(g.id) === id ? newGround : g));
      localStorage.setItem("grounds", JSON.stringify(updated));
      alert("✅ Ground updated successfully!");
    } else {
      stored.push(newGround);
      localStorage.setItem("grounds", JSON.stringify(stored));
      alert("✅ Ground added successfully!");
    }

    setIsSubmitting(false);
    router.push("/admin");
  };

  const handleDelete = () => {
    if (!id) return;
    const confirmDelete = confirm("Are you sure you want to delete this ground?");
    if (!confirmDelete) return;

    const stored = JSON.parse(localStorage.getItem("grounds") || "[]");
    const updated = stored.filter((g: any) => String(g.id) !== id);
    localStorage.setItem("grounds", JSON.stringify(updated));
    alert("🗑️ Ground deleted successfully!");
    router.push("/admin");
  };

  return (
    <div className="max-w-xl mx-auto mt-4 p-6 bg-green-100/20 backdrop-blur-md border border-green-700/30 rounded-2xl shadow-lg">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-green-900">
          {mode === "edit" ? "Edit Ground" : "Add Ground"}
        </h1>

        {mode === "edit" && (
          <button
            onClick={handleDelete}
            type="button"
            className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition"
          >
            Delete
          </button>
        )}
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Basic Details */}
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

        {/* Lat/Long */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <input
            type="text"
            name="latitude"
            value={formData.latitude}
            onChange={handleChange}
            placeholder="Latitude"
            className="input"
          />
          <input
            type="text"
            name="longitude"
            value={formData.longitude}
            onChange={handleChange}
            placeholder="Longitude"
            className="input"
          />
        </div>

        {/* Open Time Range */}
        <div>
          <label className="font-semibold text-green-900">Open Time</label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-2">
            <input
              type="time"
              name="open_from"
              value={formData.open_from}
              onChange={handleChange}
              className="input"
            />
            <input
              type="time"
              name="open_to"
              value={formData.open_to}
              onChange={handleChange}
              className="input"
            />
          </div>
        </div>

        <textarea
          name="facilities"
          value={formData.facilities}
          onChange={handleChange}
          placeholder="Facilities (comma separated)"
          className="input"
        />
        <input
          type="text"
          name="phone_no"
          value={formData.phone_no}
          onChange={handleChange}
          placeholder="Phone Number"
          className="input"
        />
        <input
          type="text"
          name="court_type"
          value={formData.court_type}
          onChange={handleChange}
          placeholder="Court Type"
          className="input"
        />

        {/* Sports Section */}
        <div className="space-y-3">
          <h3 className="font-semibold text-green-900 text-lg">Sports & Prices</h3>
          {formData.sports.map((sport, index) => (
            <div key={index} className="flex flex-col sm:flex-row gap-3 items-center">
              <input
                type="text"
                placeholder="Sport"
                value={sport.sport}
                onChange={(e) => handleSportChange(index, "sport", e.target.value)}
                className="input flex-1"
              />
              <input
                type="number"
                placeholder="Price"
                value={sport.price}
                onChange={(e) => handleSportChange(index, "price", e.target.value)}
                className="input flex-1"
              />
              <button
                type="button"
                onClick={() => removeSport(index)}
                className="text-red-600 font-bold text-lg"
              >
                ✕
              </button>
            </div>
          ))}
          <button
            type="button"
            onClick={addSport}
            className="text-green-700 font-semibold hover:underline"
          >
            + Add Sport
          </button>
        </div>

        {/* Image Upload */}
        <div>
          <label className="font-semibold text-green-900">Upload Images</label>
          <input
            type="file"
            accept="image/*"
            multiple
            onChange={handleImageChange}
            className="block mt-2"
          />
          <div className="flex flex-wrap gap-3 mt-3">
            {previewImages.map((src, index) => (
              <div key={index} className="relative">
                <img
                  src={src}
                  className="w-24 h-24 object-cover rounded-lg border border-green-400"
                />
                <button
                  type="button"
                  onClick={() => removeImage(index)}
                  className="absolute top-0 right-0 bg-red-600 text-white text-xs px-2 py-1 rounded-bl-lg"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={isSubmitting}
          className={`w-full py-3 font-semibold rounded-lg text-white transition 
            ${isSubmitting ? "bg-gray-400" : "bg-green-700 hover:bg-green-800"}`}
        >
          {isSubmitting
            ? mode === "edit"
              ? "Updating..."
              : "Adding..."
            : mode === "edit"
            ? "Update Ground"
            : "Add Ground"}
        </button>
      </form>
    </div>
  );
}
