"use client";

import { useEffect, useState, useMemo } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import { TrendingUp, DollarSign, Building, Percent, MapPin, Filter, BarChart3, Loader2 } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { PremiumChart } from "@/components/ui/PremiumChart";

import type { MapContainerProps, TileLayerProps, MarkerProps, PopupProps } from "react-leaflet";
import type { DivIcon } from "leaflet";

const MapContainer = dynamic<MapContainerProps>(() => import("react-leaflet").then((mod) => mod.MapContainer), { 
  ssr: false,
  loading: () => <div className="w-full h-[500px] bg-zinc-50 animate-pulse rounded-[3rem] flex items-center justify-center italic text-xs uppercase tracking-widest text-zinc-400">Memuat Komponen Peta...</div>
});
const TileLayer = dynamic<TileLayerProps>(() => import("react-leaflet").then((mod) => mod.TileLayer), { ssr: false });
const Marker = dynamic<MarkerProps>(() => import("react-leaflet").then((mod) => mod.Marker), { ssr: false });
const Popup = dynamic<PopupProps>(() => import("react-leaflet").then((mod) => mod.Popup), { ssr: false });

interface Property {
  id: string;
  propertyType: string;
  address: string;
  district: string;
  village: string;
  marketPrice: number;
  landArea: number;
  buildingArea: number;
  latitude: number;
  longitude: number;
  source: string;
  recordedAt: string;
}

interface Stats {
  avgMarketPrice: number;
  avgNJOP: number;
  pctDiff: number;
}

