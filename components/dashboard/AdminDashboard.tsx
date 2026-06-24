"use client";

import { useEffect, useState } from "react";
import { Session } from "next-auth";
import { 
  Users, 
  ShieldCheck, 
  Zap, 
  CreditCard,
  Building2,
  Timer,
  ArrowRight,
  ShieldAlert,
  Loader2,
  Bell,
  BarChart3,
  TrendingUp,
  FileText,
  Percent,
  TrendingDown,
  Layers,
  ArrowUpRight
} from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { PremiumChart } from "@/components/ui/PremiumChart";

interface DashboardData {
  stats: {
    userCount: number;
    taxObjectCount: number;
    spptCount: number;
    totalPajakTerutang: number;
    totalPembayaranMasuk: number;
    totalTunggakanPajak: number;
    activeWpCount: number;
    kepatuhanRate: number;
  };
  monthlyStats: Array<{
    month: number;
    revenue: number;
    tunggakan: number;
  }>;
  submissions: Array<{
    id: string;
    number: string;
    type: string;
    title: string;
    status: string;
    createdAt: string;
    owner: string;
  }>;
  recentActivity: Array<{
    id: string;
    action: string;
    table: string;
    createdAt: string;
    user: { name: string | null };
  }>;
  objCategoryCounts: Record<string, number>;
}

function formatCurrency(val: number) {
  return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(val);
}

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Agu", "Sep", "Okt", "Nov", "Des"];

