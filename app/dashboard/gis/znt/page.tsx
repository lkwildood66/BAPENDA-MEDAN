"use client";

import { useEffect, useState, useMemo } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import { Layers, MapPin, TrendingUp, TrendingDown, Landmark, Map as MapIcon, Filter, Loader2 } from "lucide-react";
import { Card } from "@/components/ui/Card";

import type { MapContainerProps, TileLayerProps, PolygonProps, PopupProps } from "react-leaflet";

const MapContainer = dynamic<MapContainerProps>(() => import("react-leaflet").then((mod) => mod.MapContainer), { 
  ssr: false,
  loading: () => <div className="w-full h-[550px] bg-zinc-50 animate-pulse rounded-[3rem] flex items-center justify-center italic text-xs uppercase tracking-widest text-zinc-400">Memuat Komponen Peta...</div>
});
const TileLayer = dynamic<TileLayerProps>(() => import("react-leaflet").then((mod) => mod.TileLayer), { ssr: false });
const Polygon = dynamic<PolygonProps>(() => import("react-leaflet").then((mod) => mod.Polygon), { ssr: false });
const Popup = dynamic<PopupProps>(() => import("react-leaflet").then((mod) => mod.Popup), { ssr: false });

interface Zone {
  id: string;
  zoneCode: string;
  zoneName: string;
  polygonData: string;
  valuePerMeter: number;
  district: string;
  village: string;
  taxObjectCount: number;
  avgNJOP: number;
}

