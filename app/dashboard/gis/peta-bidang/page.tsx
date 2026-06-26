"use client";

import { useEffect, useState, useMemo } from "react";
import dynamic from "next/dynamic";
import { Search, Map as MapIcon, Calendar, Filter, CheckCircle2, AlertCircle, Clock } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";

import type { MapContainerProps, TileLayerProps, MarkerProps, PopupProps, PolygonProps } from "react-leaflet";
import type { DivIcon } from "leaflet";

const MapContainer = dynamic<MapContainerProps>(() => import("react-leaflet").then((mod) => mod.MapContainer), { 
  ssr: false,
  loading: () => <div className="w-full h-[600px] bg-zinc-50 animate-pulse rounded-[3rem] flex items-center justify-center italic text-xs uppercase tracking-widest text-zinc-400">Memuat Komponen Peta...</div>
});
const TileLayer = dynamic<TileLayerProps>(() => import("react-leaflet").then((mod) => mod.TileLayer), { ssr: false });
const Marker = dynamic<MarkerProps>(() => import("react-leaflet").then((mod) => mod.Marker), { ssr: false });
const Popup = dynamic<PopupProps>(() => import("react-leaflet").then((mod) => mod.Popup), { ssr: false });
const Polygon = dynamic<PolygonProps>(() => import("react-leaflet").then((mod) => mod.Polygon), { ssr: false });

interface TaxObject {
  id: string;
  nop: string;
  name: string;
  type: string;
  address: string;
  luasTanah: number;
  luasBangun: number;
  njop: number;
  status: string;
  lat: number;
  lng: number;
  locations?: {
    polygonData: string;
  } | null;
  payments: Array<{
    status: string;
    expiredAt: string;
    taxPeriod: string;
  }>;
  owner: {
    name: string;
  };
}