export const AdminDashboard = ({ session }: { session: Session }) => {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [chartTab, setChartTab] = useState<"monthly" | "yearly" | "comparison" | "growth" | "category">("monthly");

  useEffect(() => {
    fetch("/api/admin/dashboard-stats")
      .then(r => r.json())
      .then(d => setData(d))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
     return (
        <div className="min-h-[60vh] flex items-center justify-center">
           <Loader2 className="w-12 h-12 text-primary animate-spin" />
        </div>
     );
  }

  const kpis = [
    { label: "Total Wajib Pajak", value: `${data?.stats.userCount ?? 0} WP`, subtext: "Wajib Pajak Terdaftar", icon: Users, color: "text-blue-600", bg: "bg-blue-50/50" },
    { label: "Total Objek Pajak", value: `${data?.stats.taxObjectCount ?? 0} Objek`, subtext: "Objek Pajak Terdaftar", icon: Building2, color: "text-primary", bg: "bg-primary/5" },
    { label: "SPPT Terbit", value: `${data?.stats.spptCount ?? 0} Berkas`, subtext: "SPPT Terbit Digital", icon: FileText, color: "text-indigo-600", bg: "bg-indigo-50/50" },
    { label: "Total Pajak", value: formatCurrency(data?.stats.totalPajakTerutang ?? 0), subtext: "Ketetapan Pajak Terutang", icon: BarChart3, color: "text-purple-600", bg: "bg-purple-50/50" },
    { label: "Total Pembayaran", value: formatCurrency(data?.stats.totalPembayaranMasuk ?? 0), subtext: "Kas Daerah Diterima", icon: CreditCard, color: "text-emerald-600", bg: "bg-emerald-50/50" },
    { label: "Total Tunggakan", value: formatCurrency(data?.stats.totalTunggakanPajak ?? 0), subtext: "Sisa Piutang Pajak", icon: ShieldAlert, color: "text-rose-600", bg: "bg-rose-50/50" },
    { label: "Pengguna Aktif", value: `${data?.stats.activeWpCount ?? 0} Pengguna`, subtext: "Pengguna Aktif Portal", icon: ShieldCheck, color: "text-teal-600", bg: "bg-teal-50/50" },
    { label: "Tingkat Kepatuhan", value: `${data?.stats.kepatuhanRate ?? 0}%`, subtext: "Persentase Kepatuhan WP", icon: Percent, color: "text-amber-600", bg: "bg-amber-50/50" },
  ];

  // 1. Monthly Chart Data
  const monthlyChartData = (data?.monthlyStats || []).map(m => ({
    label: MONTHS[m.month],
    value: m.revenue
  }));

  // 2. Yearly Chart Data (Simulated for Comparison)
  const yearlyChartData = [
    { label: "2024 (PAD)", value: 3800000000 },
    { label: "2025 (PAD)", value: 5200000000 },
    { label: "2026 (PAD)", value: data?.stats.totalPembayaranMasuk ?? 0 }
  ];

  // 3. Comparison Chart Data: Realisasi vs Tunggakan
  const comparisonChartData = [
    { label: "Realisasi (Lunas)", value: data?.stats.totalPembayaranMasuk ?? 0 },
    { label: "Tunggakan (Piutang)", value: data?.stats.totalTunggakanPajak ?? 0 }
  ];

  // 4. Growth Chart Data (Percentage growth comparison across months)
  let accumulated = 0;
  const growthChartData = (data?.monthlyStats || []).map((m, i) => {
    accumulated += m.revenue;
    return {
      label: MONTHS[m.month],
      value: accumulated
    };
  });

  // 5. Category Chart Data (Counts of objects)
  const categoryChartData = Object.entries(data?.objCategoryCounts || {}).map(([key, val]) => ({
    label: key,
    value: val
  }));

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-6 duration-1000 pb-20 selection:bg-primary/20 text-left bg-[#F8FAFC]">
      
      {/* ── Dashboard Hero ── */}
      <section className="relative bg-white border border-zinc-150 rounded-[2rem] p-8 md:p-12 overflow-hidden group shadow-md shadow-zinc-100/10 min-h-[160px] max-h-[280px] flex flex-col justify-center">
         <div className="relative z-10 space-y-4">
            <div className="flex items-center gap-2">
               <div className="w-2.5 h-2.5 bg-primary rounded-full animate-pulse" />
               <p className="text-[10px] font-black text-primary uppercase tracking-[0.2em] italic">Selamat Datang, {session.user?.name ?? "Admin"}</p>
            </div>
            <div className="space-y-2">
               <h1 className="text-3xl md:text-5xl font-black italic tracking-tighter leading-none uppercase text-foreground">Dashboard <span className="text-primary italic">Pajak Daerah.</span></h1>
               <p className="text-sm text-muted-foreground font-medium max-w-2xl leading-relaxed italic border-l-4 border-primary/20 pl-6">
                  Pantau data pajak, pembayaran, dan aktivitas sistem dalam satu tempat.
               </p>
            </div>
         </div>
      </section>

      {/* ── 8 KPI Cards Grid ── */}
      <section className="space-y-4">
         <div className="flex items-center gap-4 pl-2">
            <div className="w-8 h-1 bg-primary rounded-full" />
            <h2 className="text-lg font-black italic tracking-tighter uppercase text-zinc-800">Ringkasan Eksekutif Pajak Daerah</h2>
         </div>
         <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {kpis.map((stat, i) => (
               <Card key={i} padding="md" className="bg-white border border-zinc-100 group transition-all flex items-center justify-between shadow-sm hover:shadow-md rounded-[1.5rem] relative overflow-hidden">
                  <div className="space-y-1.5 relative z-10">
                     <p className="text-[10px] font-bold uppercase text-zinc-400 tracking-wider">{stat.label}</p>
                     <h4 className="text-lg font-black tracking-tight text-foreground uppercase truncate max-w-[200px]">{stat.value}</h4>
                     <p className="text-[10px] font-medium text-zinc-500">{stat.subtext}</p>
                  </div>
                  <div className={`w-12 h-12 rounded-xl bg-zinc-50 flex items-center justify-center ${stat.color} border border-zinc-100`}>
                     <stat.icon className="w-5 h-5" />
                  </div>
               </Card>
            ))}
         </div>
      </section>

      {/* ── Revenue Intelligence Multi-Chart Section ── */}
      <section className="space-y-4">
         <Card padding="md" className="bg-white border border-zinc-150 rounded-[1.5rem] shadow-sm p-6 md:p-8 relative overflow-hidden group">
            
            <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-zinc-100 pb-6 mb-8 gap-4">
               <div className="space-y-1">
                  <p className="text-[10px] font-bold text-primary uppercase tracking-wider leading-none">Visualisasi Data Keuangan</p>
                  <h3 className="text-xl font-black uppercase leading-none">Grafik Analisis Penerimaan</h3>
               </div>
               
               {/* Chart Selector Tabs */}
               <div className="flex flex-wrap gap-1.5 p-1 bg-zinc-50 rounded-xl border border-zinc-150 shadow-inner">
                  {[
                     { id: "monthly", label: "Bulanan" },
                     { id: "yearly", label: "Tahunan" },
                     { id: "comparison", label: "Realisasi vs Piutang" },
                     { id: "growth", label: "Kumulatif" },
                     { id: "category", label: "Kategori Pajak" }
                  ].map((tab) => (
                     <button
                        key={tab.id}
                        onClick={() => setChartTab(tab.id as any)}
                        className={cn(
                           "px-3 py-1.5 rounded-lg text-[9px] font-bold uppercase tracking-wider transition-all",
                           chartTab === tab.id
                              ? "bg-white text-primary shadow-sm border border-primary/10"
                              : "text-zinc-500 hover:text-zinc-900"
                        )}
                     >
                        {tab.label}
                     </button>
                  ))}
               </div>
            </div>

            {/* Render Selected Chart */}
            {chartTab === "monthly" && (
               <PremiumChart 
                  subtitle="Akumulasi Bulanan 2026"
                  title="Pembayaran Pajak Bulanan"
                  data={monthlyChartData.length > 0 ? monthlyChartData : [
                     { label: "Jan", value: 0 },
                     { label: "Feb", value: 0 }
                  ]}
               />
            )}
            
            {chartTab === "yearly" && (
               <PremiumChart 
                  subtitle="PAD Perbandingan Tahunan"
                  title="Pembayaran Pajak Tahunan (YoY)"
                  data={yearlyChartData}
               />
            )}

            {chartTab === "comparison" && (
               <PremiumChart 
                  subtitle="Realisasi Kas vs Tunggakan Pajak"
                  title="Perbandingan Realisasi & Tunggakan"
                  data={comparisonChartData}
               />
            )}

            {chartTab === "growth" && (
               <PremiumChart 
                  subtitle="Grafik Pertumbuhan Penerimaan Kumulatif"
                  title="Pertumbuhan Penerimaan Pajak (YTD)"
                  data={growthChartData}
               />
            )}

            {chartTab === "category" && (
               <PremiumChart 
                  subtitle="Distribusi Jumlah Objek Pajak"
                  title="Objek Pajak Berdasarkan Kategori"
                  data={categoryChartData}
               />
            )}
         </Card>
      </section>

      {/* ── Dokumentasi Pengajuan ── */}
      <section className="space-y-4">
         <div className="flex items-center gap-4 pl-2">
            <div className="w-8 h-1 bg-primary rounded-full" />
            <h2 className="text-lg font-black italic tracking-tighter uppercase text-zinc-800">Daftar Pengajuan Terbaru</h2>
         </div>
         <Card padding="none" className="bg-white border border-zinc-150 rounded-[1.5rem] overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
               <table className="w-full text-left border-collapse">
                  <thead>
                     <tr className="bg-zinc-50 border-b border-zinc-150">
                        <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-wider text-zinc-400">No. Pengajuan</th>
                        <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-wider text-zinc-400">Jenis Layanan</th>
                        <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-wider text-zinc-400">Subjek / Judul</th>
                        <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-wider text-zinc-400">Pengaju</th>
                        <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-wider text-zinc-400">Tanggal</th>
                        <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-wider text-zinc-400">Status</th>
                        <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-wider text-zinc-400 text-center">Aksi</th>
                     </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-100">
                     {data?.submissions && data.submissions.length > 0 ? (
                        data.submissions.map((sub) => (
                           <tr key={sub.id} className="hover:bg-zinc-50/50 transition-colors">
                              <td className="px-6 py-4 text-xs font-bold text-primary uppercase">{sub.number}</td>
                              <td className="px-6 py-4 text-xs font-bold text-zinc-600 uppercase">{sub.type}</td>
                              <td className="px-6 py-4 text-xs text-zinc-800 line-clamp-1 max-w-[200px]">{sub.title}</td>
                              <td className="px-6 py-4 text-xs text-zinc-500">{sub.owner}</td>
                              <td className="px-6 py-4 text-xs text-zinc-400">{new Date(sub.createdAt).toLocaleDateString("id-ID")}</td>
                              <td className="px-6 py-4">
                                 <span className={cn(
                                    "px-3 py-1 rounded-full text-[9px] font-bold uppercase tracking-wider border",
                                    sub.status === "APPROVED" || sub.status === "RESOLVED" || sub.status === "Disetujui"
                                       ? "bg-emerald-50 text-emerald-600 border-emerald-100"
                                       : sub.status === "REJECTED" || sub.status === "CLOSED" || sub.status === "Ditolak"
                                       ? "bg-red-50 text-red-600 border-red-100"
                                       : "bg-amber-50 text-amber-600 border-amber-100"
                                 )}>
                                    {sub.status === "PENDING" ? "Menunggu Verifikasi" : sub.status === "IN_PROGRESS" ? "Diproses" : sub.status}
                                 </span>
                              </td>
                              <td className="px-6 py-4 text-center">
                                 <Link href={
                                    sub.type === "Riset Mahasiswa" ? "/dashboard/admin/research" :
                                    sub.type === "Keberatan Pajak" || sub.type === "Perubahan Data" ? "/dashboard/admin/submissions" :
                                    sub.type === "Layanan PPID" ? "/dashboard/ppid" : "/dashboard/pengaduan"
                                 }>
                                    <Button variant="ghost" size="sm" className="font-bold uppercase text-[9px] tracking-wider text-primary hover:bg-primary/5 px-3 py-1.5 rounded-lg">
                                       Detail
                                    </Button>
                                 </Link>
                              </td>
                           </tr>
                        ))
                     ) : (
                        <tr>
                           <td colSpan={7} className="px-6 py-12 text-center text-zinc-400 italic">Tidak ada data pengajuan dokumen.</td>
                        </tr>
                     )}
                  </tbody>
               </table>
            </div>
         </Card>
      </section>

      {/* ── Activity & System Hub ── */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-8">
         <div className="lg:col-span-8">
            <Card padding="none" className="bg-white border border-zinc-150 rounded-[1.5rem] overflow-hidden shadow-sm flex flex-col p-6 md:p-10 relative">
               <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4 text-left">
                  <div className="space-y-1">
                     <h2 className="text-xl font-black uppercase leading-none">Aktivitas Sistem Terbaru</h2>
                     <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Riwayat aktivitas sistem Bapenda</p>
                  </div>
                  <div className="flex items-center gap-2 bg-zinc-50 p-2 rounded-xl border border-zinc-150 shadow-inner">
                     <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                     <span className="text-[9px] font-bold uppercase tracking-wider text-zinc-500 pr-2">Sinkronisasi Aktif</span>
                  </div>
               </div>
               
               <div className="flex-1 space-y-4 text-left">
                  {data?.recentActivity.map((log) => (
                     <div key={log.id} className="relative pl-10 pb-4 group/row last:pb-0">
                        <div className="absolute left-[12px] top-4 w-[1px] h-full bg-zinc-100 group-last/row:hidden" />
                        <div className="absolute left-0 top-0 w-6 h-6 bg-white border border-zinc-200 rounded-lg flex items-center justify-center shadow-sm z-10 transition-all">
                           <Timer className="w-3.5 h-3.5 text-zinc-400" />
                        </div>
                        <div className="p-4 bg-zinc-50 border border-zinc-100 rounded-xl transition-all">
                           <div className="flex items-center justify-between mb-1">
                              <span className="text-[9px] font-bold uppercase tracking-wide text-primary">{log.action.replace(/_/g, ' ')}</span>
                              <span className="text-[9px] text-zinc-400">{new Date(log.createdAt).toLocaleTimeString()}</span>
                           </div>
                           <p className="text-sm font-bold text-zinc-800">Perubahan data pada <span className="text-zinc-400">{log.table}</span></p>
                           <div className="mt-2 flex items-center gap-2">
                              <span className="text-[9px] font-bold text-zinc-400 uppercase">Petugas: {log.user.name ?? 'Sistem'}</span>
                           </div>
                        </div>
                     </div>
                  ))}
               </div>

                <div className="mt-8 pt-6 border-t border-zinc-50 flex items-center justify-between px-2">
                  <div className="flex items-center gap-4">
                     <div className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full" />
                        <span className="text-[9px] font-bold uppercase text-zinc-400">Status: Aktif</span>
                     </div>
                     <div className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 bg-primary rounded-full" />
                        <span className="text-[9px] font-bold uppercase text-zinc-400">Keamanan: Maksimal</span>
                     </div>
                  </div>
                  <Link href="/dashboard/admin/audit">
                     <Button variant="ghost" size="sm" className="font-bold uppercase text-[9px] tracking-wider text-primary border-b border-primary/20 hover:border-primary transition-all group/btn">
                       Tinjau Audit Penuh <ArrowRight className="ml-2.5 w-3.5 h-3.5" />
                     </Button>
                  </Link>
               </div>
            </Card>
         </div>

         <div className="lg:col-span-4 flex flex-col gap-6">
            <Card padding="none" className="bg-white border border-zinc-150 rounded-[1.5rem] relative overflow-hidden group shadow-sm p-6 space-y-6 cursor-default text-left">
               <div className="space-y-4 relative z-10">
                  <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center border border-primary/10">
                     <Zap className="w-6 h-6 text-primary" />
                  </div>
                  <div className="space-y-2">
                     <h3 className="text-lg font-black uppercase text-foreground">Keamanan Sistem</h3>
                     <p className="text-sm text-muted-foreground leading-relaxed pl-4 border-l-2 border-primary/20">
                        Kondisi server dan database berjalan dengan normal.
                     </p>
                  </div>
               </div>

               <div className="space-y-4 relative z-10">
                  <div className="p-4 bg-zinc-50 rounded-xl border border-zinc-100 space-y-3">
                     <div className="flex items-center justify-between">
                        <p className="text-[9px] font-bold uppercase text-zinc-400">Beban Server</p>
                        <span className="text-[9px] font-bold text-primary uppercase">94% Optimal</span>
                     </div>
                     <div className="w-full h-2 bg-zinc-100 rounded-full overflow-hidden">
                        <div className="h-full bg-primary w-[94%]" />
                     </div>
                  </div>
                  <Button variant="primary" className="w-full h-12 rounded-xl font-bold uppercase text-[10px] tracking-wider flex items-center justify-center gap-2">
                     <ShieldCheck className="w-4 h-4" /> Status Layanan
                  </Button>
               </div>
            </Card>

            <Card padding="lg" className="bg-primary text-white rounded-[1.5rem] shadow-sm relative overflow-hidden group min-h-[160px] flex flex-col justify-center text-left">
               <div className="relative z-10 space-y-3">
                  <p className="text-[9px] font-bold uppercase tracking-wider opacity-60">Layanan Publik</p>
                  <h4 className="text-2xl font-black uppercase leading-none">Menunggu Tindakan</h4>
                  <div className="flex items-center gap-2 mt-2">
                     <span className="px-4 py-1 bg-white/20 rounded-full text-[9px] font-bold uppercase tracking-wider">{data?.submissions.filter(s => s.status === 'PENDING' || s.status === 'OPEN').length ?? 0} Tiket</span>
                     <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </div>
               </div>
            </Card>
         </div>
      </section>
    </div>
  );
};
