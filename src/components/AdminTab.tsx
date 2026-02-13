"use client";

import { useState, useEffect, Key, useCallback } from "react";
import AddAdminForm from "./AddAdminForm";
import Image from "next/image";

interface Admin {
  id?: Key | null;
  _id: string;
  name: string;
  email: string;
  phone?: string;
  nicNumber?: string;
  address?: string;
  bankName?: string;
  accountNumber?: string;
  branchName?: string;
  image?: string;
  managingGround?: string;
}

interface Ground {
  _id: string;
  name: string;
  images: string[];
  location: string | { address: string };
  sports: { name: string }[];
}

export default function AdminTab() {
  const [admins, setAdmins] = useState<Admin[]>([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingAdmin, setEditingAdmin] = useState<Admin | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedAdminId, setSelectedAdminId] = useState<string | null>(null);
  const [adminDetails, setAdminDetails] = useState<{ admin: Admin; grounds: Ground[] } | null>(null);
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [token, setToken] = useState("");

  // Safely fetch token from localStorage (client-side only)
  useEffect(() => {
    const storedToken = localStorage.getItem("token") || "";
    setToken(storedToken);
  }, []);

  // Fetch all admins from backend
  const fetchAdmins = useCallback(async () => {
    if (!token) return;
    try {
      setLoading(true);
      const res = await fetch(`/api/auth?token=${token}`);
      const data = await res.json();

      if (res.ok) {
        setAdmins(data.admins || []);
      } else {
        console.error("Error fetching admins:", data.error);
      }
    } catch (err) {
      console.error("Fetch admins failed:", err);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchAdmins();
  }, [fetchAdmins]);

  // Fetch specific admin details
  useEffect(() => {
    const fetchDetails = async () => {
      if (!selectedAdminId || !token) return;
      try {
        setDetailsLoading(true);
        const res = await fetch(`/api/admins/${selectedAdminId}?token=${token}`);
        if (!res.ok) throw new Error("Failed to fetch details");
        const data = await res.json();
        setAdminDetails(data);
      } catch (err) {
        console.error("Error fetching admin details:", err);
      } finally {
        setDetailsLoading(false);
      }
    };
    fetchDetails();
  }, [selectedAdminId, token]);

  // Handle adding new admin
  const handleAddAdmin = async (newAdminData: Omit<Admin, "_id">) => {
    try {
      const res = await fetch("/api/auth/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...newAdminData, role: "admin", token }),
      });
      const data = await res.json();

      if (res.ok) {
        setAdmins((prev) => [...prev, data]);
        setShowAddForm(false);
        fetchAdmins();
      } else {
        alert(data.error || "Failed to add admin");
      }
    } catch (err) {
      console.error("Add admin error:", err);
      alert("Failed to add admin");
    }
  };

  // Handle updating existing admin
  const handleUpdateAdmin = async (updatedData: Partial<Admin>) => {
    if (!editingAdmin?._id) return;
    try {
      const res = await fetch(`/api/admins/${editingAdmin._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...updatedData, token }),
      });
      const data = await res.json();

      if (res.ok) {
        setAdmins((prev) => prev.map(a => a._id === editingAdmin._id ? { ...a, ...updatedData } : a));
        setEditingAdmin(null);
        setShowAddForm(false);
        fetchAdmins();
      } else {
        alert(data.error || "Failed to update admin");
      }
    } catch (err) {
      console.error("Update admin error:", err);
      alert("Failed to update admin");
    }
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
        <div>
          <h2 className="text-2xl font-black text-slate-800 tracking-tight">
            Administrator Network
          </h2>
          <p className="text-slate-500 text-sm font-medium mt-1">Monitor and manage access for facility operators</p>
        </div>
        <button
          onClick={() => setShowAddForm(true)}
          className="bg-slate-900 text-white px-6 py-3 rounded-2xl font-bold hover:bg-slate-800 transition-all shadow-lg shadow-slate-200 flex items-center gap-2 active:scale-95"
        >
          <span className="text-xl">+</span> Add Administrator
        </button>
      </div>

      {/* Admin List Card */}
      <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden min-h-[400px]">
        <div className="p-8 border-b border-slate-50 bg-slate-50/50 flex items-center justify-between">
          <h3 className="text-sm font-black uppercase tracking-widest text-slate-400">Registry</h3>
          <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full">{admins.length} Total Operators</span>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-24 space-y-4">
            <div className="w-10 h-10 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-slate-400 text-sm font-medium">Synchronizing records...</p>
          </div>
        ) : admins.length === 0 ? (
          <div className="text-center py-24 px-6">
            <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl">👤</div>
            <p className="text-slate-400 font-bold text-lg">Empty Registry</p>
            <p className="text-slate-500 text-sm mt-1">No administrators have been onboarded yet.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[600px]">
              <thead>
                <tr className="bg-white">
                  <th className="p-5 text-[11px] font-black uppercase tracking-[0.15em] text-slate-400">Identity</th>
                  <th className="p-5 text-[11px] font-black uppercase tracking-[0.15em] text-slate-400">Communication</th>
                  <th className="p-5 text-[11px] font-black uppercase tracking-[0.15em] text-slate-400">Accountability</th>
                  <th className="p-5 text-[11px] font-black uppercase tracking-[0.15em] text-slate-400">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {admins.map((admin) => (
                  <tr
                    key={admin._id}
                    className="group hover:bg-slate-50/50 transition-all cursor-pointer"
                    onClick={() => setSelectedAdminId(admin._id)}
                  >
                    <td className="p-5">
                      <div className="flex items-center gap-4">
                        <div className="relative w-12 h-12 rounded-2xl overflow-hidden shadow-sm border border-slate-100 flex-shrink-0">
                          <Image
                            src={admin.image || `https://ui-avatars.com/api/?name=${encodeURIComponent(admin.name)}&background=10b981&color=fff&bold=true`}
                            alt={admin.name}
                            fill
                            className="object-cover"
                          />
                        </div>
                        <div>
                          <p className="font-bold text-slate-900 group-hover:text-emerald-700 transition-colors">{admin.name}</p>
                          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tighter">ID: {admin._id.slice(-6).toUpperCase()}</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-5">
                      <div className="space-y-0.5">
                        <p className="text-sm font-medium text-slate-600">{admin.email}</p>
                        <p className="text-xs text-slate-400 font-bold tracking-tight">{admin.phone || "No contact line"}</p>
                      </div>
                    </td>
                    <td className="p-5">
                      <span className="inline-flex items-center px-3 py-1 bg-emerald-50 text-emerald-700 rounded-lg text-[10px] font-black uppercase tracking-widest border border-emerald-100">
                        Authorized
                      </span>
                    </td>
                    <td className="p-5">
                      <button className="w-10 h-10 flex items-center justify-center bg-slate-100 text-slate-400 hover:bg-emerald-600 hover:text-white rounded-xl transition-all">
                        →
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Admin Details Modal */}
      {selectedAdminId && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md flex items-center justify-center z-[100] p-4 animate-fadeIn">
          <div className="bg-white rounded-[3rem] shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto custom-scrollbar relative border border-slate-100 animate-slideUp">
            <button
              onClick={() => {
                setSelectedAdminId(null);
                setAdminDetails(null);
              }}
              className="absolute top-6 right-6 w-12 h-12 flex items-center justify-center bg-white/10 hover:bg-white/30 backdrop-blur-md text-white border border-white/20 rounded-[1.2rem] transition-all z-[110]"
            >
              ✕
            </button>

            {detailsLoading ? (
              <div className="p-20 flex flex-col items-center justify-center">
                <div className="w-12 h-12 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin"></div>
                <p className="mt-4 text-slate-500 font-bold">Retrieving Security Profile...</p>
              </div>
            ) : adminDetails ? (
              <div className="flex flex-col">
                {/* Modal Header/Profile Banner */}
                <div className="p-10 bg-gradient-to-br from-slate-900 via-slate-800 to-emerald-900 text-white relative flex flex-col items-center sm:flex-row sm:items-end gap-8 overflow-hidden">
                  {/* Decorative element */}
                  <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl"></div>

                  <div className="relative w-32 h-32 rounded-[2.5rem] overflow-hidden border-4 border-white/10 shadow-2xl flex-shrink-0 group">
                    <Image
                      src={adminDetails.admin.image || `https://ui-avatars.com/api/?name=${encodeURIComponent(adminDetails.admin.name)}&background=10b981&color=fff&bold=true`}
                      alt={adminDetails.admin.name}
                      fill
                      className="object-cover"
                    />
                  </div>

                  <div className="text-center sm:text-left space-y-2 pb-2">
                    <div className="flex items-center gap-3 justify-center sm:justify-start">
                      <h2 className="text-4xl font-black tracking-tight">{adminDetails.admin.name}</h2>
                      <span className="px-3 py-1 bg-emerald-500 text-white text-[10px] font-black uppercase tracking-widest rounded-full shadow-lg shadow-emerald-900/40">Verified</span>
                      <button
                        onClick={() => {
                          setEditingAdmin(adminDetails.admin);
                          setShowAddForm(true);
                        }}
                        className="ml-4 px-3 py-1 bg-white/10 hover:bg-white/20 border border-white/20 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all"
                      >
                        Edit Profile
                      </button>
                    </div>
                    <p className="text-emerald-400 font-bold tracking-widest uppercase text-xs">{adminDetails.admin.email}</p>
                    <div className="flex items-center gap-4 text-white/50 text-xs font-medium pt-2 justify-center sm:justify-start">
                      <p className="flex items-center gap-1.5"><span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span> {adminDetails.admin.phone || "No phone link"}</p>
                      <p className="flex items-center gap-1.5"><span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span> Member Since 2024</p>
                    </div>
                  </div>
                </div>

                <div className="p-10 grid grid-cols-1 lg:grid-cols-2 gap-10">
                  {/* Left Column: Personal & Financial */}
                  <div className="space-y-10">
                    <div>
                      <h4 className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-400 mb-6 flex items-center gap-3">
                        <span className="w-8 h-px bg-slate-100"></span> Identity Credentials
                      </h4>
                      <div className="bg-slate-50 p-8 rounded-[2rem] border border-slate-100 space-y-6">
                        <div className="grid grid-cols-2 gap-8">
                          <div>
                            <label className="text-[9px] font-black uppercase tracking-widest text-slate-400 block mb-1">NIC Identification</label>
                            <p className="font-bold text-slate-800">{adminDetails.admin.nicNumber || "Not recorded"}</p>
                          </div>
                          <div>
                            <label className="text-[9px] font-black uppercase tracking-widest text-slate-400 block mb-1">Security Role</label>
                            <p className="font-bold text-emerald-600">Administrative</p>
                          </div>
                        </div>
                        <div>
                          <label className="text-[9px] font-black uppercase tracking-widest text-slate-400 block mb-1">Operational Address</label>
                          <p className="font-bold text-slate-700 leading-relaxed text-sm">{adminDetails.admin.address || "No secondary location provided"}</p>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h4 className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-400 mb-6 flex items-center gap-3">
                        <span className="w-8 h-px bg-slate-100"></span> Financial Settlement
                      </h4>
                      <div className="bg-emerald-50/50 p-8 rounded-[2rem] border border-emerald-100/50 space-y-6">
                        <div className="flex items-center gap-4 mb-2">
                          <div className="w-10 h-10 bg-emerald-600 rounded-xl flex items-center justify-center text-white font-black text-xl">🏦</div>
                          <div>
                            <p className="text-xs font-black uppercase tracking-widest text-emerald-900">{adminDetails.admin.bankName || "Pending Setup"}</p>
                            <p className="text-[10px] font-bold text-emerald-600">{adminDetails.admin.branchName || "Global Settlement Branch"}</p>
                          </div>
                        </div>
                        <div className="p-4 bg-white/60 rounded-xl border border-emerald-100">
                          <label className="text-[9px] font-black uppercase tracking-widest text-emerald-400 block mb-1">AccountNumber</label>
                          <p className="font-black text-slate-800 tracking-tight text-lg">{adminDetails.admin.accountNumber || "**** **** ****"}</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Right Column: Managed Grounds */}
                  <div>
                    <h4 className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-400 mb-6 flex items-center gap-3">
                      <span className="w-8 h-px bg-slate-100"></span> Managed Facilities
                    </h4>
                    <div className="space-y-4">
                      {adminDetails.grounds && adminDetails.grounds.length > 0 ? (
                        adminDetails.grounds.map((ground: Ground) => (
                          <div key={ground._id} className="flex items-center gap-4 bg-white p-4 rounded-3xl border border-slate-100 shadow-sm hover:shadow-md transition-all group">
                            <div className="w-20 h-20 rounded-2xl overflow-hidden bg-slate-100 flex-shrink-0 relative">
                              <Image src={ground.images?.[0] || "/placeholder.png"} alt={ground.name} fill className="object-cover" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <h5 className="font-bold text-slate-900 truncate group-hover:text-emerald-700 transition-colors">{ground.name}</h5>
                              <p className="text-xs text-slate-500 truncate mt-1">{typeof ground.location === 'object' ? ground.location.address : ground.location}</p>
                              <div className="flex gap-1.5 mt-2">
                                {ground.sports?.slice(0, 2).map((s: { name: string }) => (
                                  <span key={s.name} className="px-2 py-0.5 bg-slate-50 text-slate-400 text-[9px] font-black uppercase rounded-md tracking-tighter">{s.name}</span>
                                ))}
                                {ground.sports?.length > 2 && <span className="text-[9px] font-bold text-slate-300">+{ground.sports.length - 2} more</span>}
                              </div>
                            </div>
                            <div className="pr-2">
                              <div className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center text-slate-300 group-hover:bg-emerald-50 group-hover:text-emerald-600 transition-all">→</div>
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="p-10 text-center border-2 border-dashed border-slate-100 rounded-[2rem]">
                          <p className="text-slate-400 font-bold text-sm">No grounds assigned yet.</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="p-20 text-center text-slate-500 font-bold">Failed to load admin profile.</div>
            )}
          </div>
        </div>
      )}

      {/* Add/Edit Admin Popup Modal */}
      {showAddForm && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-[110] p-4 animate-fadeIn">
          <div className="bg-white rounded-[3rem] shadow-2xl p-8 w-full max-w-2xl relative overflow-y-auto max-h-[90vh]">
            <button
              onClick={() => {
                setShowAddForm(false);
                setEditingAdmin(null);
              }}
              className="absolute top-6 right-6 w-10 h-10 flex items-center justify-center bg-slate-50 hover:bg-slate-100 text-slate-400 rounded-2xl transition-all"
            >
              ✕
            </button>
            <div className="mb-8">
              <h3 className="text-2xl font-black text-slate-800">
                {editingAdmin ? "Update Administrator" : "Onboard New Admin"}
              </h3>
              <p className="text-slate-500 text-sm mt-1">
                {editingAdmin ? "Update credentials and details for this operator" : "Assign credentials and identity for a new facility operator"}
              </p>
            </div>
            <AddAdminForm
              onAddAdmin={editingAdmin ? handleUpdateAdmin : handleAddAdmin}
              initialData={editingAdmin || undefined}
            />
          </div>
        </div>
      )}
    </div>
  );
}
