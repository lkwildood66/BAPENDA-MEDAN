"use client";

import * as React from "react";
import { Session } from "next-auth";
import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { 
  Building2, 
  Map, 
  Scale, 
  ClipboardCheck, 
  Wallet, 
  FileSearch, 
  GraduationCap, 
  MapPinned, 
  Loader2, 
  Clock, 
  History, 
  ArrowRight,
  ClipboardList,
  AlertTriangle,
  CheckCircle,
  FileText,
  Users
} from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import Link from "next/link";
import { cn } from "@/lib/utils";

import type { MapContainerProps, TileLayerProps, MarkerProps, PopupProps } from "react-leaflet";

// Dynamically import Leaflet components to prevent SSR issues
const MapContainer = dynamic<MapContainerProps>(() => import("react-leaflet").then((mod) => mod.MapContainer), { 
  ssr: false,
  loading: () => <div className="w-full h-[320px] bg-zinc-50 animate-pulse rounded-xl border border-zinc-150" />
});
const TileLayer = dynamic<TileLayerProps>(() => import("react-leaflet").then((mod) => mod.TileLayer), { ssr: false });
const Marker = dynamic<MarkerProps>(() => import("react-leaflet").then((mod) => mod.Marker), { ssr: false });
const Popup = dynamic<PopupProps>(() => import("react-leaflet").then((mod) => mod.Popup), { ssr: false });

interface DashboardStats {
  pendingVerificationObjects: number;
  newSubmissions: number;
  inProgressSubmissions: number;
  fieldTasksToday: number;
}

interface Activity {
  id: string;
  action: string;
  table: string;
  createdAt: string;
  user: { name: string | null };
}

interface GisPoint {
  id: string;
  nop: string;
  name: string;
  address: string;
  lat: number;
  lng: number;
  status: string;
  isCompliant: boolean;
}

