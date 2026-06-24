"use client";

import * as React from "react";
import { Session } from "next-auth";
import { useEffect, useState } from "react";
import { 
  ShieldCheck, 
  ArrowRight,
  Zap,
  FileQuestion,
  Megaphone,
  GraduationCap,
  Building2,
  Loader2,
  Clock,
  History
} from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import Link from "next/link";
import { cn } from "@/lib/utils";

interface DashboardStats {
  ppidCount: number;
  complaintCount: number;
  researchCount: number;
}

interface Announcement {
  id: string;
  title: string;
  content: string;
  category: string;
  createdAt: string;
  isActive: boolean;
}

interface Activity {
  id: string;
  action: string;
  table: string;
  createdAt: string;
  user: { name: string };
}

export const OfficerDashboard = ({ session }: { session: Session }) => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [sRes, aRes] = await Promise.all([
          fetch("/api/admin/dashboard-stats"),
          fetch("/api/announcements")
        ]);
        const sData = await sRes.json();
        const aData = await aRes.json();

        // Safe access with fallback values
        if (sData.stats) {
          setStats({
            ppidCount: Number(sData.stats.pendingPPID || 0),
            complaintCount: Number(sData.stats.pendingComplaints || 0),
            researchCount: Number(sData.stats.pendingResearch || 0),
          });
        }
        
        setActivities(sData.recentActivity || []);
        setAnnouncements(Array.isArray(aData) ? aData.filter((n: Announcement) => n.isActive).slice(0, 3) : []);
      } catch (e) {
        console.error("Dashboard fetch error", e);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) {
     return (
        <div className="min-h-[60vh] flex items-center justify-center">
           <Loader2 className="w-12 h-12 text-primary animate-spin" />
        </div>
     );
  }

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-6 duration-1000 pb-20 selection:bg-primary/20 text-left bg-[#F8FAFC]">
      
      {/* ── Officer Operational Hub ── */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-8">
         <div className="lg:col-span-8 relative bg-white border border-zinc-150 rounded-[2rem] p-8 md:p-12 overflow-hidden group shadow-sm min-h-[180px] max-h-[280px] flex flex-col justify-center">
            <div className="relative z-10 space-y-4 text-left">
               <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 bg-primary rounded-full animate-pulse" />
                  <p className="text-[10px] font-black text-primary uppercase tracking-[0.2em] italic">Selamat Datang, {session?.user?.name ?? "Petugas"}</p>
               </div>
               <div className="space-y-2">
                  <h1 className="text-3xl md:text-5xl font-black italic tracking-tighter leading-none text-foreground uppercase">Dashboard <span className="text-primary italic font-black">Petugas Pajak.</span></h1>
                  <p className="text-sm text-muted-foreground font-medium border-l-4 border-primary/20 pl-6 leading-relaxed max-w-2xl">
                     Kelola data objek pajak dan proses pengajuan masyarakat dengan lebih mudah.
                  </p>
               </div>
            </div>
         </div>

         <div className="lg:col-span-4 grid grid-cols-1 gap-4">
            <StatsCard label="Permohonan PPID" value={stats?.ppidCount ?? 0} icon={FileQuestion} color="blue" />
            <StatsCard label="Pengaduan Masuk" value={stats?.complaintCount ?? 0} icon={Megaphone} color="amber" />
            <StatsCard label="Riset Mahasiswa" value={stats?.researchCount ?? 0} icon={GraduationCap} color="emerald" />
         </div>
      </section>

      {/* ── Operational Intelligence ── */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-10">
         <div className="lg:col-span-8">
            <Card padding="md" className="bg-white border border-zinc-150 rounded-[1.5rem] overflow-hidden shadow-sm p-6 md:p-10 relative min-h-[400px] text-left">
               <div className="flex items-center justify-between mb-8 border-b border-zinc-50 pb-4">
                  <div className="space-y-1">
                     <h2 className="text-xl font-black uppercase leading-none">Aktivitas Terbaru</h2>
                     <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider leading-none">Riwayat verifikasi objek dan pengajuan terbaru</p>
                  </div>
                  <History className="w-6 h-6 text-primary/30" />
               </div>
               
               <div className="space-y-6">
                  {activities.length === 0 ? (
                    <div className="py-16 text-center opacity-30 italic font-bold text-zinc-300">Belum ada aktivitas terbaru.</div>
                  ) : activities.map((act) => (
                    <div key={act.id} className="flex items-center gap-6 group/act transition-all">
                       <div className="w-10 h-10 bg-zinc-50 rounded-xl border border-zinc-100 flex items-center justify-center text-zinc-400 group-hover/act:bg-primary group-hover/act:text-white transition-all shadow-inner">
                          <Zap className="w-4 h-4" />
                       </div>
                       <div className="flex-1 space-y-0.5">
                          <p className="text-[9px] font-bold uppercase text-primary leading-none tracking-wide">{act.action.replace(/_/g, ' ')}</p>
                          <h4 className="text-sm font-bold text-zinc-800 leading-none">Pembaruan data pada {act.table}</h4>
                          <p className="text-[10px] text-muted-foreground font-medium">Petugas: {act.user.name}</p>
                       </div>
                       <div className="text-right">
                          <p className="text-[9px] font-bold text-zinc-300 uppercase flex items-center gap-1"><Clock className="w-3 h-3" /> {new Date(act.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                       </div>
                    </div>
                  ))}
               </div>
            </Card>
         </div>

         <div className="lg:col-span-4 flex flex-col gap-6">
            <Card padding="md" className="bg-zinc-50 border border-zinc-150 rounded-[1.5rem] p-6 space-y-6 group text-left">
               <h3 className="text-lg font-black uppercase border-l-4 border-primary pl-4">Portal Layanan</h3>
               <div className="grid grid-cols-1 gap-3">
                  <DispatchLink href="/dashboard/ppid" label="Ulas PPID" icon={FileQuestion} />
                  <DispatchLink href="/dashboard/pengaduan" label="Pengaduan" icon={Megaphone} />
                  <DispatchLink href="/dashboard/admin/tax-objects" label="Validasi Aset" icon={Building2} />
                  <DispatchLink href="/dashboard/admin/research" label="Validasi Riset" icon={GraduationCap} />
               </div>
            </Card>

            <Card padding="md" className="bg-white border border-zinc-150 rounded-[1.5rem] p-6 shadow-sm space-y-6 group text-left">
               <div className="flex items-center gap-3 text-primary">
                  <Megaphone className="w-5 h-5" />
                  <h3 className="text-sm font-black uppercase">Bulletin Informasi</h3>
               </div>
               <div className="space-y-4">
                  {announcements.map(ann => (
                     <div key={ann.id} className="space-y-1 border-l-2 border-zinc-100 pl-3 group-hover:border-primary transition-colors">
                        <p className="text-[9px] font-bold uppercase text-zinc-400">{ann.category}</p>
                        <h5 className="text-xs font-bold text-zinc-800 line-clamp-1">{ann.title}</h5>
                     </div>
                  ))}
               </div>
               <Button variant="ghost" className="w-full justify-between font-bold uppercase text-[9px] tracking-wider italic p-0 hover:text-primary">Lihat Semua →</Button>
            </Card>
         </div>
      </section>
    </div>
  );
};

function StatsCard({ label, value, icon: Icon, color }: { label: string; value: number; icon: React.ElementType; color: string }) {
   const colors: Record<string, string> = {
      blue: "bg-blue-50 text-blue-500 border-blue-100",
      amber: "bg-amber-50 text-amber-500 border-amber-100",
      emerald: "bg-emerald-50 text-emerald-600 border-emerald-100",
   };
   return (
      <Card padding="md" className="bg-white border border-zinc-150 rounded-[1.5rem] shadow-sm flex items-center justify-between group transition-all text-left">
         <div className="space-y-1">
            <p className="text-[10px] font-bold uppercase text-zinc-400 tracking-wider leading-none">{label}</p>
            <h4 className="text-2xl font-black text-foreground leading-none">{value}</h4>
         </div>
         <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center border shadow-inner group-hover:rotate-6 transition-transform", colors[color])}>
            <Icon className="w-5 h-5" />
         </div>
      </Card>
   );
}

function DispatchLink({ href, label, icon: Icon }: { href: string; label: string; icon: React.ElementType }) {
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
