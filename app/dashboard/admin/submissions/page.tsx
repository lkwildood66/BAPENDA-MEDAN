"use client";

import { useEffect, useState, useCallback } from "react";
import { 
  FileText, Search, Loader2, X, AlertTriangle, 
  CheckCircle2, Clock, Eye, Filter, ArrowUpRight, Check, XCircle
} from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { useToast } from "@/lib/hooks/use-toast";
import { cn } from "@/lib/utils";

interface User {
  name: string | null;
  email: string | null;
  nik: string | null;
  phone: string | null;
}

interface Submission {
  id: string;
  ticketNumber: string;
  type: string;
  title: string;
  description: string;
  documentUrl?: string;
  status: string;
  reviewNotes?: string;
  createdAt: string;
  user: User;
}

const statusBadge: Record<string, string> = {
  PENDING: "bg-amber-50 text-amber-600 border-amber-200 shadow-sm",
  IN_PROGRESS: "bg-blue-50 text-blue-600 border-blue-200 shadow-sm",
  APPROVED: "bg-emerald-50 text-emerald-600 border-emerald-200 shadow-sm",
  REJECTED: "bg-rose-50 text-rose-600 border-rose-200 shadow-sm",
};

const statusLabel: Record<string, string> = {
  PENDING: "Menunggu Verifikasi",
  IN_PROGRESS: "Diproses",
  APPROVED: "Disetujui",
  REJECTED: "Ditolak",
};

