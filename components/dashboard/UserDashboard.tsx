"use client";

import * as React from "react";
import { Session } from "next-auth";
import { useEffect, useState } from "react";
import { 
  Building2, 
  CreditCard, 
  ShieldCheck, 
  ArrowRight,
  Calculator,
  Megaphone,
  Bell,
  Loader2,
  Clock,
  History
} from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import Link from "next/link";
import { cn } from "@/lib/utils";

interface Asset {
  id: string;
  name: string;
  nop: string;
  address: string;
  status: string;
  payments: any[];
}

interface Announcement {
  id: string;
  title: string;
  content: string;
  category: string;
  createdAt: string;
  isActive: boolean;
}

interface Payment {
  id: string;
  amount: number;
  status: string;
  taxObject: { name: string; nop: string };
  createdAt: string;
}

export const UserDashboard = ({ session }: { session: Session }) => {
  const [assets, setAssets] = useState<Asset[]>([]);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [dRes, nRes] = await Promise.all([
          fetch("/api/dashboard"),
          fetch("/api/announcements")
        ]);
        const dData = await dRes.json();
        const nData = await nRes.json();
        
        setAssets(dData.taxObjects || []);
        setPayments(dData.payments || []);
        setAnnouncements((nData as Announcement[]).filter((n) => n.isActive).slice(0, 3) || []);
      } catch (e) {
        console.error("Dashboard fetch error", e);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const totalPending = payments
    .filter(p => p.status === "PENDING")
    .reduce((sum, p) => sum + Number(p.amount), 0);

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0
    }).format(val);
  };

  if (loading) {
    return (
       <div className="min-h-[60vh] flex items-center justify-center">
          <Loader2 className="w-12 h-12 text-primary animate-spin" />
       </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-6 duration-1000 pb-20 selection:bg-primary/20 text-left bg-[#F8FAFC]">
      
      {/* ── User Welcome Hub ── */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-8">
         <div className="lg:col-span-8 relative bg-white border border-zinc-150 rounded-[2rem] p-8 md:p-12 overflow-hidden group shadow-sm flex flex-col justify-center min-h-[180px] max-h-[280px]">
            <div className="relative z-10 space-y-4 max-w-2xl">
               <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 bg-primary rounded-full animate-pulse" />
                  <p className="text-[10px] font-black text-primary uppercase tracking-[0.2em] italic">Portal Wajib Pajak</p>
               </div>
               <div className="space-y-2">
                  <h1 className="text-3xl md:text-5xl font-black italic tracking-tighter leading-none uppercase text-foreground">
                    Selamat Datang, <br /> 
                    <span className="text-primary italic font-black">{session?.user?.name?.split(" ")[0] ?? "Wajib Pajak"}.</span>
                  </h1>
                  <p className="text-sm text-muted-foreground font-medium border-l-4 border-primary/20 pl-6 leading-relaxed">
                     Lihat data pajak, tagihan, dan riwayat pembayaran Anda.
                  </p>
               </div>
            </div>
         </div>

         <div className="lg:col-span-4 grid grid-cols-1 gap-4">
            <Card padding="md" className="bg-primary text-white rounded-[1.5rem] shadow-sm relative overflow-hidden group flex flex-col justify-center min-h-[110px]">
               <div className="relative z-10 space-y-2">
                  <p className="text-[9px] font-bold uppercase tracking-wider opacity-80">Tagihan Aktif</p>
                  <h4 className="text-2xl font-black tracking-tight leading-none">{formatCurrency(totalPending)}</h4>
                  <Link href="/dashboard/pajak/tagihan">
                    <Button variant="ghost" className="h-9 rounded-lg border border-white/20 hover:bg-white hover:text-primary transition-all font-bold uppercase text-[9px] px-4 tracking-wider mt-2">Bayar Tagihan</Button>
                  </Link>
               </div>
            </Card>
            <Card padding="md" className="bg-white border border-zinc-150 rounded-[1.5rem] shadow-sm flex items-center justify-between group transition-all min-h-[110px]">
               <div className="space-y-2">
                  <p className="text-[9px] font-bold uppercase text-zinc-400 tracking-wider">Aset Terdata</p>
                  <h4 className="text-3xl font-black text-foreground leading-none">{assets.length} <span className="text-primary font-sans font-black text-xs">Objek</span></h4>
                  <Link href="/dashboard/pajak/objek" className="inline-block text-[9px] font-bold text-primary uppercase border-b border-primary/20 hover:border-primary transition-all">Kelola Objek Pajak →</Link>
               </div>
               <div className="w-10 h-10 bg-zinc-50 border border-zinc-100 rounded-xl flex items-center justify-center text-zinc-300">
                  <Building2 className="w-5 h-5" />
               </div>
            </Card>
         </div>
      </section>

      {/* ── Transaction Intelligence ── */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-8">
         <div className="lg:col-span-8">
            <Card padding="md" className="bg-white border border-zinc-150 rounded-[1.5rem] overflow-hidden shadow-sm p-6 md:p-10 relative min-h-[400px]">
               <div className="flex items-center justify-between mb-8 border-b border-zinc-50 pb-4">
                  <div className="space-y-1">
                     <h2 className="text-xl font-black uppercase leading-none">Riwayat Pembayaran</h2>
                     <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider leading-none">Daftar pembayaran pajak terverifikasi</p>
                  </div>
                  <History className="w-6 h-6 text-primary/30" />
               </div>
               
               <div className="space-y-4">
                  {payments.length === 0 ? (
                    <div className="py-16 text-center opacity-30 italic font-bold text-zinc-300">Belum ada catatan transaksi.</div>
                  ) : payments.map((pay) => (
                    <div key={pay.id} className="flex items-center justify-between group/pay hover:bg-zinc-50/50 p-4 rounded-xl transition-all border border-transparent hover:border-zinc-50">
                       <div className="flex items-center gap-4">
                          <div className={cn(
                            "w-10 h-10 rounded-xl flex items-center justify-center border shadow-inner transition-all",
                            pay.status === "PAID" ? "bg-emerald-50 text-emerald-600 border-emerald-100" : "bg-amber-50 text-amber-600 border-amber-100"
                          )}>
                             <CreditCard className="w-4 h-4" />
                          </div>
                          <div>
                             <p className="text-[9px] font-bold uppercase tracking-wider text-zinc-400 mb-0.5">{pay.taxObject.name || "Pajak Daerah"}</p>
                             <h4 className="text-base font-black leading-none">{formatCurrency(pay.amount)}</h4>
                          </div>
                       </div>
                       <div className="text-right flex flex-col items-end gap-1">
                          <span className={cn(
                            "px-3 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider border",
                            pay.status === "PAID" ? "bg-emerald-50 text-emerald-600 border-emerald-100" : "bg-amber-50 text-amber-600 border-amber-100"
                          )}>{pay.status}</span>
                          <p className="text-[9px] font-bold text-zinc-300 uppercase"><Clock className="w-3 h-3 inline mr-1" /> {new Date(pay.createdAt).toLocaleDateString()}</p>
                       </div>
                    </div>
                  ))}
               </div>
            </Card>
         </div>

         <div className="lg:col-span-4 flex flex-col gap-6">
            <Card padding="md" className="bg-zinc-50 border border-zinc-150 rounded-[1.5rem] p-6 space-y-6 group">
               <h3 className="text-lg font-black uppercase border-l-4 border-primary pl-4">Layanan Cepat</h3>
               <div className="grid grid-cols-1 gap-3">
                  <QuickLink href="/dashboard/pajak/hitung" label="Kalkulator Pajak" icon={Calculator} />
                  <QuickLink href="/dashboard/ppid" label="Informasi Publik" icon={Bell} />
                  <QuickLink href="/dashboard/pengaduan" label="Pengaduan" icon={Megaphone} />
                  <QuickLink href="/dashboard/pajak/riwayat" label="Riwayat Pembayaran" icon={Clock} />
               </div>
            </Card>

            <Card padding="md" className="bg-white border border-zinc-150 rounded-[1.5rem] p-6 shadow-sm space-y-6 group">
               <div className="flex items-center gap-3 text-primary">
                  <Megaphone className="w-5 h-5" />
                  <h3 className="text-sm font-black uppercase">Bulletin Informasi</h3>
               </div>
               <div className="space-y-4">
                  {announcements.length > 0 ? announcements.map(ann => (
                     <div key={ann.id} className="space-y-1 border-l-2 border-zinc-100 pl-3 hover:border-primary transition-colors">
                        <p className="text-[9px] font-bold uppercase text-zinc-400">{ann.category}</p>
                        <h5 className="text-xs font-bold text-zinc-800 line-clamp-1">{ann.title}</h5>
                     </div>
                  )) : (
                    <p className="text-xs text-zinc-400 italic font-medium">Belum ada pengumuman terbaru.</p>
                  )}
               </div>
            </Card>
         </div>
      </section>
    </div>
  );
};

function QuickLink({ href, label, icon: Icon }: { href: string; label: string; icon: React.ElementType }) {
   return (
      <Link href={href} className="flex items-center justify-between p-4 bg-white border border-zinc-100 rounded-xl hover:bg-primary group/link transition-all shadow-sm">
         <div className="flex items-center gap-3">
            <Icon className="w-4 h-4 text-zinc-400 group-hover/link:text-white transition-colors" />
            <span className="text-[10px] font-bold uppercase tracking-wider group-hover/link:text-white transition-colors">{label}</span>
         </div>
         <ArrowRight className="w-3.5 h-3.5 text-zinc-300 group-hover/link:text-white group-hover/link:translate-x-1 transition-all" />
      </Link>
   );
}
