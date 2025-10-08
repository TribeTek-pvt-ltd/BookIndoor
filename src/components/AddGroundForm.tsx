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
  facilities: string[];
  phone_no: string;
  court_type: string;
  sports: Sport[];
  images: File[];
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

const courtTypes = ["Indoor", "Outdoor", "Hybrid"];

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
    facilities: [],
    phone_no: "",
    court_type: "",
    sports: [{ sport: "", price: 0 }],
    images: [],
  });

  const [previewImages, setPreviewImages] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Load existing ground in edit mode
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
          facilities: ground.facilities ? ground.facilities.split(", ") : [],
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

  // Input handler
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

  const addSport = () => {
    const selectedSports = formData.sports.map((s) => s.sport).filter(Boolean);
    if (selectedSports.length === defaultSports.length) {
      alert("All available sports have already been added!");
      return;
    }
    setFormData((prev) => ({
      ...prev,
      sports: [...prev.sports, { sport: "", price: 0 }],
    }));
  };

  const removeSport = (index: number) =>
    setFormData((prev) => ({
      ...prev,
      sports: prev.sports.filter((_, i) => i !== index),
    }));

  const availableSports = (currentSport: string) =>
    defaultSports.filter(
      (sport) =>
        !formData.sports.some(
          (s) => s.sport === sport && s.sport !== currentSport
        )
    );

  const handleFacilityChange = (facility: string) => {
    setFormData((prev) => {
      const facilities = prev.facilities.includes(facility)
        ? prev.facilities.filter((f) => f !== facility)
        : [...prev.facilities, facility];
      return { ...prev, facilities };
    });
  };

  // Image upload
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

  // Use browser location
  const useMyLocation = () => {
    if (!navigator.geolocation) return alert("Geolocation is not supported!");
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setFormData((prev) => ({
          ...prev,
          latitude: String(position.coords.latitude),
          longitude: String(position.coords.longitude),
        }));
      },
      () => alert("Unable to fetch location!")
    );
  };

  // Submit form
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    const token = localStorage.getItem("token");
    const selectedOwnerId = localStorage.getItem("id");
    if (!token) return alert("You are not logged in!");

    const payload = {
      token, // or remove if using Authorization header
      ownerId: selectedOwnerId, // only if admin creating ground
      name: formData.ground_name,
      location: {
        address: formData.location,
        lat: Number(formData.latitude),
        lng: Number(formData.longitude),
      },
      contactNumber: formData.phone_no,
      groundType: formData.court_type,
      sports: formData.sports.map((s) => ({
        name: s.sport,
        pricePerHour: s.price,
      })),
      availableTime: { from: formData.open_from, to: formData.open_to },
      amenities: formData.facilities,
      images: previewImages,
      description: "",
    };

    try {
      const res = await fetch("/api/grounds/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to create ground");

      alert("✅ Ground saved successfully!");
      router.push("/admin");
    } catch (err: any) {
      alert("❌ " + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = () => {
    if (!id) return;
    const confirmDelete = confirm(
      "Are you sure you want to delete this ground?"
    );
    if (!confirmDelete) return;

    const stored = JSON.parse(localStorage.getItem("grounds") || "[]");
    const updated = stored.filter((g: any) => String(g.id) !== id);
    localStorage.setItem("grounds", JSON.stringify(updated));
    alert("🗑️ Ground deleted successfully!");
    router.push("/admin");
  };

  return (
    <div className="max-w-2xl mx-auto mt-6 bg-white p-6 rounded-xl shadow-md">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-green-900">
          {mode === "edit" ? "Edit Ground" : "Add New Ground"}
        </h1>
        {mode === "edit" && (
          <button
            onClick={handleDelete}
            type="button"
            className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition">
            Delete
          </button>
        )}
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Ground Name & Location */}
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

        {/* Latitude & Longitude */}
        <div>
          <label className="font-semibold text-green-900">Coordinates</label>
          <div className="flex flex-col sm:flex-row gap-3 mt-2">
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
            <button
              type="button"
              onClick={useMyLocation}
              className="bg-green-700 text-white px-3 py-2 rounded-lg hover:bg-green-800 transition mt-2 sm:mt-0">
              Use My Location
            </button>
          </div>
        </div>

        {/* Open Time */}
        <div>
          <label className="font-semibold text-green-900">Open Time</label>
          <div className="flex flex-col sm:flex-row gap-3 mt-2">
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
          {formData.open_from && formData.open_to && (
            <p className="text-green-800 mt-2 text-sm">
              Open Time:{" "}
              <span className="font-semibold">
                {new Date(
                  `2000-01-01T${formData.open_from}`
                ).toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })}{" "}
                –{" "}
                {new Date(`2000-01-01T${formData.open_to}`).toLocaleTimeString(
                  [],
                  { hour: "2-digit", minute: "2-digit" }
                )}
              </span>
            </p>
          )}
        </div>

        {/* Court Type */}
        <div>
          <label className="font-semibold text-green-900">Court Type</label>
          <select
            name="court_type"
            value={formData.court_type}
            onChange={handleChange}
            className="input mt-2"
            required>
            <option value="">Select Court Type</option>
            {courtTypes.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>
        </div>

        {/* Sports */}
        <div className="space-y-3">
          <h3 className="font-semibold text-green-900 text-lg">
            Sports & Prices
          </h3>
          {formData.sports.map((sport, index) => (
            <div
              key={index}
              className="flex flex-col sm:flex-row gap-3 items-center">
              <select
                value={sport.sport}
                onChange={(e) =>
                  handleSportChange(index, "sport", e.target.value)
                }
                className="input flex-1">
                <option value="">Select Sport</option>
                {availableSports(sport.sport).map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
              <input
                type="number"
                placeholder="Price"
                value={sport.price}
                onChange={(e) =>
                  handleSportChange(index, "price", e.target.value)
                }
                className="input flex-1"
              />
              <button
                type="button"
                onClick={() => removeSport(index)}
                className="text-red-600 font-bold text-lg">
                ✕
              </button>
            </div>
          ))}
          <button
            type="button"
            onClick={addSport}
            className="text-green-700 font-semibold hover:underline">
            + Add Sport
          </button>
        </div>

        {/* Facilities */}
        <div>
          <h3 className="font-semibold text-green-900 text-lg mb-2">
            Facilities
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {defaultFacilities.map((facility) => (
              <label
                key={facility}
                className="flex items-center gap-2 px-3 py-2 hover:bg-green-100 transition">
                <input
                  type="checkbox"
                  checked={formData.facilities.includes(facility)}
                  onChange={() => handleFacilityChange(facility)}
                  className="accent-green-700"
                />
                <span className="text-green-900 text-sm">{facility}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Phone */}
        <input
          type="text"
          name="phone_no"
          value={formData.phone_no}
          onChange={handleChange}
          placeholder="Phone Number"
          className="input"
        />

        {/* Images */}
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
                  className="absolute top-0 right-0 bg-red-600 text-white text-xs px-2 py-1 rounded-bl-lg">
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
          className={`w-full py-3 font-semibold rounded-lg text-white transition ${
            isSubmitting ? "bg-gray-400" : "bg-green-700 hover:bg-green-800"
          }`}>
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