export default function PasarPropertiPage() {
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

  const [properties, setProperties] = useState<Property[]>([]);
  const [stats, setStats] = useState<Stats>({ avgMarketPrice: 0, avgNJOP: 0, pctDiff: 0 });
  const [loading, setLoading] = useState(true);
  const [typeFilter, setTypeFilter] = useState("");
  const [customIcon, setCustomIcon] = useState<DivIcon | undefined>(undefined);

  if (status === "loading" || ((session?.user as any)?.role !== "ADMIN" && (session?.user as any)?.role !== "OFFICER")) {
     return (
        <div className="min-h-[60vh] flex items-center justify-center">
           <Loader2 className="w-12 h-12 text-[#1E40AF] animate-spin" />
        </div>
     );
  }

  useEffect(() => {
    import("leaflet").then((L) => {
      const icon = L.divIcon({
        className: "premium-marker",
        html: `<div class="marker-pulse bg-blue-500/20"></div><svg class="absolute left-0 top-0 w-[26px] h-[36px]" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style="filter: drop-shadow(0 4px 6px rgba(0,0,0,0.35));"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" fill="#3b82f6" stroke="#ffffff" stroke-width="1.5" stroke-linejoin="round"/><circle cx="12" cy="9" r="2.5" fill="#ffffff"/></svg>`,
        iconSize: [26, 36],
        iconAnchor: [13, 36],
      });
      setCustomIcon(icon);
    });

    fetch("/api/gis/pasar-properti")
      .then(res => res.json())
      .then(json => {
        if (json.properties) setProperties(json.properties);
        if (json.statistics) setStats(json.statistics);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  const filtered = useMemo(() => {
    return properties.filter(p => typeFilter ? p.propertyType === typeFilter : true);
  }, [properties, typeFilter]);

  // Chart data formatting
  const chartData = useMemo(() => {
    const districts = Array.from(new Set(properties.map(p => p.district)));
    return districts.map(dist => {
      const distProps = properties.filter(p => p.district === dist);
      const avgPrice = distProps.reduce((acc, curr) => acc + Number(curr.marketPrice), 0) / distProps.length;
      return {
        label: dist,
        value: Math.round(avgPrice / 1000000) // in millions
      };
    });
  }, [properties]);

  if (loading) {
    return (
      <div className="h-[600px] flex flex-col items-center justify-center italic text-xs uppercase tracking-widest text-zinc-400">
        Menghubungkan layanan pasar properti...
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
          <p className="text-[10px] font-black uppercase tracking-[0.4em] italic">Real Estate & Market Analytics</p>
        </div>
        <h1 className="text-4xl md:text-5xl font-black tracking-tighter uppercase italic mt-2">Pasar Properti <span className="text-primary italic">Medan.</span></h1>
        <p className="text-muted-foreground font-medium text-sm italic mt-2">Analisis sebaran nilai transaksi properti pembanding dan deviasi persentasenya terhadap NJOP resmi Bapenda.</p>
      </div>

      {/* Comparison Aggregations */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="p-6 bg-white border border-zinc-100 rounded-[2rem] shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 bg-blue-50 text-blue-500 rounded-2xl flex items-center justify-center">
            <DollarSign className="w-6 h-6" />
          </div>
          <div>
            <p className="text-[10px] font-black uppercase text-zinc-400">Harga Pasar Rata-rata</p>
            <h4 className="text-2xl font-black text-foreground italic uppercase mt-1">Rp {Math.round(stats.avgMarketPrice / 1000000).toLocaleString("id-ID")} JT</h4>
            <p className="text-xs font-bold text-zinc-500 mt-0.5">Berdasarkan survey lapangan & portal properti</p>
          </div>
        </Card>

        <Card className="p-6 bg-white border border-zinc-100 rounded-[2rem] shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 bg-indigo-50 text-indigo-500 rounded-2xl flex items-center justify-center">
            <Building className="w-6 h-6" />
          </div>
          <div>
            <p className="text-[10px] font-black uppercase text-zinc-400">NJOP Rata-rata</p>
            <h4 className="text-2xl font-black text-foreground italic uppercase mt-1">Rp {Math.round(stats.avgNJOP / 1000000).toLocaleString("id-ID")} JT</h4>
            <p className="text-xs font-bold text-zinc-500 mt-0.5">Penilaian NJOP PBB-P2 aktif</p>
          </div>
        </Card>

        <Card className="p-6 bg-white border border-zinc-100 rounded-[2rem] shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 bg-amber-50 text-amber-500 rounded-2xl flex items-center justify-center">
            <Percent className="w-6 h-6" />
          </div>
          <div>
            <p className="text-[10px] font-black uppercase text-zinc-400">Selisih Persentase (Gap)</p>
            <h4 className="text-2xl font-black text-amber-600 italic uppercase mt-1">+{Math.round(stats.pctDiff)}%</h4>
            <p className="text-xs font-bold text-zinc-500 mt-0.5">Harga pasar di atas NJOP resmi</p>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Sidebar Controls */}
        <Card className="lg:col-span-1 p-6 space-y-6 bg-white border border-zinc-100 rounded-[2.5rem] shadow-sm overflow-visible relative z-30">
          <h3 className="font-black italic uppercase text-sm tracking-widest flex items-center gap-2 text-primary"><Filter className="w-4 h-4" /> Filter Properti</h3>
          
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase text-zinc-400">Jenis Properti</label>
              <select 
                value={typeFilter} 
                onChange={e => setTypeFilter(e.target.value)}
                className="w-full px-4 py-3 bg-zinc-50 border border-zinc-100 rounded-xl outline-none focus:ring-2 focus:ring-primary/10 text-xs font-bold"
              >
                <option value="">Semua Jenis</option>
                <option value="RUMAH">RUMAH</option>
                <option value="RUKO">RUKO</option>
                <option value="TANAH">TANAH</option>
              </select>
            </div>
          </div>

          <div className="pt-4 border-t border-zinc-100">
            <p className="text-[10px] font-black uppercase text-zinc-400 mb-2">Pemberi Data</p>
            <span className="px-3 py-1.5 bg-zinc-100 text-zinc-600 rounded-lg text-[9px] font-black uppercase tracking-widest inline-block mr-2 mb-2">Rumah123</span>
            <span className="px-3 py-1.5 bg-zinc-100 text-zinc-600 rounded-lg text-[9px] font-black uppercase tracking-widest inline-block mr-2 mb-2">OLX</span>
            <span className="px-3 py-1.5 bg-zinc-100 text-zinc-600 rounded-lg text-[9px] font-black uppercase tracking-widest inline-block mr-2 mb-2">Survey Bapenda</span>
          </div>
        </Card>

        {/* Leaflet Map */}
        <Card padding="none" className="lg:col-span-3 h-[500px] rounded-[2.5rem] overflow-hidden border border-zinc-100 shadow-2xl relative">
          <MapContainer 
            center={[3.595, 98.672]} 
            zoom={13} 
            className="w-full h-full"
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />

            {filtered.map(p => {
              const latVal = p.latitude || 3.595;
              const lngVal = p.longitude || 98.672;

              return (
                customIcon && (
                  <Marker 
                    key={p.id}
                    position={[latVal, lngVal]} 
                    icon={customIcon}
                  >
                    <Popup>
                      <div className="p-2 space-y-2 text-xs text-left">
                        <h4 className="font-black uppercase text-sm border-b pb-1 text-primary">{p.propertyType} - {p.address}</h4>
                        <p><strong>Wilayah:</strong> Kec. {p.district}, Kel. {p.village}</p>
                        <p><strong>Harga Pasar:</strong> Rp {Number(p.marketPrice).toLocaleString("id-ID")}</p>
                        <p><strong>Luas:</strong> T: {p.landArea}m² / B: {p.buildingArea}m²</p>
                        <p><strong>Sumber Data:</strong> {p.source}</p>
                      </div>
                    </Popup>
                  </Marker>
                )
              );
            })}
          </MapContainer>
        </Card>
      </div>

      {/* Chart Section */}
      <Card className="p-10 bg-white border border-zinc-100 rounded-[3rem] shadow-sm">
        <PremiumChart 
          data={chartData}
          title="Perbandingan Harga Pasar Rata-Rata Properti"
          subtitle="Grafik Nilai Pasar Berdasarkan Wilayah Kecamatan (Dalam Jutaan Rupiah)"
        />
      </Card>
    </div>
  );
}
