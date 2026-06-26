"use client";

import * as React from "react";
import { Session } from "next-auth";
import { useEffect, useState } from "react";
import { 
  Building2, 
  CreditCard, 
  ArrowRight,
  Calculator,
  Megaphone,
  Loader2,
  Clock,
  History,
  FileBadge,
  Receipt,
  FilePenLine,
  MessageSquareWarning,
  Info,
  CheckCircle2,
  XCircle,
  AlertCircle,
  ShieldCheck
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
}

interface Payment {
  id: string;
  amount: number;
  status: string;
  taxObject: { name: string; nop: string };
  createdAt: string;
}

interface TaxSubmission {
  id: string;
  ticketNumber: string;
  type: string;
  title: string;
  status: string;
  createdAt: string;
}

interface Announcement {
  id: string;
  title: string;
  content: string;
  category: string;
  createdAt: string;
  isActive: boolean;
}

export const UserDashboard = ({ session }: { session: Session }) => {
  const [assets, setAssets] = useState<Asset[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [activeTagihan, setActiveTagihan] = useState<Payment[]>([]);
  const [spptCount, setSpptCount] = useState(0);
  const [submissionActiveCount, setSubmissionActiveCount] = useState(0);
  const [submissions, setSubmissions] = useState<TaxSubmission[]>([]);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
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
        
        const activeTagihan = dData.activeTagihan || [];
        setAssets(dData.taxObjects || []);
        setPayments(dData.payments || []);
        setActiveTagihan(activeTagihan);
        setSpptCount(dData.spptCount || 0);
        setSubmissionActiveCount(dData.submissionActiveCount || 0);
        setSubmissions(dData.submissions || []);
        setAnnouncements(Array.isArray(nData) ? nData.filter((n) => n.isActive).slice(0, 3) : []);
      } catch (e) {
        console.error("Dashboard fetch error", e);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const totalPendingAmount = activeTagihan
    .reduce((sum, p) => sum + Number(p.amount), 0);

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0
    }).format(val);
  };

  // Submissions status breakdown
  const processedSubmissions = submissions.filter(s => s.status === "PENDING" || s.status === "IN_PROGRESS");
  const approvedSubmissions = submissions.filter(s => s.status === "APPROVED" || s.status === "RESOLVED");
  const rejectedSubmissions = submissions.filter(s => s.status === "REJECTED" || s.status === "CLOSED");

  if (loading) {
    return (
       <div className="min-h-[60vh] flex items-center justify-center">
          <Loader2 className="w-12 h-12 text-[#1E40AF] animate-spin" />
       </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-6 duration-1000 pb-20 selection:bg-[#1E40AF]/20 text-left bg-[#F8FAFC]">
      
      {/* ── User Welcome Hub ── */}
      <section className="relative bg-white border border-zinc-150 rounded-[2rem] p-8 md:p-12 overflow-hidden group shadow-sm flex flex-col justify-center min-h-[160px]">
         <div className="relative z-10 space-y-4 max-w-2xl">
            <div className="flex items-center gap-2">
               <div className="w-2.5 h-2.5 bg-[#1E40AF] rounded-full animate-pulse" />
               <p className="text-[10px] font-black text-[#1E40AF] uppercase tracking-[0.2em] italic">Portal Wajib Pajak Bapenda</p>
            </div>
            <div className="space-y-2">
               <h1 className="text-3xl md:text-5xl font-black italic tracking-tighter leading-none uppercase text-foreground">
                 Selamat Datang, <br /> 
                 <span className="text-[#1E40AF] italic font-black">{session?.user?.name ?? "Wajib Pajak"}.</span>
               </h1>
               <p className="text-sm text-muted-foreground font-medium border-l-4 border-[#1E40AF]/20 pl-6 leading-relaxed">
                  Kelola pemenuhan kewajiban perpajakan daerah Anda secara mandiri, aman, dan cepat.
               </p>
            </div>
         </div>
      </section>

      {/* ── Ringkasan Utama (Tagihan, Aset, SPPT, Pengajuan) ── */}
      <section className="space-y-4">
         <div className="flex items-center gap-4 pl-2">
            <div className="w-8 h-1 bg-[#1E40AF] rounded-full" />
            <h2 className="text-lg font-black italic tracking-tighter uppercase text-zinc-800">Status Kewajiban & Aset Pajak</h2>
         </div>

         <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Tagihan Aktif */}
            <Card padding="md" className="bg-white border border-zinc-150 group transition-all flex items-center justify-between shadow-sm hover:shadow-md rounded-[1.5rem]">
               <div className="space-y-1">
                  <p className="text-[10px] font-bold uppercase text-zinc-400 tracking-wider">Tagihan Aktif</p>
                  <h4 className="text-xl font-black text-[#EF4444] leading-tight">{formatCurrency(totalPendingAmount)}</h4>
                  <p className="text-[10px] font-medium text-zinc-500">Jumlah Harus Dibayar</p>
               </div>
               <div className="w-12 h-12 rounded-xl flex items-center justify-center border border-zinc-100 text-[#EF4444] bg-[#EF4444]/5">
                  <CreditCard className="w-5 h-5" />
               </div>
            </Card>

            {/* Total Aset Pajak */}
            <Card padding="md" className="bg-white border border-zinc-150 group transition-all flex items-center justify-between shadow-sm hover:shadow-md rounded-[1.5rem]">
               <div className="space-y-1">
                  <p className="text-[10px] font-bold uppercase text-zinc-400 tracking-wider">Total Aset Pajak</p>
                  <h4 className="text-xl font-black text-foreground leading-tight">{assets.length} Objek</h4>
                  <p className="text-[10px] font-medium text-zinc-500">Aset Pajak Terdaftar</p>
               </div>
               <div className="w-12 h-12 rounded-xl flex items-center justify-center border border-zinc-100 text-[#1E40AF] bg-[#1E40AF]/5">
                  <Building2 className="w-5 h-5" />
               </div>
            </Card>

            {/* SPPT Aktif */}
            <Card padding="md" className="bg-white border border-zinc-150 group transition-all flex items-center justify-between shadow-sm hover:shadow-md rounded-[1.5rem]">
               <div className="space-y-1">
                  <p className="text-[10px] font-bold uppercase text-zinc-400 tracking-wider">SPPT Aktif</p>
                  <h4 className="text-xl font-black text-foreground leading-tight">{spptCount} Dokumen</h4>
                  <p className="text-[10px] font-medium text-zinc-500">SPPT Digital Terbit</p>
               </div>
               <div className="w-12 h-12 rounded-xl flex items-center justify-center border border-zinc-100 text-[#10B981] bg-[#10B981]/5">
                  <FileBadge className="w-5 h-5" />
               </div>
            </Card>

            {/* Pengajuan Berjalan */}
            <Card padding="md" className="bg-white border border-zinc-150 group transition-all flex items-center justify-between shadow-sm hover:shadow-md rounded-[1.5rem]">
               <div className="space-y-1">
                  <p className="text-[10px] font-bold uppercase text-zinc-400 tracking-wider">Pengajuan Berjalan</p>
                  <h4 className="text-xl font-black text-foreground leading-tight">{submissionActiveCount} Pengajuan</h4>
                  <p className="text-[10px] font-medium text-zinc-500">Proses Peninjauan Aktif</p>
               </div>
               <div className="w-12 h-12 rounded-xl flex items-center justify-center border border-zinc-100 text-[#F59E0B] bg-[#F59E0B]/5">
                  <FilePenLine className="w-5 h-5" />
               </div>
            </Card>
         </div>
      </section>

      {/* ── Quick Actions ── */}
      <section className="space-y-4">
         <div className="flex items-center gap-4 pl-2">
            <div className="w-8 h-1 bg-[#1E40AF] rounded-full" />
            <h2 className="text-lg font-black italic tracking-tighter uppercase text-zinc-800">Layanan Cepat</h2>
         </div>

         <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Link href="/dashboard/pajak/tagihan">
               <Button variant="secondary" className="w-full flex justify-between items-center px-6" icon={<CreditCard className="w-4 h-4 text-[#1E40AF]" />}>
                  Bayar Pajak
               </Button>
            </Link>
            <Link href="/dashboard/pajak/sppt">
               <Button variant="secondary" className="w-full flex justify-between items-center px-6" icon={<FileBadge className="w-4 h-4 text-[#10B981]" />}>
                  Download SPPT
               </Button>
            </Link>
            <Link href="/dashboard/pengajuan">
               <Button variant="secondary" className="w-full flex justify-between items-center px-6" icon={<FilePenLine className="w-4 h-4 text-[#F59E0B]" />}>
                  Ajukan Permohonan
               </Button>
            </Link>
            <Link href="/dashboard/pengaduan">
               <Button variant="secondary" className="w-full flex justify-between items-center px-6" icon={<MessageSquareWarning className="w-4 h-4 text-[#EF4444]" />}>
                  Buat Pengaduan
               </Button>
            </Link>
         </div>
      </section>

      {/* ── Riwayat Pembayaran & Pengajuan Saya ── */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-8">
         {/* Simple Table Column */}
         <div className="lg:col-span-8 space-y-4 text-left">
            <Card padding="none" className="bg-white border border-zinc-150 rounded-[1.5rem] overflow-hidden shadow-sm">
               <div className="p-6 border-b border-zinc-100 flex items-center justify-between">
                  <h3 className="text-base font-black uppercase text-zinc-800">Riwayat Transaksi</h3>
                  <Link href="/dashboard/pajak/riwayat">
                     <Button variant="outline" size="sm" icon={<ArrowRight className="w-3.5 h-3.5" />}>
                        Lihat Semua
                     </Button>
                  </Link>
               </div>
               <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                     <thead>
                        <tr className="bg-zinc-50 border-b border-zinc-150">
                           <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-wider text-zinc-400">Tanggal</th>
                           <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-wider text-zinc-400">Objek Pajak</th>
                           <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-wider text-zinc-400">Nominal</th>
                           <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-wider text-zinc-400">Status</th>
                        </tr>
                     </thead>
                     <tbody className="divide-y divide-zinc-150">
                        {payments.length === 0 ? (
                           <tr>
                              <td colSpan={4} className="px-6 py-12 text-center text-zinc-400 italic">Belum ada riwayat transaksi.</td>
                           </tr>
                        ) : (
                           payments.slice(0, 5).map((pay) => (
                              <tr key={pay.id} className="hover:bg-zinc-50/50 transition-colors">
                                 <td className="px-6 py-4 text-xs text-zinc-500">
                                    {new Date(pay.createdAt).toLocaleDateString("id-ID", { day: 'numeric', month: 'short', year: 'numeric' })}
                                 </td>
                                 <td className="px-6 py-4 text-xs font-bold text-zinc-800">
                                    {pay.taxObject.name}
                                 </td>
                                 <td className="px-6 py-4 text-xs font-black font-mono text-zinc-800">
                                    {formatCurrency(pay.amount)}
                                 </td>
                                 <td className="px-6 py-4">
                                    <span className={cn(
                                       "px-2.5 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider border",
                                       pay.status === "PAID" 
                                          ? "bg-emerald-50 text-emerald-600 border-emerald-100" 
                                          : "bg-amber-50 text-amber-600 border-amber-100"
                                    )}>{pay.status}</span>
                                 </td>
                              </tr>
                           ))
                        )}
                     </tbody>
                  </table>
               </div>
            </Card>
         </div>

         {/* Submission Status Column */}
         <div className="lg:col-span-4 flex flex-col gap-6">
            <Card padding="md" className="bg-white border border-zinc-150 rounded-[1.5rem] shadow-sm flex flex-col justify-between">
               <div className="space-y-6">
                  <div className="flex items-center gap-2 border-b border-zinc-100 pb-3">
                     <FilePenLine className="w-5 h-5 text-[#1E40AF]" />
                     <h3 className="text-base font-black uppercase text-zinc-800">Pengajuan Saya</h3>
                  </div>

                  <div className="grid grid-cols-1 gap-3">
                     {/* Diproses */}
                     <div className="flex items-center justify-between p-3.5 bg-amber-50/50 border border-amber-100 rounded-xl">
                        <div className="flex items-center gap-2.5">
                           <AlertCircle className="w-4 h-4 text-[#F59E0B]" />
                           <span className="text-[10px] font-black text-zinc-700 uppercase">Sedang Diproses</span>
                        </div>
                        <span className="text-xs font-extrabold text-[#F59E0B] px-2 py-0.5 rounded bg-white border border-amber-200">
                           {processedSubmissions.length}
                        </span>
                     </div>

                     {/* Disetujui */}
                     <div className="flex items-center justify-between p-3.5 bg-emerald-50/50 border border-emerald-100 rounded-xl">
                        <div className="flex items-center gap-2.5">
                           <CheckCircle2 className="w-4 h-4 text-[#10B981]" />
                           <span className="text-[10px] font-black text-zinc-700 uppercase">Disetujui</span>
                        </div>
                        <span className="text-xs font-extrabold text-[#10B981] px-2 py-0.5 rounded bg-white border border-emerald-200">
                           {approvedSubmissions.length}
                        </span>
                     </div>

                     {/* Ditolak */}
                     <div className="flex items-center justify-between p-3.5 bg-red-50/50 border border-red-100 rounded-xl">
                        <div className="flex items-center gap-2.5">
                           <XCircle className="w-4 h-4 text-[#EF4444]" />
                           <span className="text-[10px] font-black text-zinc-700 uppercase">Ditolak</span>
                        </div>
                        <span className="text-xs font-extrabold text-[#EF4444] px-2 py-0.5 rounded bg-white border border-red-200">
                           {rejectedSubmissions.length}
                        </span>
                     </div>
                  </div>
               </div>

               <div className="pt-4 border-t border-zinc-100 mt-4">
                  <Link href="/dashboard/pengajuan" className="w-full">
                     <Button variant="outline" className="w-full flex justify-between items-center text-[9px] uppercase tracking-wider" size="sm" icon={<ArrowRight className="w-3.5 h-3.5" />}>
                        Pantau Status Pengajuan
                     </Button>
                  </Link>
               </div>
            </Card>
         </div>
      </section>

      {/* ── Bulletin Informasi ── */}
      <section className="space-y-4">
         <div className="flex items-center gap-4 pl-2">
            <div className="w-8 h-1 bg-[#1E40AF] rounded-full" />
            <h2 className="text-lg font-black italic tracking-tighter uppercase text-zinc-800">Bulletin Informasi</h2>
         </div>

         <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {announcements.length > 0 ? (
               announcements.map((ann) => (
                  <Card key={ann.id} padding="md" className="bg-white border border-zinc-150 rounded-[1.5rem] shadow-sm flex flex-col justify-between gap-4 transition-all hover:shadow-md">
                     <div className="space-y-2">
                        <div className="flex items-center gap-2 text-[#1E40AF]">
                           <Megaphone className="w-4 h-4" />
                           <span className="text-[9px] font-black uppercase tracking-wider">{ann.category}</span>
                        </div>
                        <h4 className="text-sm font-bold text-zinc-800 leading-snug line-clamp-2">{ann.title}</h4>
                        <p className="text-xs text-zinc-500 line-clamp-3 leading-relaxed">{ann.content}</p>
                     </div>
                     <div className="flex items-center justify-between text-[9px] text-zinc-400 font-bold uppercase border-t border-zinc-100 pt-3 mt-1">
                        <span>{new Date(ann.createdAt).toLocaleDateString("id-ID")}</span>
                        <Link href="/informasi" className="text-[#1E40AF] hover:underline flex items-center gap-0.5">
                           Baca Detail <ArrowRight className="w-3 h-3" />
                        </Link>
                     </div>
                  </Card>
               ))
            ) : (
               <Card padding="md" className="bg-white border border-zinc-150 rounded-[1.5rem] shadow-sm col-span-3 py-10 text-center text-zinc-400 italic">
                  Belum ada pengumuman bulletin terbaru.
               </Card>
            )}
         </div>
      </section>

    </div>
  );
};
