"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { 
  ArrowRight, CreditCard, 
  Search, Globe, Zap, 
  Building2,
  Loader2,
  Calculator,
  Bell,
  Megaphone,
  MapPin,
  ShieldCheck,
  X
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { useToast } from "@/lib/hooks/use-toast";
import { cn } from "@/lib/utils";
import dynamic from "next/dynamic";

const MapVisualization = dynamic(() => import("@/components/landing/MapVisualization").then(m => m.MapVisualization), { ssr: false });

interface NewsItem {
  id: string;
  title: string;
  summary: string;
  category: string;
  createdAt: string;
  slug: string;
}

export default function Home() {
  const { data: session } = useSession();
  const router = useRouter();
  const { toast } = useToast();
  const [news, setNews] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  
  const [nopQuery, setNopQuery] = useState("");
  const [checkingNop, setCheckingNop] = useState(false);
  const [nopResult, setNopResult] = useState<any>(null);

  useEffect(() => {
    fetch(window.location.origin + "/api/cms/news")
      .then(async r => {
        const contentType = r.headers.get("content-type");
        if (!r.ok || !contentType || !contentType.includes("application/json")) {
           return [];
        }
        return r.json();
      })
      .then(d => {
        const newsItems = Array.isArray(d) ? d : [];
        setNews(newsItems.slice(0, 3));
      })
      .catch(() => setNews([]))
      .finally(() => setLoading(false));
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery) return;
    
    if (session) {
      router.push(`/dashboard/pajak/objek?search=${searchQuery}`);
    } else {
      toast("Pencarian NOP", "Silakan masuk ke portal untuk melakukan pencarian NOP secara detail.", "info");
      router.push("/login");
    }
  };

  const handleCheckNop = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nopQuery) {
      toast("Input NOP Kosong", "Silakan masukkan NOP terlebih dahulu.", "warning");
      return;
    }
    setCheckingNop(true);
    setNopResult(null);
    try {
      const res = await fetch(`/api/tax/check?nop=${encodeURIComponent(nopQuery)}`);
      const data = await res.json();
      if (res.ok && data.success) {
        setNopResult(data.data);
        toast("Pemeriksaan Sukses", "Data NOP ditemukan.", "success");
      } else {
        toast("NOP Tidak Ditemukan", data.message || "Pastikan NOP yang Anda masukkan benar.", "error");
      }
    } catch {
      toast("Error", "Gagal memeriksa NOP. Silakan coba lagi.", "error");
    } finally {
      setCheckingNop(false);
    }
  };

  const portalLink = session ? "/dashboard" : "/login";

  return (
    <div className="min-h-screen bg-slate-50/50 overflow-x-hidden selection:bg-primary/20 text-left">
      
      {/* ── Navigation ── */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white border border-zinc-200/80 m-4 md:m-6 rounded-2xl px-6 md:px-10 py-3.5 flex items-center justify-between shadow-sm">
        <Link href="/" className="flex items-center gap-3 group">
          <div className="w-28 h-10 bg-white rounded-lg flex items-center justify-center border border-zinc-200">
             <Image src="/logo.png" alt="Logo" width={106} height={32} className="object-contain" />
          </div>
          <div>
            <h1 className="text-sm font-bold tracking-tight leading-none text-foreground uppercase">BAPENDA <span className="text-primary">MEDAN</span></h1>
            <p className="text-[9px] font-semibold text-muted-foreground uppercase tracking-widest mt-1">Layanan Pajak Daerah</p>
          </div>
        </Link>
        
        <div className="hidden lg:flex items-center gap-8">
          {[
            { label: "Layanan", href: "/layanan" },
            { label: "Pajak Daerah", href: "/pajak-daerah" },
            { label: "Berita", href: "/informasi" },
            { label: "Panduan", href: "/panduan" }
          ].map(item => (
            <Link 
              key={item.label} 
              href={item.href} 
              className="text-xs font-semibold uppercase tracking-wider text-muted-foreground hover:text-primary transition-all"
            >
              {item.label}
            </Link>
          ))}
        </div>

        <div className="flex items-center gap-4">
           <form onSubmit={handleSearch} className="hidden xl:flex items-center bg-zinc-50 rounded-xl px-4 py-2 border border-zinc-200 focus-within:bg-white focus-within:border-primary/50 transition-all">
              <Search className="w-3.5 h-3.5 text-zinc-400" />
              <input 
                type="text" 
                placeholder="Cari NOP..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-transparent border-0 outline-none px-2.5 text-xs font-medium w-28 focus:w-40 transition-all" 
              />
           </form>
           <Link href={portalLink}>
              <Button variant="secondary" className="px-6 rounded-xl text-xs font-semibold uppercase tracking-wider h-10 bg-primary text-white hover:bg-primary/90">
                {session ? "Dashboard" : "Masuk Portal"}
              </Button>
           </Link>
        </div>
      </nav>

      {/* ── Hero Section ── */}
      <section className="container mx-auto px-6 pt-40 pb-16 relative">
         <div className="max-w-4xl space-y-6 animate-in fade-in duration-500">
            <div className="inline-flex items-center gap-2 bg-white border border-zinc-200 p-1 pr-3 rounded-full shadow-sm">
               <span className="bg-primary text-white text-[9px] font-semibold px-2.5 py-0.5 rounded-full uppercase tracking-wider">Update</span>
               <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Pelayanan Pajak 2026 Lebih Cepat & Mudah</p>
            </div>
            
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight leading-none text-foreground uppercase">
               Portal Pajak Daerah <br />
               <span className="text-primary inline-block">Kota Medan.</span>
            </h2>

            <p className="text-lg md:text-xl text-muted-foreground font-medium max-w-2xl leading-relaxed border-l-4 border-primary pl-6">
               Integrasi pendapatan daerah dalam satu ekosistem digital yang cerdas, transparan, dan akuntabel.
            </p>

            <div className="flex flex-wrap gap-4 pt-4">
               <Link href="#cek-pajak">
                  <Button className="px-6 h-12 rounded-xl font-bold uppercase text-xs tracking-wider bg-primary text-white flex items-center gap-2 shadow-sm hover:bg-primary/95 transition-all">
                     Cek Tagihan Anda <ArrowRight className="w-4 h-4" />
                  </Button>
               </Link>
               <Link href="/login">
                  <Button variant="outline" className="px-6 h-12 rounded-xl border-zinc-200 bg-white font-bold uppercase text-xs tracking-wider shadow-sm hover:bg-zinc-50 transition-all">
                     Bayar Sekarang <CreditCard className="ml-2 w-4 h-4 text-primary" />
                  </Button>
               </Link>
            </div>
         </div>
      </section>

      {/* ── Quick Access Hub ── */}
      <section className="container mx-auto px-6 -mt-10 relative z-30">
         <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
               { label: "Kalkulator Pajak", icon: Calculator, href: "/dashboard/pajak/hitung", color: "text-blue-600", bg: "bg-blue-50" },
               { label: "Layanan PPID", icon: Bell, href: "/dashboard/ppid", color: "text-emerald-600", bg: "bg-emerald-50" },
               { label: "E-Pengaduan", icon: Megaphone, href: "/dashboard/pengaduan", color: "text-rose-600", bg: "bg-rose-50" },
               { label: "Cari Lokasi", icon: MapPin, href: "#map", color: "text-amber-600", bg: "bg-amber-50" }
            ].map((item, i) => (
               <Link key={i} href={item.href}>
                  <Card className="group p-6 bg-white border border-zinc-200 hover:border-primary/50 hover:shadow-md transition-all rounded-xl flex flex-col items-center justify-center gap-4 text-center">
                     <div className={cn("w-12 h-12 rounded-xl flex items-center justify-center", item.bg, item.color)}>
                        <item.icon className="w-6 h-6" />
                     </div>
                     <span className="text-xs font-bold uppercase tracking-wider text-zinc-600 group-hover:text-primary transition-colors leading-tight">{item.label}</span>
                  </Card>
               </Link>
            ))}
         </div>
      </section>

      {/* ── Quick Tax Lookup Widget ── */}
      <section id="cek-pajak" className="container mx-auto px-6 py-16">
         <Card className="bg-white border border-zinc-200 rounded-2xl overflow-hidden p-0 shadow-sm">
            <div className="flex flex-col lg:flex-row">
               <div className="lg:w-1/3 bg-primary p-8 lg:p-12 text-white space-y-4">
                  <h2 className="text-2xl md:text-3xl font-bold tracking-tight uppercase leading-none">Cek Pajak Cepat</h2>
                  <p className="text-sm text-blue-100 leading-relaxed">Masukkan Nomor Objek Pajak (NOP) Anda untuk melihat status tagihan aktif secara instan.</p>
               </div>
               <div className="flex-1 p-8 lg:p-12 flex flex-col justify-center">
                  <form onSubmit={handleCheckNop} className="flex flex-col md:flex-row gap-4 w-full">
                     <div className="flex-1 relative">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                        <input 
                           type="text" 
                           placeholder="Masukkan 18 Digit NOP Anda..." 
                           value={nopQuery}
                           onChange={(e) => setNopQuery(e.target.value)}
                           className="w-full pl-11 pr-4 h-12 bg-zinc-50 border border-zinc-200 rounded-xl focus:bg-white focus:border-primary/50 outline-none transition-all text-xs font-semibold uppercase tracking-wider"
                        />
                     </div>
                     <Button type="submit" disabled={checkingNop} className="h-12 px-8 rounded-xl bg-primary text-white hover:bg-primary/95 font-bold uppercase text-xs tracking-wider flex items-center justify-center gap-2">
                        {checkingNop ? <Loader2 className="w-4 h-4 animate-spin" /> : "Periksa Tagihan"}
                     </Button>
                  </form>
                  {nopResult && (
                      <div className="mt-8 p-6 bg-slate-50 border border-zinc-200 rounded-xl space-y-4 text-left animate-in fade-in slide-in-from-top-2 duration-300">
                         <div className="flex items-center justify-between border-b border-zinc-200 pb-3">
                            <h4 className="text-sm font-bold uppercase tracking-wider text-zinc-700">Detail Objek Pajak</h4>
                            <button onClick={() => setNopResult(null)} className="text-zinc-400 hover:text-zinc-600">
                               <X className="w-4 h-4" />
                            </button>
                         </div>
                         <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                            <div>
                               <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider">Nomor Objek Pajak (NOP)</p>
                               <p className="font-bold text-zinc-800">{nopResult.objectInfo.nop}</p>
                            </div>
                            <div>
                               <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider">Nama Wajib Pajak</p>
                               <p className="font-bold text-zinc-800">{nopResult.objectInfo.name}</p>
                            </div>
                            <div className="md:col-span-2">
                               <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider">Alamat Objek Pajak</p>
                               <p className="font-semibold text-zinc-700">{nopResult.objectInfo.address}</p>
                            </div>
                            <div>
                               <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider">Status Pembayaran</p>
                               <span className={cn(
                                  "inline-block px-2.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider mt-1 border",
                                  nopResult.pendingAmount > 0 
                                     ? "bg-rose-50 text-rose-600 border-rose-100" 
                                     : "bg-emerald-50 text-emerald-600 border-emerald-100"
                               )}>
                                  {nopResult.pendingAmount > 0 ? "Belum Lunas" : "Lunas"}
                               </span>
                            </div>
                            <div>
                               <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider">Jumlah Tunggakan Pajak</p>
                               <p className="font-bold text-zinc-800 text-sm mt-0.5">
                                  {new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(nopResult.pendingAmount)}
                               </p>
                            </div>
                         </div>
                      </div>
                   )}
                  <div className="mt-6 flex items-center gap-6 opacity-60">
                     <div className="flex items-center gap-2">
                        <ShieldCheck className="w-4 h-4 text-emerald-600" />
                        <span className="text-[10px] font-bold uppercase tracking-wider">Data Terenkripsi</span>
                     </div>
                     <div className="flex items-center gap-2">
                        <Zap className="w-4 h-4 text-primary" />
                        <span className="text-[10px] font-bold uppercase tracking-wider">Hasil Seketika</span>
                     </div>
                  </div>
               </div>
            </div>
         </Card>
      </section>

      {/* ── Latest News Section (Dynamic CMS) ── */}
      <section className="container mx-auto px-6 py-16 bg-zinc-50 border border-zinc-200/50 rounded-2xl">
         <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
            <div className="space-y-2">
               <div className="flex items-center gap-2 text-primary">
                  <div className="w-6 h-0.5 bg-primary rounded-full" />
                  <p className="text-[10px] font-bold uppercase tracking-widest leading-none">Informasi Terbaru</p>
               </div>
               <h2 className="text-3xl font-bold tracking-tight uppercase">Update & Berita Daerah</h2>
            </div>
            <Link href="/informasi">
               <Button variant="ghost" className="gap-1 font-bold uppercase text-[10px] tracking-wider border-b border-zinc-200 hover:border-primary transition-all">Lihat Semua Berita →</Button>
            </Link>
         </div>

         {loading ? (
            <div className="flex justify-center p-12"><Loader2 className="w-8 h-8 text-primary animate-spin" /></div>
         ) : news.length === 0 ? (
            <div className="p-12 text-center opacity-40 font-semibold uppercase tracking-wider text-xs">Belum Ada Berita Terbaru Terpublikasi.</div>
         ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
               {news.map((item) => (
                  <Card key={item.id} className="group rounded-xl bg-white border border-zinc-200 hover:border-primary/30 transition-all p-6 flex flex-col justify-between shadow-sm min-h-[380px]">
                     <div className="space-y-4">
                        <div className="flex items-center justify-between text-[9px] font-bold uppercase tracking-wider text-zinc-400">
                           <span className="px-2 py-0.5 bg-primary/10 text-primary rounded border border-primary/10">{item.category}</span>
                           <span>{new Date(item.createdAt).toLocaleDateString()}</span>
                        </div>
                        <h4 className="text-lg font-bold tracking-tight text-foreground uppercase group-hover:text-primary transition-all">{item.title}</h4>
                        <p className="text-xs text-muted-foreground leading-relaxed line-clamp-4">&quot;{item.summary}&quot;</p>
                     </div>
                     <Link href={`/informasi`} className="w-full pt-4">
                        <Button variant="outline" className="w-full h-10 rounded-xl font-bold uppercase text-[10px] tracking-wider border-zinc-200 hover:bg-primary hover:text-white transition-all flex items-center justify-center gap-2">
                           Baca Selengkapnya <ArrowRight className="w-3.5 h-3.5" />
                        </Button>
                     </Link>
                  </Card>
               ))}
            </div>
         )}
      </section>

      {/* ── Services Section ── */}
      <section className="container mx-auto px-6 py-20 space-y-12">
         <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div className="space-y-2">
               <div className="flex items-center gap-2 text-primary">
                  <div className="w-6 h-0.5 bg-primary rounded-full" />
                  <p className="text-[10px] font-bold uppercase tracking-widest leading-none">Layanan Unggulan</p>
               </div>
               <h2 className="text-3xl font-bold tracking-tight uppercase">Akses Layanan Pajak Mudah</h2>
            </div>
            <Link href="/layanan">
               <Button variant="ghost" className="gap-2 font-bold uppercase text-[10px] tracking-wider h-10 px-4 border border-zinc-200 hover:border-primary hover:bg-white transition-all rounded-xl">
                  Katalog Layanan <ArrowRight className="w-3.5 h-3.5 text-primary" />
               </Button>
            </Link>
         </div>

         <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
               { title: "Manajemen PBB-P2", desc: "Cek tagihan, cetak SPPT digital, dan riwayat pembayaran PBB dalam satu portal identitas.", icon: Building2, href: "/dashboard/pajak/objek" },
               { title: "Sistem BPHTB Online", desc: "Validasi bea perolehan hak atas tanah dan bangunan yang terintegrasi langsung dengan BPN.", icon: CreditCard, href: "/dashboard/pajak/tagihan" },
               { title: "Monitoring Pajak Daerah", desc: "Pelaporan omzet pajak hotel, restoran, hiburan, dan reklame secara real-time dan transparan.", icon: Globe, href: "/dashboard" },
            ].map((s, i) => (
               <Card key={i} className="group p-8 bg-white border border-zinc-200 hover:border-primary/30 transition-all flex flex-col justify-between shadow-sm rounded-xl min-h-[320px]">
                  <div className="space-y-6">
                     <div className="w-12 h-12 bg-zinc-50 rounded-xl flex items-center justify-center text-primary border border-zinc-200 group-hover:bg-white group-hover:shadow-sm transition-all duration-300">
                        <s.icon className="w-6 h-6" />
                     </div>
                     <div className="space-y-2">
                        <h4 className="text-lg font-bold tracking-tight uppercase text-foreground group-hover:text-primary transition-colors">{s.title}</h4>
                        <p className="text-xs text-muted-foreground leading-relaxed">{s.desc}</p>
                     </div>
                  </div>
                  
                  <Link href={session ? s.href : "/login"} className="w-fit pt-4">
                     <Button size="icon" className="w-10 h-10 rounded-xl bg-primary text-white hover:bg-primary/95 transition-all">
                        <ArrowRight className="w-5 h-5" />
                     </Button>
                  </Link>
               </Card>
            ))}
         </div>
      </section>

      {/* ── Map Section ── */}
      <section id="map" className="container mx-auto px-6 py-16 scroll-mt-24">
         <div className="space-y-6 mb-10">
            <div className="flex items-center gap-2 text-primary">
               <div className="w-6 h-0.5 bg-primary rounded-full" />
               <p className="text-[10px] font-bold uppercase tracking-widest leading-none">Peta Sebaran</p>
            </div>
            <h2 className="text-3xl font-bold tracking-tight uppercase">Lokasi & Zona Pajak Daerah</h2>
            <p className="text-sm text-muted-foreground max-w-2xl leading-relaxed">Visualisasi sebaran objek pajak, zona nilai tanah (ZNT), dan properti pasar di wilayah Kota Medan.</p>
         </div>
         <MapVisualization />
      </section>

      {/* ── Call to Action Section ── */}
      <section className="container mx-auto px-6 py-16">
         <div className="bg-white border border-zinc-200 rounded-2xl p-8 md:p-12 shadow-sm text-left relative overflow-hidden">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
               <div className="space-y-6">
                   <div className="w-28 h-12 bg-white rounded-xl flex items-center justify-center border border-zinc-200 shadow-sm">
                      <Image src="/logo.png" alt="Logo" width={106} height={32} className="object-contain" />
                   </div>
                  <h2 className="text-3xl font-bold tracking-tight uppercase">Keamanan Data Terjamin</h2>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                     Protokol keamanan standar industri serta enkripsi data memastikan seluruh data transaksi dan identitas wajib pajak terlindungi sepenuhnya secara digital.
                  </p>
                  <Link href={portalLink} className="inline-block">
                    <Button className="bg-primary text-white hover:bg-primary/95 px-6 rounded-xl h-11 text-xs font-semibold uppercase tracking-wider flex items-center gap-2">Mulai Akses Sekarang <ArrowRight className="w-4 h-4" /></Button>
                  </Link>
               </div>
               <div className="relative flex justify-center lg:justify-end">
                  <div className="w-64 h-64 bg-slate-50 border border-zinc-200 shadow-sm rounded-xl p-8 flex flex-col items-center justify-center gap-4">
                      <Image src="/logo.png" alt="Logo Medan" width={200} height={60} className="object-contain" />
                     <div className="text-center space-y-1">
                        <p className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">Sistem Informasi</p>
                        <p className="text-[10px] font-bold uppercase text-primary tracking-wider">Pendapatan Daerah</p>
                     </div>
                  </div>
               </div>
            </div>
         </div>
      </section>

      {/* ── Footer ── */}
      <footer className="container mx-auto px-6 py-12 border-t border-zinc-200 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 text-left text-zinc-500">
         <div className="space-y-1">
            <h4 className="text-sm font-bold uppercase tracking-tight text-foreground">Bapenda Kota Medan</h4>
            <p className="text-[9px] font-semibold uppercase tracking-widest text-zinc-400">Integrated Fiscal System</p>
         </div>
         <div className="flex flex-wrap gap-6 md:gap-8">
            {[
              { label: "Hubungi Kami", href: "/informasi" },
              { label: "Ketentuan Layanan", href: "/panduan" },
              { label: "Kebijakan Privasi", href: "/panduan" },
              { label: "PPID", href: "/dashboard/ppid" }
            ].map(l => (
              <Link key={l.label} href={l.href} className="text-[10px] font-bold uppercase tracking-wider hover:text-primary transition-colors">
                {l.label}
              </Link>
            ))}
         </div>
         <p className="text-[10px] font-semibold uppercase tracking-wider text-zinc-400">© 2026 Kota Medan. Berkah & Berwibawa.</p>
      </footer>
    </div>
  );
}