export const OfficerDashboard = ({ session }: { session: Session }) => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [gisData, setGisData] = useState<GisPoint[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [mapIconVerified, setMapIconVerified] = useState<any>(null);
  const [mapIconPending, setMapIconPending] = useState<any>(null);
  const [mapIconRejected, setMapIconRejected] = useState<any>(null);

  // Center of Medan
  const center: [number, number] = [3.595, 98.672];

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statsRes, gisRes] = await Promise.all([
          fetch("/api/admin/dashboard-stats"),
          fetch("/api/gis")
        ]);
        const statsData = await statsRes.json();
        const gisJson = await gisRes.json();

        if (statsData.stats) {
          setStats({
            pendingVerificationObjects: Number(statsData.stats.pendingVerificationObjects || 0),
            newSubmissions: Number(statsData.stats.pendingTaxSubmissions || statsData.stats.newSubmissions || 0),
            inProgressSubmissions: Number(statsData.stats.inProgressSubmissions || 0),
            fieldTasksToday: Number(statsData.stats.fieldTasksToday || 0),
          });
        }
        setActivities(statsData.recentActivity || []);
        
        if (Array.isArray(gisJson)) {
          setGisData(gisJson);
        }
      } catch (e) {
        console.error("Dashboard fetch error", e);
      } finally {
        setLoading(false);
      }
    };

    fetchData();

    // Import Leaflet for icons
    import("leaflet").then((L) => {
      setMapIconVerified(L.divIcon({
        className: "premium-marker",
        html: `<div class="marker-pulse bg-emerald-500/20"></div><svg class="absolute left-0 top-0 w-[26px] h-[36px]" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style="filter: drop-shadow(0 4px 6px rgba(0,0,0,0.35));"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" fill="#10B981" stroke="#ffffff" stroke-width="1.5" stroke-linejoin="round"/><circle cx="12" cy="9" r="2.5" fill="#ffffff"/></svg>`,
        iconSize: [26, 36],
        iconAnchor: [13, 36],
      }));
      setMapIconPending(L.divIcon({
        className: "premium-marker",
        html: `<div class="marker-pulse bg-amber-500/20"></div><svg class="absolute left-0 top-0 w-[26px] h-[36px]" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style="filter: drop-shadow(0 4px 6px rgba(0,0,0,0.35));"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" fill="#F59E0B" stroke="#ffffff" stroke-width="1.5" stroke-linejoin="round"/><circle cx="12" cy="9" r="2.5" fill="#ffffff"/></svg>`,
        iconSize: [26, 36],
        iconAnchor: [13, 36],
      }));
      setMapIconRejected(L.divIcon({
        className: "premium-marker",
        html: `<div class="marker-pulse bg-red-500/20"></div><svg class="absolute left-0 top-0 w-[26px] h-[36px]" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style="filter: drop-shadow(0 4px 6px rgba(0,0,0,0.35));"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" fill="#EF4444" stroke="#ffffff" stroke-width="1.5" stroke-linejoin="round"/><circle cx="12" cy="9" r="2.5" fill="#ffffff"/></svg>`,
        iconSize: [26, 36],
        iconAnchor: [13, 36],
      }));
    });
  }, []);

  const getLogDetails = (action: string, table: string) => {
    const act = action.toUpperCase();
    if (act.includes("CREATE") || act.includes("INSERT")) {
      return { label: "Pendataan Baru", color: "text-[#3B82F6]", bg: "bg-[#3B82F6]/5", icon: Building2 };
    }
    if (act.includes("VERIFY") || act.includes("APPROVE") || act.includes("STATUS")) {
      return { label: "Verifikasi Terbaru", color: "text-[#10B981]", bg: "bg-[#10B981]/5", icon: ClipboardCheck };
    }
    return { label: "Penilaian Terbaru", color: "text-[#F59E0B]", bg: "bg-[#F59E0B]/5", icon: Scale };
  };

  if (loading) {
     return (
        <div className="min-h-[60vh] flex items-center justify-center">
           <Loader2 className="w-12 h-12 text-[#1E40AF] animate-spin" />
        </div>
     );
  }

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-6 duration-1000 pb-20 selection:bg-[#1E40AF]/20 text-left bg-[#F8FAFC]">
      
      {/* ── Dashboard Hero ── */}
      <section className="relative bg-white border border-zinc-150 rounded-[2rem] p-8 md:p-12 overflow-hidden group shadow-sm flex flex-col justify-center min-h-[160px]">
         <div className="relative z-10 space-y-4">
            <div className="flex items-center gap-2">
               <div className="w-2.5 h-2.5 bg-[#1E40AF] rounded-full animate-pulse" />
               <p className="text-[10px] font-black text-[#1E40AF] uppercase tracking-[0.2em] italic">Selamat Datang, {session.user?.name ?? "Petugas"}</p>
            </div>
            <div className="space-y-2">
               <h1 className="text-3xl md:text-5xl font-black italic tracking-tighter leading-none uppercase text-foreground">Dashboard <span className="text-[#1E40AF] italic">Petugas Lapangan.</span></h1>
               <p className="text-sm text-muted-foreground font-medium max-w-2xl leading-relaxed italic border-l-4 border-[#1E40AF]/20 pl-6">
                  Kelola data objek pajak, lakukan survei fisik, verifikasi pengajuan, dan perbarui peta bidang digital.
               </p>
            </div>
         </div>
      </section>

      {/* ── Ringkasan Utama Operasional ── */}
      <section className="space-y-4">
         <div className="flex items-center gap-4 pl-2">
            <div className="w-8 h-1 bg-[#1E40AF] rounded-full" />
            <h2 className="text-lg font-black italic tracking-tighter uppercase text-zinc-800">Ringkasan Pekerjaan Lapangan & Layanan</h2>
         </div>

         <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* KPI 1 */}
            <Card padding="md" className="bg-white border border-zinc-150 group transition-all flex items-center justify-between shadow-sm hover:shadow-md rounded-[1.5rem]">
               <div className="space-y-1">
                  <p className="text-[10px] font-bold uppercase text-zinc-400 tracking-wider">Menunggu Verifikasi</p>
                  <h4 className="text-2xl font-black text-foreground">{stats?.pendingVerificationObjects ?? 0} Objek</h4>
                  <p className="text-[10px] font-medium text-zinc-500">Objek Pajak Butuh Survei</p>
               </div>
               <div className="w-12 h-12 rounded-xl flex items-center justify-center border border-zinc-100 text-[#F59E0B] bg-[#F59E0B]/5">
                  <Building2 className="w-5 h-5" />
               </div>
            </Card>

            {/* KPI 2 */}
            <Card padding="md" className="bg-white border border-zinc-150 group transition-all flex items-center justify-between shadow-sm hover:shadow-md rounded-[1.5rem]">
               <div className="space-y-1">
                  <p className="text-[10px] font-bold uppercase text-zinc-400 tracking-wider">Pengajuan Baru</p>
                  <h4 className="text-2xl font-black text-foreground">{stats?.newSubmissions ?? 0} Berkas</h4>
                  <p className="text-[10px] font-medium text-zinc-500">Layanan Baru Masuk</p>
               </div>
               <div className="w-12 h-12 rounded-xl flex items-center justify-center border border-zinc-100 text-[#1E40AF] bg-[#1E40AF]/5">
                  <ClipboardList className="w-5 h-5" />
               </div>
            </Card>

            {/* KPI 3 */}
            <Card padding="md" className="bg-white border border-zinc-150 group transition-all flex items-center justify-between shadow-sm hover:shadow-md rounded-[1.5rem]">
               <div className="space-y-1">
                  <p className="text-[10px] font-bold uppercase text-zinc-400 tracking-wider">Pengajuan Diproses</p>
                  <h4 className="text-2xl font-black text-foreground">{stats?.inProgressSubmissions ?? 0} Berkas</h4>
                  <p className="text-[10px] font-medium text-zinc-500">Layanan Sedang Ditinjau</p>
               </div>
               <div className="w-12 h-12 rounded-xl flex items-center justify-center border border-zinc-100 text-[#10B981] bg-[#10B981]/5">
                  <ClipboardCheck className="w-5 h-5" />
               </div>
            </Card>

            {/* KPI 4 */}
            <Card padding="md" className="bg-white border border-zinc-150 group transition-all flex items-center justify-between shadow-sm hover:shadow-md rounded-[1.5rem]">
               <div className="space-y-1">
                  <p className="text-[10px] font-bold uppercase text-zinc-400 tracking-wider">Tugas Lapangan</p>
                  <h4 className="text-2xl font-black text-foreground">{stats?.fieldTasksToday ?? 0} Tugas</h4>
                  <p className="text-[10px] font-medium text-zinc-500">Survei Lapangan Hari Ini</p>
               </div>
               <div className="w-12 h-12 rounded-xl flex items-center justify-center border border-zinc-100 text-[#3B82F6] bg-[#3B82F6]/5">
                  <Map className="w-5 h-5" />
               </div>
            </Card>
         </div>
      </section>

      {/* ── Quick Actions ── */}
      <section className="space-y-4">
         <div className="flex items-center gap-4 pl-2">
            <div className="w-8 h-1 bg-[#1E40AF] rounded-full" />
            <h2 className="text-lg font-black italic tracking-tighter uppercase text-zinc-800">Aksi Cepat Petugas</h2>
         </div>

         <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Link href="/dashboard/admin/tax-objects">
               <Button variant="secondary" className="w-full flex justify-between items-center px-6" icon={<ClipboardCheck className="w-4 h-4 text-[#1E40AF]" />}>
                  Verifikasi Objek
               </Button>
            </Link>
            <Link href="/dashboard/gis/pendataan">
               <Button variant="secondary" className="w-full flex justify-between items-center px-6" icon={<Map className="w-4 h-4 text-[#3B82F6]" />}>
                  Tambah Pendataan
               </Button>
            </Link>
            <Link href="/dashboard/gis/penilaian">
               <Button variant="secondary" className="w-full flex justify-between items-center px-6" icon={<Scale className="w-4 h-4 text-[#F59E0B]" />}>
                  Buat Penilaian
               </Button>
            </Link>
            <Link href="/dashboard/admin/submissions">
               <Button variant="secondary" className="w-full flex justify-between items-center px-6" icon={<ClipboardList className="w-4 h-4 text-[#EF4444]" />}>
                  Review Pengajuan
               </Button>
            </Link>
         </div>
      </section>

      {/* ── Peta Pendataan & Aktivitas ── */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-8">
         {/* Map Column */}
         <div className="lg:col-span-8 space-y-4">
            <Card padding="none" className="bg-white border border-zinc-150 rounded-[1.5rem] overflow-hidden shadow-sm flex flex-col">
               <div className="p-6 border-b border-zinc-100 flex items-center justify-between bg-white z-10">
                  <div>
                     <h3 className="text-base font-black uppercase text-zinc-800 leading-none">Peta Pendataan Bidang PBB</h3>
                     <p className="text-[10px] text-zinc-400 font-bold uppercase mt-1">Pemetaan sebaran verifikasi wilayah Medan</p>
                  </div>
                  <div className="flex items-center gap-4 text-[9px] font-bold text-zinc-500 uppercase">
                     <span className="flex items-center gap-1.5">
                        <svg className="w-3 h-4 shrink-0" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ filter: "drop-shadow(0 1px 2px rgba(0,0,0,0.15))" }}>
                           <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" fill="#10B981" stroke="#ffffff" strokeWidth="1.5" strokeLinejoin="round"/>
                           <circle cx="12" cy="9" r="2.5" fill="#ffffff"/>
                        </svg>
                        Objek Pajak
                     </span>
                     <span className="flex items-center gap-1.5">
                        <svg className="w-3 h-4 shrink-0" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ filter: "drop-shadow(0 1px 2px rgba(0,0,0,0.15))" }}>
                           <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" fill="#F59E0B" stroke="#ffffff" strokeWidth="1.5" strokeLinejoin="round"/>
                           <circle cx="12" cy="9" r="2.5" fill="#ffffff"/>
                        </svg>
                        Belum Diverifikasi
                     </span>
                     <span className="flex items-center gap-1.5">
                        <svg className="w-3 h-4 shrink-0" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ filter: "drop-shadow(0 1px 2px rgba(0,0,0,0.15))" }}>
                           <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" fill="#EF4444" stroke="#ffffff" strokeWidth="1.5" strokeLinejoin="round"/>
                           <circle cx="12" cy="9" r="2.5" fill="#ffffff"/>
                        </svg>
                        Perlu Review
                     </span>
                  </div>
               </div>

               <div className="relative h-[320px] w-full z-0 overflow-hidden">
                  <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
                  <MapContainer center={center} zoom={13} scrollWheelZoom={false} className="w-full h-full">
                     <TileLayer
                        url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
                     />
                     {gisData.map((pt) => {
                        let currentIcon = mapIconVerified;
                        if (pt.status === "PENDING") currentIcon = mapIconPending;
                        if (pt.status === "REJECTED") currentIcon = mapIconRejected;

                        if (!pt.lat || !pt.lng || !currentIcon) return null;

                        return (
                           <Marker key={pt.id} position={[pt.lat, pt.lng]} icon={currentIcon}>
                              <Popup>
                                 <div className="p-2 space-y-1 text-left">
                                    <p className="text-[10px] font-black text-[#1E40AF] uppercase leading-none font-mono">{pt.nop}</p>
                                    <h4 className="text-xs font-bold text-zinc-800 leading-tight">{pt.name}</h4>
                                    <p className="text-[10px] text-zinc-500 leading-normal">{pt.address}</p>
                                    <div className="pt-2 flex items-center justify-between">
                                       <span className={cn(
                                          "px-2 py-0.5 text-[8px] font-bold uppercase rounded border",
                                          pt.status === "VERIFIED" ? "bg-emerald-50 text-[#10B981] border-[#10B981]/25" :
                                          pt.status === "PENDING" ? "bg-amber-50 text-[#F59E0B] border-[#F59E0B]/25" :
                                          "bg-red-50 text-[#EF4444] border-[#EF4444]/25"
                                       )}>{pt.status}</span>
                                       <span className="text-[9px] font-mono font-bold text-zinc-700">{pt.isCompliant ? "Lunas" : "Tunggakan"}</span>
                                    </div>
                                 </div>
                              </Popup>
                           </Marker>
                        );
                     })}
                  </MapContainer>
               </div>
            </Card>
         </div>

         {/* Activity Log Column */}
         <div className="lg:col-span-4">
            <Card padding="md" className="bg-white border border-zinc-150 rounded-[1.5rem] shadow-sm flex flex-col h-full justify-between">
               <div className="space-y-6">
                  <div className="flex items-center justify-between border-b border-zinc-100 pb-3">
                     <div className="flex items-center gap-2">
                        <History className="w-5 h-5 text-[#1E40AF]" />
                        <h3 className="text-base font-black uppercase text-zinc-800">Aktivitas Petugas</h3>
                     </div>
                  </div>

                  <div className="space-y-4 max-h-[260px] overflow-y-auto pr-1 no-scrollbar">
                     {activities.length === 0 ? (
                        <div className="py-12 text-center text-zinc-300 italic font-bold">Belum ada aktivitas.</div>
                     ) : (
                        activities.slice(0, 4).map((act) => {
                           const actDetails = getLogDetails(act.action, act.table);
                           return (
                              <div key={act.id} className="flex gap-3 group transition-all">
                                 <div className={cn("w-9 h-9 rounded-lg flex items-center justify-center border border-zinc-100 flex-shrink-0", actDetails.color, actDetails.bg)}>
                                    <actDetails.icon className="w-4 h-4" />
                                 </div>
                                 <div className="space-y-0.5 text-left flex-1 min-w-0">
                                    <div className="flex items-center justify-between gap-2">
                                       <p className={cn("text-[9px] font-black uppercase tracking-wider leading-none", actDetails.color)}>{actDetails.label}</p>
                                       <span className="text-[8px] text-zinc-300 uppercase font-bold"><Clock className="w-2.5 h-2.5 inline mr-0.5" />{new Date(act.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                    </div>
                                    <h4 className="text-xs font-bold text-zinc-800 truncate leading-snug">Pembaruan data {act.table}</h4>
                                    <p className="text-[9px] text-zinc-400 font-semibold truncate">Oleh: {act.user.name ?? "Sistem"}</p>
                                 </div>
                              </div>
                           );
                        })
                     )}
                  </div>
               </div>

               <div className="pt-4 border-t border-zinc-100 mt-4">
                  <Link href="/dashboard/gis/pendataan" className="w-full">
                     <Button variant="outline" className="w-full flex justify-between items-center text-[9px] uppercase tracking-wider" size="sm" icon={<ArrowRight className="w-3.5 h-3.5" />}>
                        Buka Geo Pendataan
                     </Button>
                  </Link>
               </div>
            </Card>
         </div>
      </section>

    </div>
  );
};