export default function AdminSubmissionsPage() {
  const { toast } = useToast();
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("ALL");
  const [filterType, setFilterType] = useState("ALL");

  // Review Modal State
  const [selectedSub, setSelectedSub] = useState<Submission | null>(null);
  const [reviewNotes, setReviewNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchSubmissions = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/submissions");
      if (!res.ok) throw new Error();
      const data = await res.json();
      setSubmissions(data.submissions || []);
    } catch {
      toast("Error", "Gagal memuat daftar pengajuan masuk.", "error");
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchSubmissions();
  }, [fetchSubmissions]);

  const handleUpdateStatus = async (id: string, newStatus: string) => {
    setIsSubmitting(true);
    try {
      const res = await fetch(`/api/submissions/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus, reviewNotes })
      });
      
      if (!res.ok) throw new Error();
      
      toast("Berhasil", `Status pengajuan telah diubah menjadi ${newStatus}.`, "success");
      setSelectedSub(null);
      setReviewNotes("");
      fetchSubmissions();
    } catch {
      toast("Error", "Gagal memperbarui status pengajuan.", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const filtered = submissions.filter((sub) => {
    const matchSearch = 
      sub.ticketNumber.toLowerCase().includes(search.toLowerCase()) ||
      sub.title.toLowerCase().includes(search.toLowerCase()) ||
      (sub.user.name || "").toLowerCase().includes(search.toLowerCase());
    
    const matchStatus = filterStatus === "ALL" || sub.status === filterStatus;
    const matchType = filterType === "ALL" || sub.type === filterType;
    
    return matchSearch && matchStatus && matchType;
  });

  return (
    <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20 text-left">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary/10 rounded-2xl flex items-center justify-center border border-primary/10">
              <FileText className="w-5 h-5 text-primary" />
            </div>
            <p className="text-[10px] font-black text-primary uppercase tracking-[0.3em]">Verifikasi Berkas Pengajuan</p>
          </div>
          <h1 className="text-3xl font-black italic uppercase text-foreground tracking-tight">Dokumentasi Pengajuan</h1>
          <p className="text-zinc-500 max-w-2xl font-medium text-sm">
            Verifikasi dan berikan persetujuan permohonan keberatan pajak serta perubahan data wajib pajak yang dikirim secara digital.
          </p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <Card padding="md" className="bg-white border-zinc-100 shadow-xl shadow-zinc-100/50 overflow-visible relative z-30">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
            <input
              type="text"
              placeholder="Cari berdasarkan tiket, judul, atau nama wajib pajak..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-11 pr-4 h-12 bg-zinc-50 border border-zinc-100 rounded-2xl text-sm focus:outline-none focus:border-primary/30 transition-all font-medium"
            />
          </div>
          <div className="flex flex-col md:flex-row gap-4">
            <div className="w-full md:w-48">
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="w-full h-12 px-4 bg-zinc-50 border border-zinc-100 rounded-2xl text-sm focus:outline-none focus:border-primary/30 transition-all font-semibold"
              >
                <option value="ALL">Semua Jenis</option>
                <option value="KEBERATAN">Keberatan Pajak</option>
                <option value="PERUBAHAN">Perubahan Data</option>
              </select>
            </div>
            <div className="w-full md:w-48">
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="w-full h-12 px-4 bg-zinc-50 border border-zinc-100 rounded-2xl text-sm focus:outline-none focus:border-primary/30 transition-all font-semibold"
              >
                <option value="ALL">Semua Status</option>
                <option value="PENDING">Menunggu Verifikasi</option>
                <option value="IN_PROGRESS">Diproses</option>
                <option value="APPROVED">Disetujui</option>
                <option value="REJECTED">Ditolak</option>
              </select>
            </div>
          </div>
        </div>
      </Card>

      {/* Main Table */}
      {loading ? (
        <div className="min-h-[300px] flex items-center justify-center">
          <Loader2 className="w-10 h-10 text-primary animate-spin" />
        </div>
      ) : filtered.length === 0 ? (
        <Card padding="lg" className="border-dashed border-2 border-zinc-200 flex flex-col items-center justify-center p-20 text-center">
          <div className="w-16 h-16 bg-zinc-50 rounded-3xl flex items-center justify-center mb-6 text-zinc-400">
            <AlertTriangle className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-black uppercase tracking-tight text-zinc-700">Tidak Ada Pengajuan</h3>
          <p className="text-zinc-500 text-sm max-w-sm mt-2 font-medium">
            Sistem tidak mendeteksi adanya permohonan masuk dengan filter saat ini.
          </p>
        </Card>
      ) : (
        <div className="bg-white border border-zinc-100 rounded-3xl overflow-hidden shadow-2xl shadow-zinc-100">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-zinc-100 text-[10px] font-black uppercase text-zinc-400 tracking-wider bg-zinc-50/50">
                  <th className="py-4 px-6">Nomor Tiket & Tanggal</th>
                  <th className="py-4 px-6">Wajib Pajak</th>
                  <th className="py-4 px-6">Jenis & Judul Pengajuan</th>
                  <th className="py-4 px-6 text-center">Status</th>
                  <th className="py-4 px-6 text-right">Tindakan</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100 text-xs font-semibold text-zinc-700">
                {filtered.map((sub) => (
                  <tr key={sub.id} className="hover:bg-zinc-50/50 transition-colors">
                    <td className="py-4 px-6">
                      <div>
                        <span className="font-black text-zinc-800 block">{sub.ticketNumber}</span>
                        <span className="text-[10px] text-zinc-400 font-bold block mt-0.5">
                          {new Date(sub.createdAt).toLocaleDateString("id-ID")}
                        </span>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <div>
                        <span className="font-bold text-zinc-800 block">{sub.user.name || "—"}</span>
                        <span className="text-[10px] text-zinc-400 block mt-0.5">NIK: {sub.user.nik || "—"}</span>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="space-y-1">
                        <span className="px-2.5 py-0.5 bg-primary/10 rounded-full font-black text-[9px] uppercase tracking-wider text-primary inline-block">
                          {sub.type === "KEBERATAN" ? "Keberatan Pajak" : "Perubahan Data"}
                        </span>
                        <span className="font-bold text-zinc-700 block truncate max-w-[250px]">{sub.title}</span>
                      </div>
                    </td>
                    <td className="py-4 px-6 text-center">
                      <span className={cn(
                        "px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-wider border inline-block",
                        statusBadge[sub.status]
                      )}>
                        {statusLabel[sub.status]}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-right">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setSelectedSub(sub);
                          setReviewNotes(sub.reviewNotes || "");
                        }}
                        className="rounded-xl hover:bg-zinc-50 h-9 font-black uppercase text-[10px]"
                      >
                        <Eye className="w-3.5 h-3.5 mr-1" /> Periksa
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Verification Modal */}
      {selectedSub && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-[2.5rem] w-full max-w-3xl overflow-hidden shadow-2xl relative animate-in zoom-in-95 duration-200 text-left">
            
            {/* Header */}
            <div className="bg-zinc-50 px-8 py-6 border-b border-zinc-100 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <FileText className="w-6 h-6 text-primary" />
                <div>
                  <h3 className="font-black uppercase tracking-tight text-zinc-800">Verifikasi Berkas Pengajuan</h3>
                  <p className="text-[10px] text-zinc-500 font-semibold leading-none mt-1">Review Berkas Kelengkapan Digital</p>
                </div>
              </div>
              <button 
                onClick={() => setSelectedSub(null)}
                className="w-10 h-10 bg-zinc-100 rounded-full flex items-center justify-center hover:bg-zinc-200 transition-colors"
              >
                <X className="w-5 h-5 text-zinc-600" />
              </button>
            </div>

            <div className="p-8 space-y-6 max-h-[75vh] overflow-y-auto">
              {/* Submission Information Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-zinc-50/50 p-6 border border-zinc-100 rounded-[2rem] text-xs">
                <div className="space-y-3">
                  <div>
                    <span className="text-[9px] font-black uppercase text-zinc-400 tracking-wider block">Nomor Tiket</span>
                    <span className="font-black text-zinc-800 text-sm">{selectedSub.ticketNumber}</span>
                  </div>
                  <div>
                    <span className="text-[9px] font-black uppercase text-zinc-400 tracking-wider block">Tanggal Masuk</span>
                    <span className="font-bold text-zinc-700">{new Date(selectedSub.createdAt).toLocaleString("id-ID")}</span>
                  </div>
                  <div>
                    <span className="text-[9px] font-black uppercase text-zinc-400 tracking-wider block">Jenis Pengajuan</span>
                    <span className="px-2.5 py-0.5 bg-primary/10 rounded-full font-black text-[9px] uppercase tracking-wider text-primary inline-block mt-1">
                      {selectedSub.type === "KEBERATAN" ? "Keberatan Pajak" : "Perubahan Data"}
                    </span>
                  </div>
                </div>

                <div className="space-y-3">
                  <div>
                    <span className="text-[9px] font-black uppercase text-zinc-400 tracking-wider block">Wajib Pajak</span>
                    <span className="font-black text-zinc-800 block text-sm">{selectedSub.user.name || "—"}</span>
                    <span className="text-[10px] text-zinc-500 font-bold block mt-0.5">NIK: {selectedSub.user.nik || "—"}</span>
                  </div>
                  <div>
                    <span className="text-[9px] font-black uppercase text-zinc-400 tracking-wider block">Kontak WA / Email</span>
                    <span className="font-bold text-zinc-700 block">{selectedSub.user.phone || "—"}</span>
                    <span className="text-zinc-500 block">{selectedSub.user.email || "—"}</span>
                  </div>
                </div>
              </div>

              {/* Title & Description */}
              <div className="space-y-3">
                <div>
                  <span className="text-[10px] font-black uppercase text-zinc-400 tracking-wider block mb-1">Judul Permohonan</span>
                  <h4 className="text-base font-black uppercase tracking-tight text-zinc-800">{selectedSub.title}</h4>
                </div>
                <div>
                  <span className="text-[10px] font-black uppercase text-zinc-400 tracking-wider block mb-1">Deskripsi / Alasan</span>
                  <p className="text-zinc-600 text-sm leading-relaxed font-semibold p-4 bg-zinc-50 rounded-2xl border border-zinc-100">{selectedSub.description}</p>
                </div>
              </div>

              {/* Supporting Document */}
              {selectedSub.documentUrl && (
                <div>
                  <span className="text-[10px] font-black uppercase text-zinc-400 tracking-wider block mb-2">Dokumen Pendukung Lampiran</span>
                  <a 
                    href={selectedSub.documentUrl} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="inline-flex items-center px-5 py-3 bg-zinc-50 border border-zinc-200 hover:border-primary/30 rounded-2xl text-xs font-black text-primary uppercase transition-all"
                  >
                    Buka Berkas Lampiran <ArrowUpRight className="w-4.5 h-4.5 ml-2" />
                  </a>
                </div>
              )}

              {/* Actions Section */}
              <div className="border-t border-zinc-100 pt-6 space-y-4">
                <div>
                  <label className="text-[10px] font-black uppercase text-zinc-400 tracking-wider block mb-2">Catatan Verifikasi & Tanggapan Petugas</label>
                  <textarea
                    placeholder="Masukkan alasan persetujuan, penolakan, atau masukan revisi berkas bagi wajib pajak..."
                    rows={4}
                    value={reviewNotes}
                    onChange={(e) => setReviewNotes(e.target.value)}
                    className="w-full p-4 bg-zinc-50 border border-zinc-100 rounded-2xl text-xs font-medium focus:outline-none focus:border-primary/30 transition-all text-zinc-800"
                  />
                </div>

                <div className="flex flex-wrap gap-3 justify-end bg-zinc-50 -mx-8 -mb-8 p-6 px-8 items-center">
                  <div className="text-[10px] text-zinc-400 font-bold mr-auto">* Penggantian status memicu notifikasi real-time ke Wajib Pajak.</div>
                  
                  {selectedSub.status !== "IN_PROGRESS" && selectedSub.status !== "APPROVED" && selectedSub.status !== "REJECTED" && (
                    <Button
                      type="button"
                      disabled={isSubmitting}
                      onClick={() => handleUpdateStatus(selectedSub.id, "IN_PROGRESS")}
                      className="bg-blue-600 hover:bg-blue-700 text-white rounded-full font-black uppercase text-[9px] tracking-wider px-6 h-11"
                    >
                      <Clock className="w-3.5 h-3.5 mr-1" /> Proses Pengajuan
                    </Button>
                  )}
                  
                  <Button
                    type="button"
                    disabled={isSubmitting}
                    onClick={() => handleUpdateStatus(selectedSub.id, "APPROVED")}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-full font-black uppercase text-[9px] tracking-wider px-6 h-11"
                  >
                    <Check className="w-3.5 h-3.5 mr-1" /> Setujui
                  </Button>
                  
                  <Button
                    type="button"
                    disabled={isSubmitting}
                    onClick={() => handleUpdateStatus(selectedSub.id, "REJECTED")}
                    className="bg-rose-600 hover:bg-rose-700 text-white rounded-full font-black uppercase text-[9px] tracking-wider px-6 h-11"
                  >
                    <XCircle className="w-3.5 h-3.5 mr-1" /> Tolak
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
