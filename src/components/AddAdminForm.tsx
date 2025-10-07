"use client";

import { useState, ChangeEvent, FormEvent } from "react";

interface AdminFormData {
  name: string;
  phone_no: string;
  email: string;
  password: string;
  address: string;
  nic_no: string;
  bank_name: string;
  account_no: string;
  branch: string;
  managingGround: string;
  image?: File | null;
}

interface AddAdminFormProps {
  onAddAdmin?: (data: AdminFormData) => void;
}

export default function AddAdminForm({ onAddAdmin }: AddAdminFormProps) {
  const [formData, setFormData] = useState<AdminFormData>({
    name: "",
    phone_no: "",
    email: "",
    password: "",
    address: "",
    nic_no: "",
    bank_name: "",
    account_no: "",
    branch: "",
    managingGround: "",
    image: null,
  });

  const [preview, setPreview] = useState<string | null>(null);

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setFormData((prev) => ({ ...prev, image: file }));
      setPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (onAddAdmin) onAddAdmin(formData);
    alert("✅ Admin added successfully (frontend only)");

    setFormData({
      name: "",
      phone_no: "",
      email: "",
      password: "",
      address: "",
      nic_no: "",
      bank_name: "",
      account_no: "",
      branch: "",
      managingGround: "",
      image: null,
    });
    setPreview(null);
  };

  return (
    <div className="bg-white w-full max-w-3xl p-8 rounded-2xl shadow-lg mx-auto border border-gray-100">
      <h2 className="text-2xl font-semibold mb-6 text-center text-gray-800">
        Add New Admin
      </h2>

      <form
        onSubmit={handleSubmit}
        className="grid grid-cols-1 md:grid-cols-2 gap-5"
      >
        {/* Full Name */}
        <input
          type="text"
          name="name"
          placeholder="Full Name"
          value={formData.name}
          onChange={handleChange}
          required
          className="p-3 border rounded-lg focus:ring-2 focus:ring-indigo-400 outline-none"
        />

        {/* Phone Number */}
        <input
          type="text"
          name="phone_no"
          placeholder="Phone Number"
          value={formData.phone_no}
          onChange={handleChange}
          required
          className="p-3 border rounded-lg focus:ring-2 focus:ring-indigo-400 outline-none"
        />

        {/* Email */}
        <input
          type="email"
          name="email"
          placeholder="Email"
          value={formData.email}
          onChange={handleChange}
          required
          className="p-3 border rounded-lg focus:ring-2 focus:ring-indigo-400 outline-none"
        />

        {/* Password */}
        <input
          type="password"
          name="password"
          placeholder="Password"
          value={formData.password}
          onChange={handleChange}
          required
          className="p-3 border rounded-lg focus:ring-2 focus:ring-indigo-400 outline-none"
        />

        {/* Address */}
        <input
          type="text"
          name="address"
          placeholder="Address"
          value={formData.address}
          onChange={handleChange}
          className="p-3 border rounded-lg focus:ring-2 focus:ring-indigo-400 outline-none"
        />

        {/* NIC Number */}
        <input
          type="text"
          name="nic_no"
          placeholder="NIC Number"
          value={formData.nic_no}
          onChange={handleChange}
          className="p-3 border rounded-lg focus:ring-2 focus:ring-indigo-400 outline-none"
        />

        {/* Bank Name */}
        <input
          type="text"
          name="bank_name"
          placeholder="Bank Name"
          value={formData.bank_name}
          onChange={handleChange}
          required
          className="p-3 border rounded-lg focus:ring-2 focus:ring-indigo-400 outline-none"
        />

        {/* Account Number */}
        <input
          type="text"
          name="account_no"
          placeholder="Account Number"
          value={formData.account_no}
          onChange={handleChange}
          required
          className="p-3 border rounded-lg focus:ring-2 focus:ring-indigo-400 outline-none"
        />

        {/* Branch */}
        <input
          type="text"
          name="branch"
          placeholder="Branch Name"
          value={formData.branch}
          onChange={handleChange}
          required
          className="p-3 border rounded-lg focus:ring-2 focus:ring-indigo-400 outline-none"
        />

        {/* Managing Ground */}
        <input
          type="text"
          name="managingGround"
          placeholder="Managing Ground"
          value={formData.managingGround}
          onChange={handleChange}
          className="p-3 border rounded-lg focus:ring-2 focus:ring-indigo-400 outline-none"
        />

        {/* Image Upload */}
        <div className="flex flex-col items-center justify-center border-2 border-dashed border-gray-300 rounded-lg p-4 hover:border-indigo-400 transition">
          <input
            type="file"
            accept="image/*"
            onChange={handleImageChange}
            className="hidden"
            id="imageUpload"
          />
          <label
            htmlFor="imageUpload"
            className="cursor-pointer text-sm text-indigo-600 font-medium"
          >
            Upload Profile Image
          </label>
          {preview && (
            <img
              src={preview}
              alt="Preview"
              className="w-24 h-24 mt-3 rounded-full object-cover shadow-md"
            />
          )}
        </div>

        {/* Submit Button */}
        <div className="md:col-span-2">
          <button
            type="submit"
            className="w-full py-3 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700 transition"
          >
            Add Admin
          </button>
    
    </div>
      </form>
    </div>
  );
}