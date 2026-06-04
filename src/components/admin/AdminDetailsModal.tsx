"use client";

import Image from "next/image";
import { UserInput } from "@/lib/schemas";

interface Admin extends UserInput {
  _id: string;
  image?: string;
}

interface Ground {
  _id: string;
  name: string;
  images: string[];
  location: string | { address: string };
  sports: { name: string }[];
}

interface AdminDetailsModalProps {
  adminDetails: { admin: Admin; grounds: Ground[] } | null;
  loading: boolean;
  onClose: () => void;
  onEdit: (admin: Admin) => void;
}

export default function AdminDetailsModal({ adminDetails, loading, onClose, onEdit }: AdminDetailsModalProps) {
  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md flex items-center justify-center z-[100] p-4 animate-fadeIn">
      <div className="bg-white rounded-[3rem] shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto custom-scrollbar relative border border-slate-100 animate-slideUp">
        <button
          onClick={onClose}
          className="absolute top-6 right-6 w-12 h-12 flex items-center justify-center bg-white/10 hover:bg-white/30 backdrop-blur-md text-white border border-white/20 rounded-[1.2rem] transition-all z-[110]"
        >
          ✕
        </button>

        {loading ? (
          <div className="p-20 flex flex-col items-center justify-center">
            <div className="w-12 h-12 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin"></div>
            <p className="mt-4 text-slate-500 font-bold">Retrieving Security Profile...</p>
          </div>
        ) : adminDetails ? (
          <div className="flex flex-col">
            {/* Modal Header/Profile Banner */}
            <div className="p-6 sm:p-10 bg-gradient-to-br from-slate-900 via-slate-800 to-emerald-900 text-white relative flex flex-col items-center sm:flex-row sm:items-end gap-8 overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl"></div>

              <div className="relative w-32 h-32 rounded-[2.5rem] overflow-hidden border-4 border-white/10 shadow-2xl flex-shrink-0">
                <Image
                  src={adminDetails.admin.image || `https://ui-avatars.com/api/?name=${encodeURIComponent(adminDetails.admin.name)}&background=10b981&color=fff&bold=true`}
                  alt={adminDetails.admin.name}
                  fill
                  className="object-cover"
                />
              </div>

              <div className="text-center sm:text-left space-y-2 pb-2">
                <div className="flex flex-col sm:flex-row items-center gap-3 justify-center sm:justify-start">
                  <h2 className="text-3xl sm:text-4xl font-black tracking-tight">{adminDetails.admin.name}</h2>
                  <div className="flex items-center gap-3">
                    <span className="px-3 py-1 bg-emerald-500 text-white text-[10px] font-black uppercase tracking-widest rounded-full shadow-lg shadow-emerald-900/40">Verified</span>
                    <button
                      onClick={() => onEdit(adminDetails.admin)}
                      className="px-3 py-1 bg-white/10 hover:bg-white/20 border border-white/20 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all"
                    >
                      Edit Profile
                    </button>
                  </div>
                </div>
                <p className="text-emerald-400 font-bold tracking-widest uppercase text-xs">{adminDetails.admin.email}</p>
                <div className="flex items-center gap-4 text-white/50 text-xs font-medium pt-2 justify-center sm:justify-start">
                  <p className="flex items-center gap-1.5"><span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span> {adminDetails.admin.phone || "No phone link"}</p>
                  <p className="flex items-center gap-1.5"><span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span> Member Since 2024</p>
                </div>
              </div>
            </div>

            <div className="p-6 sm:p-10 grid grid-cols-1 lg:grid-cols-2 gap-10">
              <div className="space-y-10">
                <div>
                  <h4 className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-400 mb-6 flex items-center gap-3">
                    <span className="w-8 h-px bg-slate-100"></span> Identity Credentials
                  </h4>
                  <div className="bg-slate-50 p-6 sm:p-8 rounded-[2rem] border border-slate-100 space-y-6">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 sm:gap-8">
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
                  <div className="bg-emerald-50/50 p-6 sm:p-8 rounded-[2rem] border border-emerald-100/50 space-y-6">
                    <div className="flex items-center gap-4 mb-2">
                      <div className="w-10 h-10 bg-emerald-600 rounded-xl flex items-center justify-center text-white font-black text-xl">🏦</div>
                      <div>
                        <p className="text-xs font-black uppercase tracking-widest text-emerald-900">{adminDetails.admin.bankName || "Pending Setup"}</p>
                        <p className="text-[10px] font-bold text-emerald-600">{adminDetails.admin.branchName || "Global Settlement Branch"}</p>
                      </div>
                    </div>
                    <div className="p-4 bg-white/60 rounded-xl border border-emerald-100">
                      <label className="text-[9px] font-black uppercase tracking-widest text-emerald-400 block mb-1">AccountNumber</label>
                      <p className="font-black text-slate-800 tracking-tight text-lg overflow-hidden text-ellipsis whitespace-nowrap">{adminDetails.admin.accountNumber || "**** **** ****"}</p>
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-400 mb-6 flex items-center gap-3">
                  <span className="w-8 h-px bg-slate-100"></span> Managed Facilities
                </h4>
                <div className="space-y-4">
                  {adminDetails.grounds && adminDetails.grounds.length > 0 ? (
                    adminDetails.grounds.map((ground: Ground) => (
                      <div key={ground._id} className="flex items-center gap-4 bg-white p-4 rounded-3xl border border-slate-100 shadow-sm hover:shadow-md transition-all group">
                        <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl overflow-hidden bg-slate-100 flex-shrink-0 relative">
                          <Image src={ground.images?.[0] || "/placeholder.png"} alt={ground.name} fill className="object-cover" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h5 className="font-bold text-slate-900 truncate group-hover:text-emerald-700 transition-colors">{ground.name}</h5>
                          <p className="text-xs text-slate-500 truncate mt-1">{typeof ground.location === 'object' ? ground.location.address : ground.location}</p>
                        </div>
                        <div className="pr-2 hidden sm:block">
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
  );
}