export default function PetaBidangPage() {
  const [objects, setObjects] = useState<TaxObject[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [district, setDistrict] = useState("");
  const [statusPay, setStatusPay] = useState("");
  const [yearFilter, setYearFilter] = useState("2026");

  const [icons, setIcons] = useState<Record<string, DivIcon>>({});

  useEffect(() => {
    import("leaflet").then((L) => {
      const greenIcon = L.divIcon({
        className: "premium-marker",
        html: `<div class="marker-pulse bg-emerald-500/20"></div><svg class="absolute left-0 top-0 w-[26px] h-[36px]" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style="filter: drop-shadow(0 4px 6px rgba(0,0,0,0.35));"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" fill="#10b981" stroke="#ffffff" stroke-width="1.5" stroke-linejoin="round"/><circle cx="12" cy="9" r="2.5" fill="#ffffff"/></svg>`,
        iconSize: [26, 36],
        iconAnchor: [13, 36],
      });
      const yellowIcon = L.divIcon({
        className: "premium-marker",
        html: `<div class="marker-pulse bg-amber-500/20"></div><svg class="absolute left-0 top-0 w-[26px] h-[36px]" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style="filter: drop-shadow(0 4px 6px rgba(0,0,0,0.35));"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" fill="#f59e0b" stroke="#ffffff" stroke-width="1.5" stroke-linejoin="round"/><circle cx="12" cy="9" r="2.5" fill="#ffffff"/></svg>`,
        iconSize: [26, 36],
        iconAnchor: [13, 36],
      });
      const redIcon = L.divIcon({
        className: "premium-marker",
        html: `<div class="marker-pulse bg-red-500/20"></div><svg class="absolute left-0 top-0 w-[26px] h-[36px]" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style="filter: drop-shadow(0 4px 6px rgba(0,0,0,0.35));"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" fill="#ef4444" stroke="#ffffff" stroke-width="1.5" stroke-linejoin="round"/><circle cx="12" cy="9" r="2.5" fill="#ffffff"/></svg>`,
        iconSize: [26, 36],
        iconAnchor: [13, 36],
      });
      setIcons({ PAID: greenIcon, PENDING: yellowIcon, EXPIRED: redIcon });
    });

    fetch("/api/geodashboard/object-tax")
      .then(res => res.json())
      .then(json => {
        if (json.objects) setObjects(json.objects);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  const parsedObjects = useMemo(() => {
    return objects.map(o => {
      const lastPayment = o.payments[0];
      let paymentStatus = "PENDING";
      
      if (lastPayment) {
        if (lastPayment.status === "PAID") {
          paymentStatus = "PAID";
        } else {
          const isExpired = new Date(lastPayment.expiredAt).getTime() < Date.now();
          paymentStatus = isExpired ? "EXPIRED" : "PENDING";
        }
      }
      return { ...o, paymentStatus };
    });
  }, [objects]);

  const filtered = useMemo(() => {
    return parsedObjects.filter(o => {
      const matchSearch = o.nop.includes(search) || o.owner.name.toLowerCase().includes(search.toLowerCase()) || o.name.toLowerCase().includes(search.toLowerCase());
      const matchDistrict = district ? o.address.toLowerCase().includes(district.toLowerCase()) : true;
      const matchStatus = statusPay ? o.paymentStatus === statusPay : true;
      const matchYear = yearFilter ? (o.payments[0]?.taxPeriod === yearFilter) : true;
      return matchSearch && matchDistrict && matchStatus && matchYear;
    });
  }, [parsedObjects, search, district, statusPay, yearFilter]);

  if (loading) {
    return (
      <div className="h-[600px] flex flex-col items-center justify-center italic text-xs uppercase tracking-widest text-zinc-400">
        Menghubungkan layanan geospasial...
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

      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div>
          <div className="flex items-center gap-3 text-primary">
            <div className="w-10 h-0.5 bg-primary" />
            <p className="text-[10px] font-black uppercase tracking-[0.4em] italic">Geographic Information System</p>
          </div>
          <h1 className="text-4xl md:text-5xl font-black tracking-tighter uppercase italic mt-2">Peta Bidang <span className="text-primary italic">PBB.</span></h1>
          <p className="text-muted-foreground font-medium text-sm italic mt-2">Visualisasi bidang tanah, sebaran objek pajak daerah, dan status pembayaran wajib pajak.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Filters Sidebar */}
        <Card className="lg:col-span-1 p-6 space-y-6 bg-white border border-zinc-100 rounded-[2.5rem] shadow-sm overflow-visible relative z-30">
          <h3 className="font-black italic uppercase text-sm tracking-widest flex items-center gap-2 text-primary"><Filter className="w-4 h-4" /> Filter Peta</h3>
          
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase text-zinc-400">Cari Objek/NOP</label>
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                <input 
                  type="text" 
                  placeholder="NOP / Nama WP..." 
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-zinc-50 border border-zinc-100 rounded-xl outline-none focus:ring-2 focus:ring-primary/10 text-xs font-bold"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase text-zinc-400">Kecamatan</label>
              <select 
                value={district} 
                onChange={e => setDistrict(e.target.value)}
                className="w-full px-4 py-3 bg-zinc-50 border border-zinc-100 rounded-xl outline-none focus:ring-2 focus:ring-primary/10 text-xs font-bold"
              >
                <option value="">Semua Kecamatan</option>
                <option value="Medan Baru">Medan Baru</option>
                <option value="Medan Petisah">Medan Petisah</option>
                <option value="Medan Sunggal">Medan Sunggal</option>
                <option value="Medan Polonia">Medan Polonia</option>
                <option value="Medan Helvetia">Medan Helvetia</option>
                <option value="Medan Johor">Medan Johor</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase text-zinc-400">Status Pembayaran</label>
              <select 
                value={statusPay} 
                onChange={e => setStatusPay(e.target.value)}
                className="w-full px-4 py-3 bg-zinc-50 border border-zinc-100 rounded-xl outline-none focus:ring-2 focus:ring-primary/10 text-xs font-bold"
              >
                <option value="">Semua Status</option>
                <option value="PAID">Lunas (Hijau)</option>
                <option value="PENDING">Belum Jatuh Tempo (Kuning)</option>
                <option value="EXPIRED">Menunggak (Merah)</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase text-zinc-400">Tahun Pajak</label>
              <select 
                value={yearFilter} 
                onChange={e => setYearFilter(e.target.value)}
                className="w-full px-4 py-3 bg-zinc-50 border border-zinc-100 rounded-xl outline-none focus:ring-2 focus:ring-primary/10 text-xs font-bold"
              >
                <option value="2026">2026</option>
                <option value="2025">2025</option>
                <option value="2024">2024</option>
              </select>
            </div>
          </div>

          <div className="pt-4 border-t border-zinc-100 space-y-3">
            <div className="flex items-center gap-3 text-xs font-bold">
              <div className="w-3.5 h-3.5 bg-emerald-500 rounded-t-full rounded-bl-full rotate-45 border-2 border-white shadow-sm shrink-0" />
              <span>Lunas</span>
            </div>
            <div className="flex items-center gap-3 text-xs font-bold">
              <div className="w-3.5 h-3.5 bg-amber-500 rounded-t-full rounded-bl-full rotate-45 border-2 border-white shadow-sm shrink-0" />
              <span>Belum Jatuh Tempo</span>
            </div>
            <div className="flex items-center gap-3 text-xs font-bold">
              <div className="w-3.5 h-3.5 bg-red-500 rounded-t-full rounded-bl-full rotate-45 border-2 border-white shadow-sm shrink-0" />
              <span>Menunggak / Expired</span>
            </div>
          </div>
        </Card>

        {/* Map Container */}
        <Card padding="none" className="lg:col-span-3 h-[600px] rounded-[2.5rem] overflow-hidden border border-zinc-100 shadow-2xl relative">
          <MapContainer 
            center={[3.595, 98.672]} 
            zoom={13} 
            className="w-full h-full"
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            
            {filtered.map(o => {
              const latVal = o.lat ?? 3.595;
              const lngVal = o.lng ?? 98.672;
              let polyData = null;
              try {
                polyData = o.locations?.polygonData ? JSON.parse(o.locations.polygonData) : null;
              } catch { polyData = null; }
              const polyColor = o.paymentStatus === "PAID" ? "#10b981" : (o.paymentStatus === "PENDING" ? "#f59e0b" : "#ef4444");

              return (
                <div key={o.id}>
                  {icons[o.paymentStatus] && (
                    <Marker 
                      position={[latVal, lngVal]} 
                      icon={icons[o.paymentStatus]}
                    >
                      <Popup>
                        <div className="p-2 space-y-2 text-xs text-left">
                          <h4 className="font-black uppercase text-sm border-b pb-1 text-primary">{o.name}</h4>
                          <p><strong>NOP:</strong> {o.nop}</p>
                          <p><strong>Wajib Pajak:</strong> {o.owner.name}</p>
                          <p><strong>NJOP:</strong> Rp {Number(o.njop).toLocaleString("id-ID")}</p>
                          <p><strong>Luas:</strong> T: {o.luasTanah}m² / B: {o.luasBangun}m²</p>
                          <p className="flex items-center gap-1">
                            <strong>Status:</strong> 
                            <span className="font-bold uppercase" style={{ color: polyColor }}>
                              {o.paymentStatus === "PAID" ? "Lunas" : (o.paymentStatus === "PENDING" ? "Belum Jatuh Tempo" : "Menunggak")}
                            </span>
                          </p>
                        </div>
                      </Popup>
                    </Marker>
                  )}
                  {polyData && (
                    <Polygon 
                      positions={polyData} 
                      pathOptions={{ color: polyColor, fillColor: polyColor, fillOpacity: 0.2 }}
                    />
                  )}
                </div>
              );
            })}
          </MapContainer>
        </Card>
      </div>
    </div>
  );
}
