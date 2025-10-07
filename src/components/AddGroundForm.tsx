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
    facilities: "",
    phone_no: "",
    court_type: "",
    sports: [{ sport: "", price: 0 }],
    images: [],
  });

  const [previewImages, setPreviewImages] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Prefill data in edit mode
  useEffect(() => {
    if (mode === "edit" && id) {
      const stored = JSON.parse(localStorage.getItem("grounds") || "[]");
      const ground = stored.find((g: any) => String(g.id) === id);
      if (ground) {
        setFormData({
          ground_name: ground.name,
          location: ground.location,
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

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSportChange = (index: number, field: keyof Sport, value: string) => {
    const updated = [...formData.sports];
    const newValue = field === "price" ? Number(value) : value;
    updated[index] = { ...updated[index], [field]: newValue };
    setFormData((prev) => ({ ...prev, sports: updated }));
  };

  const addSport = () => {
    setFormData((prev) => ({
      ...prev,
      sports: [...prev.sports, { sport: "", price: 0 }],
    }));
  };

  const removeSport = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      sports: prev.sports.filter((_, i) => i !== index),
    }));
  };

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

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    const newGround = {
      id: mode === "edit" && id ? Number(id) : Date.now(),
      name: formData.ground_name,
      location: formData.location,
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
    <div className="max-w-3xl mx-auto bg-white p-6 md:p-8 rounded-2xl shadow-lg mt-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">
          {mode === "edit" ? "✏️ Edit Ground" : "🏟️ Add New Ground"}
        </h2>
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

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* BASIC DETAILS */}
        <input
          type="text"
          name="ground_name"
          value={formData.ground_name}
          onChange={handleChange}
          placeholder="Ground Name"
          className="w-full p-3 border rounded-lg"
          required
        />
        <input
          type="text"
          name="location"
          value={formData.location}
          onChange={handleChange}
          placeholder="Location"
          className="w-full p-3 border rounded-lg"
          required
        />
        <textarea
          name="facilities"
          value={formData.facilities}
          onChange={handleChange}
          placeholder="Facilities"
          className="w-full p-3 border rounded-lg"
        />

        <input
          type="text"
          name="phone_no"
          value={formData.phone_no}
          onChange={handleChange}
          placeholder="Phone Number"
          className="w-full p-3 border rounded-lg"
        />

        <input
          type="text"
          name="court_type"
          value={formData.court_type}
          onChange={handleChange}
          placeholder="Court Type"
          className="w-full p-3 border rounded-lg"
        />

        {/* SPORTS */}
        <div className="space-y-3">
          <h3 className="font-semibold text-gray-700">Sports & Prices</h3>
          {formData.sports.map((sport, index) => (
            <div key={index} className="flex gap-3 items-center">
              <input
                type="text"
                placeholder="Sport"
                value={sport.sport}
                onChange={(e) => handleSportChange(index, "sport", e.target.value)}
                className="w-1/2 p-2 border rounded-lg"
              />
              <input
                type="number"
                placeholder="Price"
                value={sport.price}
                onChange={(e) => handleSportChange(index, "price", e.target.value)}
                className="w-1/3 p-2 border rounded-lg"
              />
              <button
                type="button"
                onClick={() => removeSport(index)}
                className="text-red-600 font-bold"
              >
                ✕
              </button>
            </div>
          ))}
          <button
            type="button"
            onClick={addSport}
            className="text-blue-600 hover:underline font-semibold"
          >
            + Add Sport
          </button>
        </div>

        {/* IMAGE UPLOAD */}
        <div>
          <label className="font-semibold text-gray-700">Upload Images</label>
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
                  className="w-24 h-24 object-cover rounded-lg border"
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

        {/* SUBMIT */}
        <button
          type="submit"
          disabled={isSubmitting}
          className={`w-full py-3 font-semibold rounded-lg text-white transition 
            ${isSubmitting ? "bg-gray-400" : "bg-green-600 hover:bg-green-700"}`}
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
