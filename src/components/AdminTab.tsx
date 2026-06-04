"use client";

import { useState, useEffect, useCallback } from "react";
import { api } from "@/lib/api-client";
import AdminList from "./admin/AdminList";
import AdminDetailsModal from "./admin/AdminDetailsModal";
import AdminFormModal from "./admin/AdminFormModal";

export default function AdminTab() {
  const [admins, setAdmins] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedAdminId, setSelectedAdminId] = useState<string | null>(null);
  const [adminDetails, setAdminDetails] = useState<any>(null);
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingAdmin, setEditingAdmin] = useState<any | null>(null);

  const fetchAdmins = useCallback(async () => {
    try {
      setLoading(true);
      const data: any = await api.get("/api/auth");
      setAdmins(data.admins || []);
    } catch (err) {
      console.error("Fetch admins failed:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAdmins();
  }, [fetchAdmins]);

  useEffect(() => {
    const fetchDetails = async () => {
      if (!selectedAdminId) return;
      try {
        setDetailsLoading(true);
        const data = await api.get(`/api/admins/${selectedAdminId}`);
        setAdminDetails(data);
      } catch (err) {
        console.error("Error fetching admin details:", err);
      } finally {
        setDetailsLoading(false);
      }
    };
    fetchDetails();
  }, [selectedAdminId]);

  const handleFormSubmit = async (data: any) => {
    try {
      if (editingAdmin) {
        await api.put(`/api/admins/${editingAdmin._id}`, data);
      } else {
        await api.post("/api/auth", { ...data, role: "admin" });
      }
      setShowForm(false);
      setEditingAdmin(null);
      fetchAdmins();
    } catch (err: any) {
      alert(err.message || "Operation failed");
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
          onClick={() => setShowForm(true)}
          className="bg-slate-900 text-white px-6 py-3 rounded-2xl font-bold hover:bg-slate-800 transition-all shadow-lg shadow-slate-200 flex items-center gap-2 active:scale-95"
        >
          <span className="text-xl">+</span> Add Administrator
        </button>
      </div>

      {/* Admin List Card */}
      <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden min-h-[400px]">
        <div className="p-8 border-b border-slate-50 bg-slate-50/50 flex items-center justify-between">
          <h3 className="text-sm font-black uppercase tracking-widest text-slate-400">Registry</h3>
          <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full">
            {admins.length} Total Operators
          </span>
        </div>

        <AdminList 
          admins={admins} 
          loading={loading} 
          onSelect={setSelectedAdminId} 
        />
      </div>

      {/* Admin Details Modal */}
      {selectedAdminId && (
        <AdminDetailsModal
          adminDetails={adminDetails}
          loading={detailsLoading}
          onClose={() => {
            setSelectedAdminId(null);
            setAdminDetails(null);
          }}
          onEdit={(admin) => {
            setEditingAdmin(admin);
            setShowForm(true);
          }}
        />
      )}

      {/* Add/Edit Form Modal */}
      {showForm && (
        <AdminFormModal
          editingAdmin={editingAdmin}
          onClose={() => {
            setShowForm(false);
            setEditingAdmin(null);
          }}
          onSubmit={handleFormSubmit}
        />
      )}
    </div>
  );
}

