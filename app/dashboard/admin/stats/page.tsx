"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { 
  BarChart3, 
  TrendingUp, 
  Users, 
  CreditCard, 
  Download, 
  Star, 
  ShieldCheck, 
  Activity, 
  ArrowUpRight,
  TrendingDown,
  Building2,
  Percent,
  Loader2
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { useToast } from "@/lib/hooks/use-toast";

interface APIStats {
  stats: {
    userCount: number;
    taxObjectCount: number;
    paidCount: number;
    unpaidCount: number;
    totalRevenue: number;
  };
  monthlyStats: Array<{
    month: number;
    revenue: number;
    tunggakan: number;
  }>;
  sectorStats: Array<{
    name: string;
    amount: number;
    pct: number;
  }>;
  districtStats: Array<{
    name: string;
    amount: number;
    simulatedVal: number;
    pct: number;
  }>;
}

function formatCurrency(val: number) {
  return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(val);
}

function formatShortCurrency(val: number) {
  if (val >= 1_000_000_000_000) return `Rp ${(val / 1_000_000_000_000).toFixed(1)}T`;
  if (val >= 1_000_000_000) return `Rp ${(val / 1_000_000_000).toFixed(1)}M`;
  if (val >= 1_000_000) return `Rp ${(val / 1_000_000).toFixed(1)}Jt`;
  return formatCurrency(val);
}

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Agu", "Sep", "Okt", "Nov", "Des"];

