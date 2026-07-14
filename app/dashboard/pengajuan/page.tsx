"use client";

import { useEffect, useState } from "react";
import { 
  FileText, Plus, Search, Loader2, X, AlertTriangle, 
  CheckCircle2, Clock, Upload, ArrowUpRight, HelpCircle
} from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { useToast } from "@/lib/hooks/use-toast";
import { FileUpload } from "@/components/FileUpload";
import { cn } from "@/lib/utils";

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
}

const statusBadge: Record<string, string> = {
  PENDING: "bg-amber-50 text-amber-600 border-amber-200 shadow-sm",
  IN_PROGRESS: "bg-blue-50 text-blue-600 border-blue-200 shadow-sm",
  APPROVED: "bg-emerald-50 text-emerald-600 border-emerald-200 shadow-sm",
  REJECTED: "bg-rose-50 text-rose-600 border-rose-200 shadow-sm",
};

const statusLabel: Record<string, string> = {
  PENDING: "Menunggu Verifikasi",
  IN_PROGRESS: "Diproses Petugas",
  APPROVED: "Disetujui",
  REJECTED: "Ditolak",
};

export default function UserSubmissionsPage() {
  const { toast } = useToast();
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterType, setFilterType] = useState("ALL");
  
  // Create Modal State
  const [isOpen, setIsOpen] = useState(false);
  const [createLoading, setCreateLoading] = useState(false);
  const [form, setForm] = useState({
    type: "KEBERATAN",
    title: "",
    description: "",
    documentUrl: ""
  });

  const fetchSubmissions = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/submissions");
      if (!res.ok) throw new Error();
      const data = await res.json();
      setSubmissions(data.submissions || []);
    } catch {
      toast("Error", "Gagal memuat riwayat pengajuan.", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSubmissions();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title || !form.description) {
      toast("Error", "Silakan isi semua kolom wajib.", "error");
      return;
    }
    setCreateLoading(true);
    try {
      const res = await fetch("/api/submissions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form)
      });
      if (!res.ok) throw new Error();
      
      toast("Berhasil", "Pengajuan baru Anda telah terkirim untuk verifikasi.", "success");
      setIsOpen(false);
      setForm({ type: "KEBERATAN", title: "", description: "", documentUrl: "" });
      fetchSubmissions();
    } catch {
      toast("Error", "Gagal mengirimkan pengajuan baru.", "error");
    } finally {
      setCreateLoading(false);
    }
  };

  const filtered = submissions.filter((sub) => {
    const matchSearch = 
      sub.ticketNumber.toLowerCase().includes(search.toLowerCase()) ||
      sub.title.toLowerCase().includes(search.toLowerCase());
    const matchType = filterType === "ALL" || sub.type === filterType;
    return matchSearch && matchType;
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
            <p className="text-[10px] font-black text-primary uppercase tracking-[0.3em]">Dokumentasi Pengajuan</p>
          </div>
          <h1 className="text-3xl font-black italic uppercase text-foreground tracking-tight">Pengajuan Layanan PBB-P2</h1>
          <p className="text-zinc-500 max-w-2xl font-medium text-sm">
            Ajukan keberatan penetapan pajak atau lakukan pembaruan data wajib/objek pajak Anda secara online dilengkapi bukti dokumen pendukung.
          </p>
        </div>

        <Button 
          onClick={() => setIsOpen(true)}
          className="bg-primary hover:bg-primary/90 text-white rounded-full font-black uppercase text-xs tracking-wider h-12 px-8 flex items-center gap-2"
        >
          <Plus className="w-4 h-4" /> Pengajuan Baru
        </Button>
      </div>

      {/* Filter and Search Bar */}
      <Card padding="md" className="bg-white border-zinc-100 shadow-xl shadow-zinc-100/50 overflow-visible relative z-30">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
            <input
              type="text"
              placeholder="Cari berdasarkan nomor tiket atau judul pengajuan..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-11 pr-4 h-12 bg-zinc-50 border border-zinc-100 rounded-2xl text-sm focus:outline-none focus:border-primary/30 transition-all font-medium"
            />
          </div>
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
        </div>
      </Card>

      {/* History Checklist List */}
      {loading ? (
        <div className="min-h-[300px] flex items-center justify-center">
          <Loader2 className="w-10 h-10 text-primary animate-spin" />
        </div>
      ) : filtered.length === 0 ? (
        <Card padding="lg" className="border-dashed border-2 border-zinc-200 flex flex-col items-center justify-center p-20 text-center">
          <div className="w-16 h-16 bg-zinc-50 rounded-3xl flex items-center justify-center mb-6 text-zinc-400">
            <HelpCircle className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-black uppercase tracking-tight text-zinc-700">Belum Ada Pengajuan</h3>
          <p className="text-zinc-500 text-sm max-w-sm mt-2 font-medium">
            Anda belum pernah mengirimkan berkas pengajuan keberatan atau perubahan data di portal ini.
          </p>
        </Card>
      ) : (
        <div className="space-y-6">
          {filtered.map((sub) => (
            <Card 
              key={sub.id} 
              padding="lg" 
              className="bg-white border-zinc-100 rounded-[2.5rem] shadow-xl hover:shadow-2xl hover:shadow-primary/5 transition-all flex flex-col lg:flex-row justify-between gap-6"
            >
              <div className="space-y-4 flex-1">
                {/* Meta */}
                <div className="flex flex-wrap items-center gap-3">
                  <span className="px-3.5 py-1.5 bg-zinc-100 rounded-full font-black text-[9px] uppercase tracking-wider text-zinc-600">
                    {sub.ticketNumber}
                  </span>
                  <span className="px-3.5 py-1.5 bg-primary/10 rounded-full font-black text-[9px] uppercase tracking-wider text-primary">
                    {sub.type === "KEBERATAN" ? "Keberatan Pajak" : "Perubahan Data"}
                  </span>
                  <span className="text-[10px] font-bold text-zinc-400">
                    {new Date(sub.createdAt).toLocaleDateString("id-ID", { day: 'numeric', month: 'long', year: 'numeric' })}
                  </span>
                </div>

                <div className="space-y-2">
                  <h4 className="text-lg font-black uppercase tracking-tight text-zinc-800 leading-snug">{sub.title}</h4>
                  <p className="text-zinc-600 font-medium text-sm leading-relaxed">{sub.description}</p>
                </div>

                {/* Review Notes */}
                {sub.reviewNotes && (
                  <div className="p-4 bg-zinc-50 rounded-2xl border border-zinc-100 text-xs">
                    <span className="font-black text-zinc-800 uppercase block mb-1">Catatan Verifikasi:</span>
                    <p className="text-zinc-600 font-medium">{sub.reviewNotes}</p>
                  </div>
                )}
              </div>

              {/* Status and Action Panel */}
              <div className="flex flex-col justify-between items-start lg:items-end gap-4 min-w-[200px]">
                <span className={cn(
                  "px-4 py-2 rounded-full text-xs font-black uppercase tracking-widest border",
                  statusBadge[sub.status]
                )}>
                  {statusLabel[sub.status]}
                </span>

                {sub.documentUrl && (
                  <a 
                    href={sub.documentUrl} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="inline-flex items-center text-xs font-black text-primary uppercase border-b border-primary/20 hover:border-primary transition-all pb-0.5"
                  >
                    Dokumen Lampiran <ArrowUpRight className="w-4 h-4 ml-1" />
                  </a>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* New Submission Modal */}
      {isOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-[2.5rem] w-full max-w-2xl overflow-hidden shadow-2xl relative animate-in zoom-in-95 duration-200 text-left">
            
            {/* Header */}
            <div className="bg-zinc-50 px-8 py-6 border-b border-zinc-100 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <FileText className="w-6 h-6 text-primary" />
                <div>
                  <h3 className="font-black uppercase tracking-tight text-zinc-800">Form Pengajuan Baru</h3>
                  <p className="text-[10px] text-zinc-500 font-semibold leading-none mt-1">Layanan Keberatan & Perubahan Data PBB-P2</p>
                </div>
              </div>
              <button 
                onClick={() => setIsOpen(false)}
                className="w-10 h-10 bg-zinc-100 rounded-full flex items-center justify-center hover:bg-zinc-200 transition-colors"
              >
                <X className="w-5 h-5 text-zinc-600" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-8 space-y-6">
              <div>
                <label className="text-[10px] font-black uppercase text-zinc-400 tracking-wider block mb-2">Jenis Pengajuan</label>
                <select
                  value={form.type}
                  onChange={(e) => setForm({ ...form, type: e.target.value })}
                  className="w-full h-12 px-4 bg-zinc-50 border border-zinc-100 rounded-2xl text-sm font-semibold focus:outline-none focus:border-primary/30 transition-all"
                >
                  <option value="KEBERATAN">Keberatan Pajak (NJOP / SPPT)</option>
                  <option value="PERUBAHAN">Perubahan Data Objek/Wajib Pajak</option>
                </select>
              </div>

              <div>
                <label className="text-[10px] font-black uppercase text-zinc-400 tracking-wider block mb-2">Judul Pengajuan *</label>
                <input
                  type="text"
                  placeholder="Contoh: Keberatan Besaran NJOP Bumi NOP 12.72..."
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  required
                  className="w-full h-12 px-4 bg-zinc-50 border border-zinc-100 rounded-2xl text-sm font-medium focus:outline-none focus:border-primary/30 transition-all"
                />
              </div>

              <div>
                <label className="text-[10px] font-black uppercase text-zinc-400 tracking-wider block mb-2">Deskripsi & Alasan Rinci *</label>
                <textarea
                  placeholder="Jelaskan secara mendetail perihal dan alasan pengajuan Anda..."
                  rows={5}
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  required
                  className="w-full p-4 bg-zinc-50 border border-zinc-100 rounded-2xl text-sm font-medium focus:outline-none focus:border-primary/30 transition-all"
                />
              </div>

              <div>
                <label className="text-[10px] font-black uppercase text-zinc-400 tracking-wider block mb-2">Dokumen Pendukung (PDF/Format Gambar)</label>
                <div className="space-y-4">
                  <FileUpload 
                    endpoint="researchDocument" 
                    value={form.documentUrl} 
                    onChange={(url) => setForm({ ...form, documentUrl: url || "" })} 
                  />
                  
                  <div className="flex items-center gap-3">
                    <span className="h-px bg-zinc-100 flex-1" />
                    <span className="text-[9px] font-bold text-zinc-400 uppercase">Atau masukkan URL dokumen</span>
                    <span className="h-px bg-zinc-100 flex-1" />
                  </div>

                  <input
                    type="url"
                    placeholder="https://..."
                    value={form.documentUrl}
                    onChange={(e) => setForm({ ...form, documentUrl: e.target.value })}
                    className="w-full h-12 px-4 bg-zinc-50 border border-zinc-100 rounded-2xl text-sm font-medium focus:outline-none focus:border-primary/30 transition-all"
                  />
                </div>
              </div>

              <div className="pt-4 border-t border-zinc-100 flex justify-end items-center gap-3 bg-zinc-50 -mx-8 -mb-8 p-6 px-8">
                <Button 
                  type="button" 
                  variant="ghost" 
                  onClick={() => setIsOpen(false)}
                  className="rounded-full font-black uppercase text-[10px] tracking-widest h-12 px-6"
                >
                  Batal
                </Button>
                <Button 
                  type="submit" 
                  disabled={createLoading}
                  className="bg-primary hover:bg-primary/90 text-white rounded-full font-black uppercase text-[10px] tracking-widest h-12 px-8"
                >
                  {createLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Kirim Pengajuan"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