export default function ZNTPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "authenticated") {
      const role = (session?.user as any)?.role;
      if (role !== "ADMIN" && role !== "OFFICER") {
        router.replace("/dashboard");
      }
    }
  }, [session, status, router]);

  const [zones, setZones] = useState<Zone[]>([]);
  const [loading, setLoading] = useState(true);
  const [districtFilter, setDistrictFilter] = useState("");

  // Fetch data (runs once on mount, safe guard inside)
  useEffect(() => {
    import("leaflet");
    if (status !== "authenticated") return;
    if ((session?.user as any)?.role !== "ADMIN" && (session?.user as any)?.role !== "OFFICER") return;
    fetch("/api/gis/znt")
      .then(res => res.json())
      .then(json => {
        if (json.zones) setZones(json.zones);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, [status, session]);

  const filteredZones = useMemo(() => {
    return zones.filter(z => districtFilter ? z.district.toLowerCase() === districtFilter.toLowerCase() : true);
  }, [zones, districtFilter]);

  const analytics = useMemo(() => {
    if (zones.length === 0) return { highest: null, lowest: null, averageNJOP: 0 };
    
    const sorted = [...zones].sort((a, b) => Number(b.valuePerMeter) - Number(a.valuePerMeter));
    const highest = sorted[0];
    const lowest = sorted[sorted.length - 1];
    
    const totalNJOP = zones.reduce((acc, z) => acc + Number(z.avgNJOP), 0);
    const averageNJOP = totalNJOP / zones.length;

    return { highest, lowest, averageNJOP };
  }, [zones]);

  const getZoneStyle = (val: number) => {
    if (val >= 6000000) {
      return { color: "#ef4444", fillColor: "#f87171" };
    } else if (val >= 4000000) {
      return { color: "#f59e0b", fillColor: "#fbbf24" };
    } else {
      return { color: "#10b981", fillColor: "#34d399" };
    }
  };

  if (status === "loading" || ((session?.user as any)?.role !== "ADMIN" && (session?.user as any)?.role !== "OFFICER")) {
     return (
        <div className="min-h-[60vh] flex items-center justify-center">
           <Loader2 className="w-12 h-12 text-[#1E40AF] animate-spin" />
        </div>
     );
  }

  if (loading) {
    return (
      <div className="h-[600px] flex flex-col items-center justify-center italic text-xs uppercase tracking-widest text-zinc-400">
        Menghubungkan layanan ZNT...
      </div>
    );
  }

  return (
    <div className="space-y-10 text-left max-w-7xl mx-auto">
      <link 
        rel="stylesheet" 
        href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"
        integrity="sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY="
        crossOrigin=""
      />

      <div>
        <div className="flex items-center gap-3 text-primary">
          <div className="w-10 h-0.5 bg-primary" />
          <p className="text-[10px] font-black uppercase tracking-[0.4em] italic">Geoanalytics & Spatial Economics</p>
        </div>
        <h1 className="text-4xl md:text-5xl font-black tracking-tighter uppercase italic mt-2">Zona Nilai Tanah <span className="text-primary italic">(ZNT).</span></h1>
        <p className="text-muted-foreground font-medium text-sm italic mt-2">Peta tematik pembagian zona nilai tanah berdasarkan transaksi riil dan penilaian massal Bapenda.</p>
      </div>

      {/* Analytics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="p-6 bg-white border border-zinc-100 rounded-[2rem] shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 bg-red-50 text-red-500 rounded-2xl flex items-center justify-center">
            <TrendingUp className="w-6 h-6" />
          </div>
          <div>
            <p className="text-[10px] font-black uppercase text-zinc-400">Zona Nilai Tertinggi</p>
            <h4 className="text-lg font-black text-foreground italic uppercase mt-1">{analytics.highest?.zoneCode || "-"}</h4>
            <p className="text-xs font-bold text-zinc-500 mt-0.5">Rp {Number(analytics.highest?.valuePerMeter || 0).toLocaleString("id-ID")}/m²</p>
          </div>
        </Card>

        <Card className="p-6 bg-white border border-zinc-100 rounded-[2rem] shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 bg-emerald-50 text-emerald-500 rounded-2xl flex items-center justify-center">
            <TrendingDown className="w-6 h-6" />
          </div>
          <div>
            <p className="text-[10px] font-black uppercase text-zinc-400">Zona Nilai Terendah</p>
            <h4 className="text-lg font-black text-foreground italic uppercase mt-1">{analytics.lowest?.zoneCode || "-"}</h4>
            <p className="text-xs font-bold text-zinc-500 mt-0.5">Rp {Number(analytics.lowest?.valuePerMeter || 0).toLocaleString("id-ID")}/m²</p>
          </div>
        </Card>

        <Card className="p-6 bg-white border border-zinc-100 rounded-[2rem] shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 bg-blue-50 text-blue-500 rounded-2xl flex items-center justify-center">
            <Landmark className="w-6 h-6" />
          </div>
          <div>
            <p className="text-[10px] font-black uppercase text-zinc-400">Rata-rata NJOP Kota</p>
            <h4 className="text-lg font-black text-foreground italic uppercase mt-1">Medan Area</h4>
            <p className="text-xs font-bold text-zinc-500 mt-0.5">Rp {Math.round(analytics.averageNJOP).toLocaleString("id-ID")}/m²</p>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Sidebar Controls */}
        <Card className="lg:col-span-1 p-6 space-y-6 bg-white border border-zinc-100 rounded-[2.5rem] shadow-sm overflow-visible relative z-30">
          <h3 className="font-black italic uppercase text-sm tracking-widest flex items-center gap-2 text-primary"><Filter className="w-4 h-4" /> Filter Wilayah</h3>
          
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase text-zinc-400">Kecamatan</label>
              <select 
                value={districtFilter} 
                onChange={e => setDistrictFilter(e.target.value)}
                className="w-full px-4 py-3 bg-zinc-50 border border-zinc-100 rounded-xl outline-none focus:ring-2 focus:ring-primary/10 text-xs font-bold"
              >
                <option value="">Semua Kecamatan</option>
                <option value="Medan Baru">Medan Baru</option>
                <option value="Medan Petisah">Medan Petisah</option>
                <option value="Medan Sunggal">Medan Sunggal</option>
                <option value="Medan Polonia">Medan Polonia</option>
                <option value="Medan Helvetia">Medan Helvetia</option>
              </select>
            </div>
          </div>

          <div className="pt-4 border-t border-zinc-100 space-y-3">
            <p className="text-[10px] font-black uppercase text-zinc-400">Legenda Indikator Harga / m²</p>
            <div className="flex items-center gap-3 text-xs font-bold">
              <div className="w-4 h-4 bg-red-400 rounded-lg shrink-0" />
              <span>&gt;= Rp 6.000.000 (Sangat Tinggi)</span>
            </div>
            <div className="flex items-center gap-3 text-xs font-bold">
              <div className="w-4 h-4 bg-amber-400 rounded-lg shrink-0" />
              <span>Rp 4.000.000 - Rp 6.000.000 (Sedang)</span>
            </div>
            <div className="flex items-center gap-3 text-xs font-bold">
              <div className="w-4 h-4 bg-emerald-400 rounded-lg shrink-0" />
              <span>&lt; Rp 4.000.000 (Rendah)</span>
            </div>
          </div>
        </Card>

        {/* Leaflet Map */}
        <Card padding="none" className="lg:col-span-3 h-[550px] rounded-[2.5rem] overflow-hidden border border-zinc-100 shadow-2xl relative">
          <MapContainer 
            center={[3.595, 98.672]} 
            zoom={13} 
            className="w-full h-full"
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />

            {filteredZones.map(z => {
              const polyCoords = JSON.parse(z.polygonData);
              const theme = getZoneStyle(Number(z.valuePerMeter));

              return (
                <Polygon 
                  key={z.id}
                  positions={polyCoords}
                  pathOptions={{ color: theme.color, fillColor: theme.fillColor, fillOpacity: 0.4 }}
                >
                  <Popup>
                    <div className="p-2 space-y-2 text-xs text-left">
                      <h4 className="font-black uppercase text-sm border-b pb-1 text-primary">{z.zoneName}</h4>
                      <p><strong>Kode Zona:</strong> {z.zoneCode}</p>
                      <p><strong>Kecamatan:</strong> {z.district}</p>
                      <p><strong>Kelurahan:</strong> {z.village}</p>
                      <p><strong>Nilai Tanah / m²:</strong> Rp {Number(z.valuePerMeter).toLocaleString("id-ID")}</p>
                      <p><strong>Jumlah Objek Pajak:</strong> {z.taxObjectCount} Objek</p>
                      <p><strong>Rata-rata NJOP:</strong> Rp {Number(z.avgNJOP).toLocaleString("id-ID")}/m²</p>
                    </div>
                  </Popup>
                </Polygon>
              );
            })}
          </MapContainer>
        </Card>
      </div>
    </div>
  );
}
