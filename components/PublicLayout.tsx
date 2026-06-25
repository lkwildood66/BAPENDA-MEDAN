"use client";

import Image from "next/image";
import Link from "next/link";
import { 
  Search, ShieldCheck
} from "lucide-react";
import { Button } from "@/components/ui/Button";

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-background mesh-gradient overflow-x-hidden selection:bg-primary/20">
      {/* ── Navigation ── */}
      <nav className="fixed top-0 left-0 right-0 z-50 glass-morphism border-zinc-100 m-4 rounded-[2rem] px-8 py-4 flex items-center justify-between shadow-2xl shadow-primary/5 animate-in fade-in duration-1000">
        <Link href="/" className="flex items-center gap-4 group">
          <div className="w-28 h-12 flex items-center justify-center scale-90 md:scale-110 transition-transform group-hover:scale-100">
             <Image src="/logo.png" alt="BAPENDA" width={106} height={32} className="object-contain" />
          </div>
          <div className="border-l-2 border-zinc-100 pl-4">
            <h1 className="text-sm font-black tracking-tighter leading-none uppercase">BAPENDA <span className="text-primary italic font-black">MEDAN</span></h1>
            <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mt-0.5 italic">Sipada-Kota Medan</p>
          </div>
        </Link>
        
        <div className="hidden md:flex items-center gap-10">
          {["Layanan", "Pajak Daerah", "Informasi", "Panduan"].map(item => (
            <Link 
              key={item} 
              href={`/${item.toLowerCase().replace(/\s+/g, '-')}`} 
              className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground hover:text-primary transition-colors hover:translate-x-1"
            >
              {item}
            </Link>
          ))}
        </div>

        <div className="flex items-center gap-4">
           <Button variant="ghost" size="icon" className="rounded-full hidden md:flex border border-zinc-100"><Search className="w-4 h-4 text-zinc-400" /></Button>
           <Link href="/login">
              <Button variant="primary" size="md" className="btn-premium px-8 rounded-full text-[10px] font-black uppercase tracking-widest h-12 shadow-xl shadow-primary/20">Masuk Portal</Button>
           </Link>
        </div>
      </nav>

      {/* ── Content ── */}
      <main className="pt-32 pb-20">
         {children}
      </main>

      {/* ── Footer ── */}
      <footer className="container mx-auto px-6 py-20 mt-20 border-t border-zinc-100">
         <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
            <div className="md:col-span-2 space-y-8">
               <Link href="/" className="flex items-center gap-4 group">
                  <div className="w-12 h-12 bg-zinc-950 rounded-2xl flex items-center justify-center text-white shadow-2xl group-hover:rotate-6 transition-transform">
                     <ShieldCheck className="w-7 h-7" />
                  </div>
                  <h4 className="text-2xl font-black italic tracking-tighter uppercase leading-none italic">BAPENDA <span className="text-primary italic font-black">MEDAN.</span></h4>
               </Link>
               <p className="text-muted-foreground font-medium max-w-sm italic leading-relaxed border-l-4 border-zinc-100 pl-6 cursor-default">Jalan Kapten Maulana Lubis Nomor 1, Petisah Tengah, Medan Petisah, Kota Medan, Sumatera Utara.</p>
               <div className="flex items-center gap-4 pt-10">
                  <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Integrated Fiscal System</p>
               </div>
            </div>
            <div className="space-y-6">
               <h5 className="text-[10px] font-black uppercase tracking-[0.4em] text-primary italic">Layanan Digital</h5>
               <ul className="space-y-4">
                  {[
                    { l: "Pajak Daerah", h: "/pajak-daerah" },
                    { l: "PPID Digital", h: "/dashboard/ppid" },
                    { l: "E-Pengaduan", h: "/dashboard/pengaduan" },
                    { l: "Hitung Pajak", h: "/dashboard/pajak/hitung" },
                    { l: "Simulasi", h: "/dashboard/pajak/simulasi" }
                  ].map(item => (
                    <li key={item.l}>
                      <Link href={item.h} className="hover:text-primary transition-all hover:translate-x-2 inline-block font-black uppercase text-[9px] tracking-widest text-muted-foreground">{item.l}</Link>
                    </li>
                  ))}
               </ul>
            </div>
            <div className="space-y-6">
               <h5 className="text-[10px] font-black uppercase tracking-[0.4em] text-primary italic">Kontak & Bantuan</h5>
               <ul className="space-y-4">
                  {[
                    { l: "Pusat Bantuan", h: "/informasi" },
                    { l: "Lokasi Kantor", h: "#map" },
                    { l: "WhatsApp Support", h: "https://wa.me/6281234567890" },
                    { l: "Email Resmi", h: "mailto:bapenda@medan.go.id" }
                  ].map(item => (
                    <li key={item.l}>
                      <Link href={item.h} className="hover:text-primary transition-all hover:translate-x-2 inline-block font-black uppercase text-[9px] tracking-widest text-muted-foreground">{item.l}</Link>
                    </li>
                  ))}
               </ul>
            </div>
         </div>
         <div className="mt-20 pt-8 border-t border-zinc-50 flex flex-col md:flex-row justify-between gap-4 opacity-30">
            <p className="text-[9px] font-black uppercase tracking-widest italic leading-none">© 2026 BAPENDA KOTA MEDAN. ALL RIGHTS RESERVED.</p>
            <p className="text-[9px] font-black uppercase tracking-widest italic flex items-center gap-2 leading-none cursor-default hover:text-primary transition-colors">Built with Integrity in Medan Town</p>
         </div>
      </footer>
    </div>
  );
}
