"use client";

import { useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { 
  Megaphone, Plus, Search, 
  MoreVertical, Edit, Trash2, 
  ToggleLeft, ToggleRight, 
  Calendar, User, AlertCircle, Loader2, X, ChevronDown
} from "lucide-react";
import { useToast } from "@/lib/hooks/use-toast";

interface Announcement {
  id: string;
  title: string;
  content: string;
  category: string;
  isActive: boolean;
  author: { name: string };
  createdAt: string;
}

export default function AnnouncementsAdminPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "authenticated" && (session?.user as any)?.role !== "ADMIN") {
      router.replace("/dashboard");
    }
  }, [session, status, router]);

  const { toast } = useToast();
  const [data, setData] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState<Announcement | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const [form, setForm] = useState({
    title: "",
    content: "",
    category: "Pajak PBB",
    isActive: true,
  });

  const fetchAnnouncements = useCallback(async () => {
    if (status !== "authenticated" || (session?.user as any)?.role !== "ADMIN") return;
    setLoading(true);
    try {
      const res = await fetch("/api/announcements");
      if (!res.ok) throw new Error();
      const docs = await res.json();
      setData(docs);
    } catch {
      toast("Gagal Memuat Data", "Terjadi kesalahan saat sinkronisasi pengumuman.", "error");
    } finally {
      setLoading(false);
    }
  }, [status, session, toast]);

  useEffect(() => {
    fetchAnnouncements();
  }, [fetchAnnouncements]);

  if (status === "loading" || (session?.user as any)?.role !== "ADMIN") {
     return (
        <div className="min-h-[60vh] flex items-center justify-center">
           <Loader2 className="w-12 h-12 text-[#1E40AF] animate-spin" />
        </div>
     );
  }

  const handleToggleStatus = async (item: Announcement) => {
    try {
      const res = await fetch(`/api/announcements/${item.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !item.isActive }),
      });
      if (!res.ok) throw new Error();
      const updated = await res.json();
      setData(prev => prev.map(a => a.id === updated.id ? updated : a));
      toast("Status Diperbarui", `Pengumuman "${item.title}" kini ${!item.isActive ? "Live" : "Draft"}.`, "success");
    } catch {
      toast("Gagal Update", "Gagal mengganti status visibilitas.", "error");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Hapus pengumuman ini secara permanen?")) return;
    try {
      const res = await fetch(`/api/announcements/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error();
      setData(prev => prev.filter(a => a.id !== id));
      toast("Terhapus", "Pengumuman berhasil dihilangkan.", "success");
    } catch {
      toast("Gagal Hapus", "Gagal menghapus entri dari database.", "error");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const url = editingItem ? `/api/announcements/${editingItem.id}` : "/api/announcements";
      const method = editingItem ? "PATCH" : "POST";
      
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error();
      
      await fetchAnnouncements();
      setShowModal(false);
      setEditingItem(null);
      setForm({ title: "", content: "", category: "Pajak PBB", isActive: true });
      toast("Berhasil", editingItem ? "Data diperbarui." : "Pengumuman dipublikasikan.", "success");
    } catch {
      toast("Gagal", "Simpan data gagal. Periksa koneksi.", "error");
    } finally {
      setSubmitting(false);
    }
  };

  const startEdit = (item: Announcement) => {
    setEditingItem(item);
    setForm({ title: item.title, content: item.content, category: item.category, isActive: item.isActive });
    setShowModal(true);
  };

  const filtered = data.filter(a => a.title.toLowerCase().includes(searchTerm.toLowerCase()));

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="text-left">
          <div className="flex items-center gap-2 text-primary font-black uppercase tracking-[0.2em] text-[10px]">
             System Integrity Hub
          </div>
          <h1 className="text-4xl md:text-5xl font-black italic tracking-tighter mt-2 flex items-center gap-4 uppercase italic">
            <Megaphone className="w-12 h-12 text-primary rotate-[-12deg]" /> Pengumuman <span className="text-primary italic">Publik.</span>
          </h1>
          <p className="text-muted-foreground mt-2 font-medium max-w-xl italic border-l-4 border-primary/10 pl-6">
            &quot;Manajemen komunikasi terpadu untuk penyebaran informasi kebijakan, peringatan, dan update layanan kepada seluruh warga secara real-time.&quot;
          </p>
        </div>
        <button 
          onClick={() => { setEditingItem(null); setForm({ title: "", content: "", category: "Pajak PBB", isActive: true }); setShowModal(true); }}
          className="flex items-center gap-3 px-10 py-5 bg-primary text-white font-black rounded-3xl hover:shadow-2xl hover:shadow-primary/40 transition-all hover:-translate-y-1 active:scale-95 group uppercase text-[10px] tracking-widest shadow-xl"
        >
          <Plus className="w-5 h-5 group-hover:rotate-90 transition-transform" />
          Publikasikan Baru
        </button>
      </div>

      {/* Stats recap */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
         <StatCard label="Total" value={data.length.toString()} color="zinc" />
         <StatCard label="Aktif" value={data.filter(a => a.isActive).length.toString()} color="emerald" />
         <StatCard label="Draft" value={data.filter(a => !a.isActive).length.toString()} color="amber" />
         <StatCard label="Reach" value="Live" color="primary" />
      </div>

      <div className="relative group">
        <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-6 h-6 text-zinc-300 group-focus-within:text-primary transition-all" />
        <input 
          type="text"
          placeholder="Cari Judul, Isi, atau Tag..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-16 pr-8 py-6 bg-white border border-zinc-100 rounded-[2.5rem] outline-none shadow-inner focus:bg-zinc-50 focus:border-primary/20 transition-all font-black text-xs uppercase tracking-widest italic"
        />
      </div>

      <div className="bg-white rounded-[4rem] border border-zinc-100 shadow-2xl shadow-primary/5 overflow-hidden">
        <div className="overflow-x-auto no-scrollbar">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-zinc-50/50 border-b border-zinc-100">
                <th className="px-10 py-8 text-left text-[10px] font-black uppercase tracking-[0.3em] text-zinc-400 italic font-sans">Informasi Utama</th>
                <th className="px-10 py-8 text-left text-[10px] font-black uppercase tracking-[0.3em] text-zinc-400 italic font-sans">Grup Kategori</th>
                <th className="px-10 py-8 text-left text-[10px] font-black uppercase tracking-[0.3em] text-zinc-400 italic font-sans">Otoritas</th>
                <th className="px-10 py-8 text-left text-[10px] font-black uppercase tracking-[0.3em] text-zinc-400 italic font-sans">Sinyal</th>
                <th className="px-10 py-8 text-right text-[10px] font-black uppercase tracking-[0.3em] text-zinc-400 italic font-sans">Operasi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-50">
              {loading ? (
                [1, 2, 3].map(i => <tr key={i}><td colSpan={5} className="px-10 py-12"><div className="h-10 bg-zinc-50 rounded-2xl animate-pulse" /></td></tr>)
              ) : filtered.length === 0 ? (
                <tr>
                   <td colSpan={5} className="px-10 py-32 text-center">
                      <AlertCircle className="w-20 h-20 mx-auto text-zinc-100 mb-6" />
                      <p className="text-xl font-black italic tracking-tighter text-zinc-300 uppercase italic">Ledger Null — Data Kosong.</p>
                   </td>
                </tr>
              ) : filtered.map(item => (
                <tr key={item.id} className="group hover:bg-zinc-50/50 transition-all font-bold text-zinc-900">
                  <td className="px-10 py-10">
                    <div className="flex flex-col text-left">
                      <span className="text-xl tracking-tighter group-hover:text-primary transition-colors uppercase italic font-black">{item.title}</span>
                      <div className="flex items-center gap-3 mt-3 font-black text-[9px] text-zinc-400 uppercase tracking-widest italic leading-none">
                        <Calendar className="w-3.5 h-3.5 text-primary" /> {new Date(item.createdAt).toLocaleDateString("id-ID", { year: "numeric", month: "long", day: "numeric" })}
                      </div>
                    </div>
                  </td>
                  <td className="px-10 py-10">
                    <span className="px-5 py-2 bg-zinc-100/50 text-zinc-500 text-[9px] uppercase tracking-widest rounded-full border border-zinc-100 italic font-black">{item.category}</span>
                  </td>
                  <td className="px-10 py-10">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-2xl bg-primary/10 text-primary flex items-center justify-center shadow-inner group-hover:rotate-6 transition-transform">
                        <User className="w-4 h-4" />
                      </div>
                      <span className="text-xs uppercase italic tracking-tight font-black">{item.author.name}</span>
                    </div>
                  </td>
                  <td className="px-10 py-10">
                    <button 
                      onClick={() => handleToggleStatus(item)}
                      className={`flex items-center gap-3 px-5 py-2.5 rounded-full text-[9px] font-black uppercase tracking-widest border transition-all scale-100 hover:scale-105 active:scale-95 italic ${
                        item.isActive ? "bg-emerald-50 text-emerald-600 border-emerald-100 shadow-xl shadow-emerald-500/5" : "bg-zinc-100 text-zinc-400 border-zinc-200"
                      }`}
                    >
                      {item.isActive ? <><ToggleRight className="w-5 h-5" /> Live</> : <><ToggleLeft className="w-5 h-5" /> Draft</>}
                    </button>
                  </td>
                  <td className="px-10 py-10 text-right">
                    <div className="flex items-center justify-end gap-3 translate-x-4 opacity-100 md:opacity-0 md:group-hover:opacity-100 md:group-hover:translate-x-0 transition-all duration-500">
                      <button onClick={() => startEdit(item)} className="p-4 bg-zinc-50 rounded-2xl hover:bg-primary hover:text-white transition-all text-zinc-400 shadow-sm border border-zinc-100"><Edit className="w-5 h-5" /></button>
                      <button onClick={() => handleDelete(item.id)} className="p-4 bg-red-50 text-red-600 rounded-2xl hover:bg-red-600 hover:text-white transition-all shadow-sm border border-red-100"><Trash2 className="w-5 h-5" /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal CRUD */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6 text-left">
           <div className="absolute inset-0 bg-zinc-950/40 backdrop-blur-md animate-in fade-in duration-500" onClick={() => setShowModal(false)} />
           <div className="bg-white rounded-[4rem] shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto border border-zinc-100 animate-in zoom-in-95 duration-500 relative z-10 p-12 lg:p-16">
              <div className="flex items-start justify-between mb-12">
                 <div className="space-y-4">
                    <div className="flex items-center gap-3 text-primary">
                       <Megaphone className="w-8 h-8" />
                       <p className="text-[10px] font-black uppercase tracking-[0.3em] italic leading-none">Dispatcher Console</p>
                    </div>
                    <h2 className="text-4xl lg:text-5xl font-black italic tracking-tighter uppercase italic leading-none">{editingItem ? "Edit" : "Buat"} <span className="text-primary italic">Pengumuman.</span></h2>
                 </div>
                 <button onClick={() => setShowModal(false)} className="p-5 bg-zinc-50 text-zinc-400 rounded-[2rem] hover:bg-zinc-100 transition-all shadow-inner"><X className="w-6 h-6" /></button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-12">
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                    <div className="space-y-4">
                       <label className="text-[10px] font-black uppercase tracking-[0.4em] text-zinc-400 italic pl-6 leading-none">Judul Informasi</label>
                       <input 
                        required 
                        placeholder="Contoh: Pemutihan Pajak PBB 2026..." 
                        className="w-full px-8 py-6 bg-zinc-50 border border-zinc-100 rounded-[2.5rem] focus:ring-4 focus:ring-primary/10 focus:bg-white outline-none transition-all font-black text-xs uppercase tracking-widest italic shadow-inner"
                        value={form.title}
                        onChange={e => setForm({...form, title: e.target.value})}
                       />
                    </div>
                    <div className="space-y-4">
                       <label className="text-[10px] font-black uppercase tracking-[0.4em] text-zinc-400 italic pl-6 leading-none">Kategori Konten</label>
                       <div className="relative">
                          <select 
                           className="w-full pl-8 pr-12 py-6 bg-zinc-50 border border-zinc-100 rounded-[2.5rem] focus:ring-4 focus:ring-primary/10 outline-none transition-all font-black text-xs uppercase tracking-widest italic shadow-inner appearance-none cursor-pointer"
                           value={form.category}
                           onChange={e => setForm({...form, category: e.target.value})}
                          >
                             <option>Pajak PBB</option>
                             <option>Pajak BPHTB</option>
                             <option>Info Sistem</option>
                             <option>Kebijakan Baru</option>
                             <option>Lainnya</option>
                          </select>
                          <ChevronDown className="absolute right-8 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400 pointer-events-none" />
                       </div>
                    </div>
                 </div>

                 <div className="space-y-4">
                    <label className="text-[10px] font-black uppercase tracking-[0.4em] text-zinc-400 italic pl-6 leading-none">Narasi Lengkap</label>
                    <textarea 
                      required
                      placeholder="Masukkan detail instruksi atau informasi di sini..." 
                      rows={8}
                      className="w-full px-8 py-8 bg-zinc-50 border border-zinc-100 rounded-[3rem] focus:ring-4 focus:ring-primary/10 focus:bg-white outline-none transition-all font-medium italic text-sm shadow-inner resize-none"
                      value={form.content}
                      onChange={e => setForm({...form, content: e.target.value})}
                    />
                 </div>

                 <div className="flex items-center gap-10 pt-6">
                    <button 
                      type="submit" 
                      disabled={submitting}
                      className="flex-1 h-20 bg-primary text-white font-black rounded-full hover:shadow-2xl hover:shadow-primary/40 transition-all active:scale-95 flex items-center justify-center gap-4 uppercase text-xs tracking-widest disabled:opacity-50"
                    >
                       {submitting ? <Loader2 className="w-6 h-6 animate-spin" /> : <><Plus className="w-5 h-5" /> Konfirmasi Publikasi</>}
                    </button>
                    <button 
                      type="button"
                      onClick={() => setShowModal(false)}
                      className="h-20 px-12 bg-zinc-50 text-zinc-400 font-black rounded-full hover:bg-zinc-100 transition-all border border-zinc-100 uppercase text-[10px] tracking-widest shadow-inner"
                    >
                      Batal
                    </button>
                 </div>
              </form>
           </div>
        </div>
      )}
    </div>
  );
}

function StatCard({ label, value, color }: { label: string; value: string; color: string }) {
  const colors: Record<string, string> = {
    emerald: "text-emerald-500 bg-emerald-50",
    amber: "text-amber-500 bg-amber-50",
    zinc: "text-zinc-500 bg-zinc-50",
    primary: "text-primary bg-primary/5 shadow-glow shadow-primary",
  };

  return (
    <div className="bg-white p-10 rounded-[3.5rem] border border-zinc-50 shadow-xl shadow-primary/[0.02] flex items-center justify-between group hover:scale-[1.02] transition-all">
       <div className="space-y-2 text-left">
          <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest italic">{label}</p>
          <p className="text-4xl font-black italic tracking-tighter text-foreground italic">{value}</p>
       </div>
       <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${colors[color]} shadow-inner group-hover:rotate-12 transition-transform`}>
          <Megaphone className="w-6 h-6" />
       </div>
    </div>
  );
}

