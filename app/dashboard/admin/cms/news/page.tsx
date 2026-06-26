"use client";

import { useEffect, useState, useCallback } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Plus, Search, FileText, Trash2, Edit, CheckCircle, XCircle, Loader2, X, ChevronDown } from "lucide-react";
import { useToast } from "@/lib/hooks/use-toast";

interface NewsItem {
  id: string;
  title: string;
  summary: string;
  content: string;
  category: string;
  isActive: boolean;
  createdAt: string;
  slug: string;
}

export default function AdminNewsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "authenticated" && (session?.user as any)?.role !== "ADMIN") {
      router.replace("/dashboard");
    }
  }, [session, status, router]);

  const { toast } = useToast();
  const [news, setNews] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState<NewsItem | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    title: "",
    summary: "",
    content: "",
    category: "Pajak",
    isActive: true,
  });

  const fetchNews = useCallback(async () => {
    if (status !== "authenticated" || (session?.user as any)?.role !== "ADMIN") return;
    setLoading(true);
    try {
      const res = await fetch("/api/cms/news");
      if (!res.ok) throw new Error();
      const data = await res.json();
      setNews(Array.isArray(data) ? data : []);
    } catch {
      toast("Error", "Gagal mengambil data dari server.", "error");
    } finally {
      setLoading(false);
    }
  }, [status, session, toast]);

  useEffect(() => {
    fetchNews();
  }, [fetchNews]);

  if (status === "loading" || (session?.user as any)?.role !== "ADMIN") {
     return (
        <div className="min-h-[60vh] flex items-center justify-center">
           <Loader2 className="w-12 h-12 text-[#1E40AF] animate-spin" />
        </div>
     );
  }

  const handleEdit = (item: NewsItem) => {
    setEditingItem(item);
    setForm({
      title: item.title,
      summary: item.summary,
      content: item.content,
      category: item.category,
      isActive: item.isActive,
    });
    setShowModal(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Hapus berita ini secara permanen?")) return;
    try {
      const res = await fetch(`/api/cms/news/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error();
      toast("Berhasil", "Berita berhasil dihapus.", "success");
      fetchNews();
    } catch {
      toast("Error", "Gagal menghapus data.", "error");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError("");

    try {
      const url = editingItem ? `/api/cms/news/${editingItem.id}` : "/api/cms/news";
      const method = editingItem ? "PATCH" : "POST";
      
      const res = await fetch(url, {
        method,
        body: JSON.stringify(form),
        headers: { "Content-Type": "application/json" },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Gagal menyimpan berita");
      
      setShowModal(false);
      setEditingItem(null);
      setForm({ title: "", summary: "", content: "", category: "Pajak", isActive: true });
      fetchNews();
      toast("Sukses", editingItem ? "Berita diperbarui." : "Berita dipublikasikan.", "success");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Gagal menyimpan berita");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-1000 pb-20 selection:bg-primary/20 text-left">
      
      {/* ── Page Header ── */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-10 px-4">
        <div className="space-y-4">
          <div className="flex items-center gap-3 text-primary">
             <div className="w-10 h-1 bg-primary rounded-full shadow-glow" />
             <p className="text-[10px] font-black uppercase tracking-[0.3em] italic leading-none">Global Content Hub</p>
          </div>
          <h1 className="text-5xl md:text-7xl font-black italic tracking-tighter leading-[0.85] text-foreground uppercase italic underline decoration-primary/10 decoration-8 underline-offset-8">
            CMS <span className="text-primary italic">Berita.</span>
          </h1>
          <p className="text-xl text-muted-foreground font-medium max-w-xl leading-relaxed italic border-l-4 border-primary/10 pl-8 ml-2">
            &quot;Publikasi berita fiskal, update operasional, dan informasi strategis untuk landing page portal Bapenda Medan.&quot;
          </p>
        </div>
        <button
          onClick={() => { setEditingItem(null); setForm({ title: "", summary: "", content: "", category: "Pajak", isActive: true }); setShowModal(true); }}
          className="btn-premium flex items-center gap-4 px-12 py-6 bg-primary text-white rounded-[2rem] font-black uppercase text-xs tracking-widest shadow-2xl shadow-primary/30 group self-start lg:self-auto"
        >
          <Plus className="w-5 h-5 group-hover:rotate-90 transition-transform" /> Tambah Berita Baru
        </button>
      </div>

      {/* ── List Section ── */}
      <div className="space-y-8 pt-10 px-4">
         <div className="relative group">
            <div className="absolute inset-0 bg-primary/5 rounded-[2.5rem] blur-xl opacity-0 group-focus-within:opacity-100 transition-opacity -z-10" />
            <Search className="absolute left-8 top-1/2 -translate-y-1/2 w-6 h-6 text-zinc-300 group-focus-within:text-primary transition-colors" />
            <input
              type="text"
              placeholder="Cari Judul Berita atau Naskah..."
              className="w-full pl-22 pr-10 h-22 bg-zinc-50 border border-zinc-100 rounded-[2.5rem] outline-none shadow-inner focus:bg-white focus:border-primary/20 transition-all font-black text-lg tracking-tight italic"
            />
         </div>
         
         <div className="grid grid-cols-1 gap-8">
            {loading ? (
              [1, 2, 3].map((i) => (
                <div key={i} className="h-40 bg-zinc-50 rounded-[4rem] animate-pulse border border-zinc-100" />
              ))
            ) : news.length === 0 ? (
              <div className="py-24 text-center bg-white rounded-[4rem] border-2 border-dashed border-zinc-100 group hover:border-primary/20 transition-all shadow-inner">
                <FileText className="w-20 h-20 mx-auto text-zinc-100 mb-6" />
                <p className="text-xl font-black italic tracking-tighter text-zinc-300 uppercase italic">Ledger Kosong — No News Logged.</p>
              </div>
            ) : (
              news.map((item) => (
                <div key={item.id} className="bg-white border border-zinc-100 rounded-[4rem] p-10 lg:p-14 hover:shadow-[0_50px_100px_-20px_rgba(37,99,235,0.1)] hover:scale-[1.01] transition-all duration-700 shadow-xl shadow-primary/[0.03] group relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-12 text-left">
                  <div className="absolute top-0 left-0 w-2 h-full bg-primary/10" />
                  <div className="flex flex-col md:flex-row items-center gap-10 flex-1 relative z-10 w-full md:w-auto">
                    <div className="w-24 h-24 bg-zinc-50 border border-zinc-100 rounded-[2.5rem] flex items-center justify-center font-black text-3xl italic tracking-tighter text-zinc-400 shadow-inner group-hover:rotate-6 transition-transform">
                       <FileText className="w-10 h-10 text-primary opacity-20" />
                    </div>
                    
                    <div className="text-left space-y-4 flex-1">
                      <div className="flex flex-wrap items-center gap-4">
                        <span className="px-6 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border italic leading-none bg-blue-50 text-blue-600 border-blue-100 shadow-sm">
                          {item.category}
                        </span>
                        <span className="text-[10px] font-black text-zinc-300 uppercase tracking-widest italic">{new Date(item.createdAt).toLocaleDateString()}</span>
                        {item.isActive ? (
                          <span className="flex items-center gap-1.5 text-emerald-600 text-[10px] font-black uppercase tracking-widest italic bg-emerald-50 px-4 py-1.5 rounded-full border border-emerald-100">
                             <CheckCircle className="w-3.5 h-3.5" /> Published
                          </span>
                        ) : (
                          <span className="flex items-center gap-1.5 text-zinc-400 text-[10px] font-black uppercase tracking-widest italic bg-zinc-100 px-4 py-1.5 rounded-full border border-zinc-200">
                             <XCircle className="w-3.5 h-3.5" /> Draft
                          </span>
                        )}
                      </div>
                      <h3 className="text-3xl font-black italic tracking-tighter group-hover:text-primary transition-colors leading-tight uppercase italic">{item.title}</h3>
                      <p className="text-sm font-medium text-muted-foreground italic line-clamp-1 border-l-4 border-zinc-50 pl-6 ml-1">{item.summary}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 relative z-10">
                     <button 
                      onClick={() => handleEdit(item)}
                      className="p-5 hover:bg-primary hover:text-white text-zinc-400 bg-zinc-50 border border-zinc-100 rounded-[2rem] transition-all shadow-inner"
                     >
                      <Edit className="w-6 h-6" />
                     </button>
                     <button 
                      onClick={() => handleDelete(item.id)}
                      className="p-5 hover:bg-red-600 hover:text-white text-red-600 bg-red-50 border border-red-100 rounded-[2rem] transition-all shadow-inner"
                     >
                      <Trash2 className="w-6 h-6" />
                     </button>
                  </div>
                </div>
              ))
            )}
         </div>
      </div>

      {/* ── Create/Edit Modal ── */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6 text-left">
           <div className="absolute inset-0 bg-zinc-950/40 backdrop-blur-md animate-in fade-in duration-500" onClick={() => setShowModal(false)} />
           <div className="bg-white rounded-[4rem] shadow-2xl w-full max-w-5xl max-h-[95vh] overflow-y-auto border border-zinc-100 animate-in zoom-in-95 duration-500 relative z-10 p-12 lg:p-16">
              <div className="flex items-start justify-between mb-12">
                 <div className="space-y-4">
                    <div className="flex items-center gap-3 text-primary">
                       <FileText className="w-8 h-8" />
                       <p className="text-[10px] font-black uppercase tracking-[0.3em] italic leading-none">CMS Terminal</p>
                    </div>
                    <h2 className="text-4xl lg:text-5xl font-black italic tracking-tighter uppercase italic leading-none">{editingItem ? "Update" : "Publikasi"} <span className="text-primary italic">Berita.</span></h2>
                 </div>
                 <button onClick={() => setShowModal(false)} className="p-5 bg-zinc-50 text-zinc-400 rounded-[2rem] hover:bg-zinc-100 transition-all shadow-inner"><X className="w-6 h-6" /></button>
              </div>

              {error && (
                <div className="mb-8 p-6 bg-red-50 border border-red-100 rounded-[2.5rem] text-red-600 text-[10px] font-black uppercase tracking-widest italic shadow-inner">
                  Alert: {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-12">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
                   <div className="md:col-span-2 space-y-4">
                      <label className="text-[10px] font-black uppercase tracking-[0.4em] text-zinc-400 italic pl-6 leading-none">Headline Utama</label>
                      <input
                        type="text"
                        className="w-full px-8 py-6 bg-zinc-50 border border-zinc-100 rounded-[2.5rem] focus:ring-4 focus:ring-primary/10 focus:bg-white outline-none transition-all font-black text-sm tracking-tight italic shadow-inner"
                        placeholder="Contoh: Optimalisasi PAD Kota Medan Tahun 2026..."
                        value={form.title}
                        onChange={(e) => setForm({ ...form, title: e.target.value })}
                        required
                      />
                   </div>
                   <div className="space-y-4">
                      <label className="text-[10px] font-black uppercase tracking-[0.4em] text-zinc-400 italic pl-6 leading-none">Grup Kategori</label>
                      <div className="relative">
                        <select
                          className="w-full pl-8 pr-12 py-6 bg-zinc-50 border border-zinc-100 rounded-[2.5rem] focus:ring-4 focus:ring-primary/10 outline-none transition-all font-black text-[10px] uppercase tracking-[0.2em] italic shadow-inner appearance-none cursor-pointer"
                          value={form.category}
                          onChange={(e) => setForm({ ...form, category: e.target.value })}
                        >
                          <option>Pajak</option>
                          <option>Pengumuman</option>
                          <option>Kegiatan</option>
                          <option>Bapenda Update</option>
                        </select>
                        <ChevronDown className="absolute right-8 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400 pointer-events-none" />
                      </div>
                   </div>
                </div>

                <div className="space-y-4">
                   <label className="text-[10px] font-black uppercase tracking-[0.4em] text-zinc-400 italic pl-6 leading-none">Ringkasan Eksekutif</label>
                   <textarea
                     rows={3}
                     className="w-full px-8 py-6 bg-zinc-50 border border-zinc-100 rounded-[2.5rem] focus:ring-4 focus:ring-primary/10 focus:bg-white outline-none transition-all font-medium italic text-sm shadow-inner resize-none"
                     placeholder="Tuliskan intisari berita untuk feed landing page..."
                     value={form.summary}
                     onChange={(e) => setForm({ ...form, summary: e.target.value })}
                     required
                   />
                </div>

                <div className="space-y-4">
                   <label className="text-[10px] font-black uppercase tracking-[0.4em] text-zinc-400 italic pl-6 leading-none">Narasi Berita Lengkap</label>
                   <textarea
                     rows={10}
                     className="w-full px-8 py-8 bg-zinc-50 border border-zinc-100 rounded-[3rem] focus:ring-4 focus:ring-primary/10 focus:bg-white outline-none transition-all font-medium italic text-sm shadow-inner resize-none"
                     placeholder="Tuliskan isi berita secara detail..."
                     value={form.content}
                     onChange={(e) => setForm({ ...form, content: e.target.value })}
                     required
                   />
                </div>

                <div className="flex flex-col sm:flex-row gap-6 pt-6">
                   <button
                    type="submit"
                    disabled={isSubmitting}
                    className="flex-1 h-20 bg-primary text-white font-black rounded-full hover:shadow-2xl hover:shadow-primary/40 transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center gap-4 uppercase text-xs tracking-widest shadow-xl"
                   >
                    {isSubmitting ? <Loader2 className="w-6 h-6 animate-spin" /> : <><Plus className="w-6 h-6" /> {editingItem ? "Konfirmasi Update" : "Broadcast Berita"}</>}
                   </button>
                   <button 
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="h-20 px-12 bg-zinc-50 text-zinc-400 font-black rounded-full hover:bg-zinc-100 transition-all border border-zinc-100 uppercase text-[10px] tracking-widest shadow-inner"
                   >
                     Batalkan
                   </button>
                </div>
              </form>
           </div>
        </div>
      )}
    </div>
  );
}