export default function AdminStatsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "authenticated" && (session?.user as any)?.role !== "ADMIN") {
      router.replace("/dashboard");
    }
  }, [session, status, router]);

  const { toast } = useToast();
  const [data, setData] = useState<APIStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status !== "authenticated" || (session?.user as any)?.role !== "ADMIN") return;
    fetch("/api/admin/dashboard-stats")
      .then((r) => {
        if (!r.ok) throw new Error();
        return r.json();
      })
      .then((d) => setData(d))
      .catch(() => toast("Error", "Gagal memuat visualisasi statistik fiskal.", "error"))
      .finally(() => setLoading(false));
  }, [toast, session, status]);

  if (status === "loading" || (session?.user as any)?.role !== "ADMIN") {
     return (
        <div className="min-h-[60vh] flex items-center justify-center">
           <Loader2 className="w-12 h-12 text-[#1E40AF] animate-spin" />
        </div>
     );
  }

  // Calculate compliance rate
  const paidCount = data?.stats.paidCount ?? 0;
  const unpaidCount = data?.stats.unpaidCount ?? 0;
  const totalBills = paidCount + unpaidCount;
  const complianceRate = totalBills > 0 ? Math.round((paidCount / totalBills) * 100) : 100;

  // Max value for monthly chart scaling
  const maxMonthlyVal = data ? Math.max(...data.monthlyStats.map(s => Math.max(s.revenue, s.tunggakan)), 1000000) : 1000000;

  const kpiCards = [
    {
      label: "Total Wajib Pajak",
      value: data?.stats.userCount.toLocaleString("id-ID") ?? "—",
      subtext: "Entitas Terdaftar",
      icon: Users,
      color: "text-blue-600 bg-blue-50 border-blue-100 shadow-blue-500/5",
      trend: "+12.5% YoY",
      trendUp: true,
    },
    {
      label: "Akumulasi PAD 2026",
      value: formatCurrency(data?.stats.totalRevenue ?? 0),
      subtext: "Realisasi Pajak Lunas",
      icon: TrendingUp,
      color: "text-primary bg-primary/5 border-primary/10 shadow-primary-500/5",
      trend: "Target 85% Tercapai",
      trendUp: true,
    },
    {
      label: "Rasio Kepatuhan",
      value: `${complianceRate}%`,
      subtext: "Persentase Pelunasan",
      icon: Percent,
      color: "text-emerald-600 bg-emerald-50 border-emerald-100 shadow-emerald-500/5",
      trend: `${paidCount} Terbayar dari ${totalBills} Tagihan`,
      trendUp: complianceRate >= 75,
    },
    {
      label: "Total Tunggakan",
      value: data ? `${data.stats.unpaidCount.toLocaleString("id-ID")} Invoice` : "—",
      subtext: "Piutang Pajak Terbuka",
      icon: BarChart3,
      color: "text-amber-600 bg-amber-50 border-amber-100 shadow-amber-500/5",
      trend: "Sedang Ditagih",
      trendUp: false,
    },
  ];

  const handleExport = () => {
    toast("Mengekspor Laporan", "Dokumen audit keuangan sedang diunduh...", "success");
  };

  const sectorColors = [
    "bg-primary",
    "bg-blue-500",
    "bg-emerald-500",
    "bg-amber-500",
    "bg-purple-500",
    "bg-zinc-400"
  ];

  return (
    <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-1000 pb-20 selection:bg-primary/20 text-left">
      
      {/* ── Page Header ── */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-10 px-4">
        <div className="space-y-4">
          <div className="flex items-center gap-3 text-primary">
             <div className="w-10 h-1 bg-primary rounded-full shadow-glow" />
             <p className="text-[10px] font-black uppercase tracking-[0.4em] italic leading-none">Fiscal Intelligence Analytics</p>
          </div>
          <h1 className="text-5xl md:text-7xl font-black italic tracking-tighter leading-[0.85] text-foreground uppercase italic underline decoration-primary/10 decoration-8 underline-offset-8">
            Performansi <span className="text-primary italic">Keuangan.</span>
          </h1>
          <p className="text-xl text-muted-foreground font-medium max-w-xl leading-relaxed italic border-l-4 border-primary/10 pl-8 ml-2">
            &quot;Monitoring real-time Pendapatan Asli Daerah (PAD) dan efektivitas pemungutan pajak melalui integrasi ledger terpusat.&quot;
          </p>
        </div>
        <Button
          size="xl"
          onClick={handleExport}
          className="rounded-full px-10 h-20 bg-primary text-white hover:bg-primary/90 shadow-2xl shadow-primary/30 group font-black uppercase text-xs tracking-widest italic"
        >
          <Download className="w-6 h-6 mr-3 group-hover:-translate-y-2 transition-transform animate-bounce" /> Ekspor Audit Report
        </Button>
      </div>

      {/* ── KPI Ledger Grid ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 pt-6">
        {kpiCards.map((card, i) => (
          <Card key={i} padding="none" variant="elevated" className="bg-white border-zinc-100 rounded-[3.5rem] p-10 flex flex-col justify-between hover:shadow-2xl hover:scale-[1.05] transition-all group overflow-hidden shadow-xl shadow-primary/5 min-h-[260px] relative">
            <div className={cn("absolute inset-0 opacity-[0.03] -z-0", card.color.split(" ")[1])} />
            {loading ? (
              <div className="space-y-6 animate-pulse relative z-10 text-left">
                <div className="w-16 h-16 bg-zinc-50 rounded-2xl border border-zinc-100 shadow-inner" />
                <div className="h-10 bg-zinc-50 rounded-xl w-3/4" />
                <div className="h-4 bg-zinc-50 rounded-xl w-1/2" />
              </div>
            ) : (
              <div className="space-y-10 relative z-10 text-left flex flex-col justify-between h-full">
                <div className={cn("w-16 h-16 rounded-2xl flex items-center justify-center shadow-inner border group-hover:rotate-12 transition-transform", card.color)}>
                  <card.icon className="w-8 h-8" />
                </div>
                <div className="space-y-3">
                   <p className="text-3xl font-black italic tracking-tighter text-zinc-900 leading-none uppercase italic">{card.value}</p>
                   <div className="space-y-1">
                     <p className="text-[10px] font-black uppercase tracking-widest text-zinc-800 opacity-80 leading-none italic">{card.label}</p>
                     <p className="text-[9px] text-zinc-400 font-semibold italic">{card.subtext}</p>
                   </div>
                </div>
                <div className={cn("inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest italic leading-none border shadow-sm w-fit", card.trendUp ? "text-emerald-600 bg-emerald-50 border-emerald-100" : "text-amber-600 bg-amber-50 border-amber-100")}>
                  {card.trendUp ? <Activity className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5" />}
                  {card.trend}
                </div>
              </div>
            )}
          </Card>
        ))}
      </div>

      {/* ── Revenue Trajectory Canvas ── */}
      <Card padding="none" variant="elevated" className="bg-white border-zinc-100 rounded-[5rem] p-12 lg:p-20 shadow-2xl shadow-primary/5 relative overflow-hidden group text-left">
         <div className="absolute top-0 right-0 p-32 opacity-5 pointer-events-none -z-0">
            <TrendingUp className="w-96 h-96 text-primary group-hover:scale-110 transition-transform duration-[2000ms]" />
         </div>
        <div className="flex flex-col lg:flex-row items-center justify-between mb-16 gap-8 relative z-10">
          <div className="space-y-3">
             <div className="flex items-center gap-3 text-primary">
                <div className="w-8 h-1 bg-primary rounded-full" />
                <p className="text-[10px] font-black uppercase tracking-[0.3em] italic">Flow Ledger Monitoring</p>
             </div>
             <h2 className="text-4xl font-black italic tracking-tighter uppercase italic leading-none">Grafik Pendapatan vs Tunggakan<br /><span className="text-primary italic">Bulanan Pajak Daerah.</span></h2>
          </div>
          <div className="flex items-center gap-4 bg-zinc-50 p-2.5 rounded-[2rem] border border-zinc-100 shadow-inner">
            <div className="flex items-center gap-2 px-4">
              <div className="w-3 h-3 rounded-full bg-primary" />
              <span className="text-[10px] font-black uppercase tracking-widest text-zinc-600 italic">Pendapatan</span>
            </div>
            <div className="flex items-center gap-2 px-4 border-l border-zinc-200">
              <div className="w-3 h-3 rounded-full bg-amber-400" />
              <span className="text-[10px] font-black uppercase tracking-widest text-zinc-600 italic">Tunggakan</span>
            </div>
          </div>
        </div>

        {/* ── High-Fidelity Side-by-Side Bar Chart ── */}
        <div className="flex items-end gap-3 md:gap-5 h-80 relative z-10 px-4">
          {loading ? (
            <div className="w-full h-full bg-zinc-50 rounded-3xl animate-pulse" />
          ) : (
            data?.monthlyStats.map((stats, i) => {
              const revHeight = (stats.revenue / maxMonthlyVal) * 100;
              const tunggakanHeight = (stats.tunggakan / maxMonthlyVal) * 100;
              
              return (
                <div key={i} className="flex-1 flex flex-col items-center gap-6 group/bar h-full justify-end relative hover:z-30">
                  <div className="w-full flex items-end justify-center gap-1.5 md:gap-2.5 h-[80%]">
                    {/* Revenue Bar */}
                    <div 
                      className="w-1/2 bg-primary rounded-t-lg transition-all duration-700 hover:brightness-95 hover:scale-x-115 relative cursor-pointer group/rev"
                      style={{ height: `${Math.max(revHeight, 3)}%` }}
                    >
                      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 bg-zinc-900 text-white text-[9px] font-black uppercase tracking-widest px-3 py-1.5 rounded-lg opacity-0 group-hover/rev:opacity-100 transition-all duration-300 whitespace-nowrap shadow-xl z-20 pointer-events-none">
                        Pendapatan: {formatShortCurrency(stats.revenue)}
                      </div>
                    </div>

                    {/* Tunggakan Bar */}
                    <div 
                      className="w-1/2 bg-amber-400 rounded-t-lg transition-all duration-700 hover:brightness-95 hover:scale-x-115 relative cursor-pointer group/tung"
                      style={{ height: `${Math.max(tunggakanHeight, 3)}%` }}
                    >
                      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 bg-zinc-900 text-white text-[9px] font-black uppercase tracking-widest px-3 py-1.5 rounded-lg opacity-0 group-hover/tung:opacity-100 transition-all duration-300 whitespace-nowrap shadow-xl z-20 pointer-events-none">
                        Tunggakan: {formatShortCurrency(stats.tunggakan)}
                      </div>
                    </div>
                  </div>
                  <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest group-hover/bar:text-primary transition-colors italic leading-none">{MONTHS[i]}</p>
                </div>
              )
            })
          )}
        </div>
      </Card>

      {/* ── Granular Distribution Mapping ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        
        {/* Sektor Pajak */}
        <Card padding="none" variant="elevated" className="bg-white border-zinc-100 rounded-[4rem] p-12 lg:p-16 shadow-2xl shadow-primary/5 text-left group">
          <div className="flex items-center justify-between mb-12">
             <div className="space-y-1">
                <h3 className="text-3xl font-black italic tracking-tighter uppercase italic leading-none">Distribusi <br /><span className="text-primary italic">Sektor Pajak.</span></h3>
                <p className="text-[9px] font-black text-zinc-400 uppercase tracking-widest italic opacity-60 mt-4 leading-none decoration-zinc-100 underline underline-offset-4">Segmentation Revenue Analytics</p>
             </div>
             <div className="w-14 h-14 bg-zinc-50 rounded-2xl flex items-center justify-center border border-zinc-100 shadow-inner group-hover:rotate-12 transition-transform">
                <Star className="w-6 h-6 text-primary" />
             </div>
          </div>
          <div className="space-y-10">
            {loading ? (
              <div className="h-60 bg-zinc-50 rounded-3xl animate-pulse" />
            ) : (
              data?.sectorStats.map((t, idx) => (
                <div key={idx} className="space-y-4 group/row">
                  <div className="flex justify-between items-baseline px-2">
                    <span className="text-[11px] font-black uppercase tracking-widest text-zinc-500 group-hover/row:text-foreground transition-colors italic">{t.name}</span>
                    <div className="flex items-center gap-3">
                      <span className="text-[10px] font-bold text-zinc-400 italic">{t.amount > 0 ? formatShortCurrency(t.amount) : ""}</span>
                      <span className="font-black italic text-xl tracking-tighter text-primary">{t.pct}%</span>
                    </div>
                  </div>
                  <div className="h-5 bg-zinc-50 rounded-full border border-zinc-100 p-1 shadow-inner overflow-hidden">
                    <div 
                      className={cn("h-full rounded-full transition-all duration-[1.5s] ease-out shadow-glow group-hover/row:scale-y-110", sectorColors[idx % sectorColors.length])} 
                      style={{ width: `${t.pct}%` }} 
                    />
                  </div>
                </div>
              ))
            )}
          </div>
        </Card>

        {/* Peringkat Kecamatan */}
        <Card padding="none" variant="elevated" className="bg-white border-zinc-100 rounded-[4rem] p-12 lg:p-16 shadow-2xl shadow-primary/5 text-left group">
           <div className="flex items-center justify-between mb-12">
             <div className="space-y-1">
                <h3 className="text-3xl font-black italic tracking-tighter uppercase italic leading-none">Peringkat <br /><span className="text-primary italic">Kecamatan (PAD).</span></h3>
                <p className="text-[9px] font-black text-zinc-400 uppercase tracking-widest italic opacity-60 mt-4 leading-none decoration-zinc-100 underline underline-offset-4">Top 5 Regional Productivity</p>
             </div>
             <div className="w-14 h-14 bg-zinc-50 rounded-2xl flex items-center justify-center border border-zinc-100 shadow-inner group-hover:rotate-12 transition-transform">
                <Activity className="w-6 h-6 text-primary" />
             </div>
          </div>
          <div className="space-y-8">
            {loading ? (
              <div className="h-60 bg-zinc-50 rounded-3xl animate-pulse" />
            ) : (
              data?.districtStats.map((k, i) => (
                <div key={i} className="flex items-center gap-8 p-6 bg-zinc-50 border border-zinc-100 rounded-[2.5rem] hover:bg-white hover:border-primary/20 hover:shadow-2xl hover:scale-[1.02] transition-all group/item shadow-inner">
                  <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center font-black italic text-zinc-300 group-hover/item:text-primary transition-all border border-zinc-100 shadow-sm relative group-hover/item:rotate-6">
                     <span className="text-lg">#{i + 1}</span>
                  </div>
                  <div className="flex-1 space-y-3 text-left">
                    <div className="flex justify-between items-baseline">
                      <span className="font-black italic text-lg uppercase tracking-tight text-foreground transition-all">{k.name}</span>
                      <span className="text-primary font-black italic text-xl tracking-tighter">
                        {formatShortCurrency(k.simulatedVal)}
                      </span>
                    </div>
                    <div className="h-2 bg-zinc-200/50 rounded-full overflow-hidden">
                      <div className="h-full bg-primary rounded-full group-hover/item:shadow-glow transition-all duration-[2s]" style={{ width: `${k.pct}%` }} />
                    </div>
                  </div>
                  <ArrowUpRight className="w-6 h-6 text-zinc-300 opacity-0 group-hover/item:opacity-100 group-hover/item:text-primary transition-all font-bold" />
                </div>
              ))
            )}
          </div>
        </Card>
      </div>

      {/* ── System Audit Integrity Ledger ── */}
      <div className="bg-zinc-50 border border-zinc-100 rounded-[5rem] p-12 lg:p-24 mt-20 relative overflow-hidden group shadow-inner">
         <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[100px] group-hover:scale-125 transition-transform duration-1000" />
         <div className="flex flex-col md:flex-row items-center gap-20 relative z-10">
            <div className="flex-1 space-y-10">
               <h3 className="text-4xl md:text-7xl font-black italic tracking-tighter leading-[0.85] uppercase italic text-foreground inline-block relative underline decoration-primary/10 decoration-8 underline-offset-8">
                 Integritas <br /><span className="text-primary italic">Sistem Audit.</span>
               </h3>
               <p className="text-xl text-muted-foreground font-medium max-w-xl italic leading-relaxed border-l-4 border-primary/20 pl-10 ml-2">
                  &quot;Log aktivitas finansial dan audit geospasial dipantau secara ketat untuk menjamin transparansi anggaran daerah Pemerintah Kota Medan.&quot;
               </p>
               <Button variant="ghost" className="rounded-full px-10 h-16 gap-3 font-black uppercase text-[10px] tracking-[0.3em] border-b-2 border-zinc-200 hover:border-primary transition-all italic">Pusat Kebijakan Fiskal Digital <ArrowUpRight className="w-5 h-5" /></Button>
            </div>
            <div className="hidden lg:flex justify-center shrink-0">
               <div className="w-72 h-72 bg-white rounded-[4rem] border border-zinc-100 flex items-center justify-center shadow-2xl rotate-6 group-hover:rotate-0 transition-transform duration-1000 relative">
                  <ShieldCheck className="w-40 h-40 text-primary opacity-20" />
               </div>
            </div>
         </div>
      </div>
    </div>
  );
}
