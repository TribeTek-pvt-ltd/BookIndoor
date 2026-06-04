"use client";

import Image from "next/image";
import { UserInput } from "@/lib/schemas";

interface Admin extends UserInput {
  _id: string;
  image?: string;
}

interface AdminListProps {
  admins: Admin[];
  loading: boolean;
  onSelect: (id: string) => void;
}

export default function AdminList({ admins, loading, onSelect }: AdminListProps) {
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-24 space-y-4">
        <div className="w-10 h-10 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-slate-400 text-sm font-medium">Synchronizing records...</p>
      </div>
    );
  }

  if (admins.length === 0) {
    return (
      <div className="text-center py-24 px-6">
        <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl">👤</div>
        <p className="text-slate-400 font-bold text-lg">Empty Registry</p>
        <p className="text-slate-500 text-sm mt-1">No administrators have been onboarded yet.</p>
      </div>
    );
  }

  return (
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
              onClick={() => onSelect(admin._id)}
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
  );
}
