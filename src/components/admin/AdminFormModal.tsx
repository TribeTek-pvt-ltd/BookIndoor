"use client";

import AddAdminForm from "../AddAdminForm";
import { UserInput } from "@/lib/schemas";

interface Admin extends UserInput {
  _id: string;
}

interface AdminFormModalProps {
  editingAdmin: Admin | null;
  onClose: () => void;
  onSubmit: (data: any) => void;
}

export default function AdminFormModal({ editingAdmin, onClose, onSubmit }: AdminFormModalProps) {
  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-[110] p-4 animate-fadeIn">
      <div className="bg-white rounded-[3rem] shadow-2xl p-8 w-full max-w-2xl relative overflow-y-auto max-h-[90vh]">
        <button
          onClick={onClose}
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
          onAddAdmin={onSubmit}
          initialData={editingAdmin || undefined}
        />
      </div>
    </div>
  );
}
