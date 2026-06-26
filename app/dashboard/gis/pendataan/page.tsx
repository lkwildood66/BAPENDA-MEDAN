"use client";

import { useEffect, useState, useMemo } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import { CheckCircle2, AlertCircle, Clock, MapPin, Eye, Upload, Save, HelpCircle, Activity, Loader2 } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { useToast } from "@/lib/hooks/use-toast";

import type { MapContainerProps, TileLayerProps, MarkerProps, PopupProps } from "react-leaflet";
import type { DivIcon } from "leaflet";

const MapContainer = dynamic<MapContainerProps>(() => import("react-leaflet").then((mod) => mod.MapContainer), { 
  ssr: false,
  loading: () => <div className="w-full h-[400px] bg-zinc-50 animate-pulse rounded-[3rem] flex items-center justify-center italic text-xs uppercase tracking-widest text-zinc-400">Memuat Komponen Peta...</div>
});
const TileLayer = dynamic<TileLayerProps>(() => import("react-leaflet").then((mod) => mod.TileLayer), { ssr: false });
const Marker = dynamic<MarkerProps>(() => import("react-leaflet").then((mod) => mod.Marker), { ssr: false });
const Popup = dynamic<PopupProps>(() => import("react-leaflet").then((mod) => mod.Popup), { ssr: false });

interface TaxObject {
  id: string;
  nop: string;
  name: string;
  type: string;
  address: string;
  lat: number;
  lng: number;
  status: string;
  owner: {
    name: string;
  };
}

interface Stats {
  verified: number;
  pending: number;
  rejected: number;
  newAdded: number;
  recentActivity: Array<{
    id: string;
    officer: string;
    action: string;
    timestamp: string;
    details: {
      status: string;
      latitude: number;
      longitude: number;
      note?: string;
    };
  }>;
}

export default function GeoPendataanPage() {
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

  const { toast } = useToast();
  const [objects, setObjects] = useState<TaxObject[]>([]);
  const [stats, setStats] = useState<Stats>({ verified: 0, pending: 0, rejected: 0, newAdded: 0, recentActivity: [] });
  const [loading, setLoading] = useState(true);
  const [selectedObj, setSelectedObj] = useState<TaxObject | null>(null);
  const [newStatus, setNewStatus] = useState("VERIFIED");
  const [latInput, setLatInput] = useState("");
  const [lngInput, setLngInput] = useState("");
  const [noteInput, setNoteInput] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const [icons, setIcons] = useState<Record<string, DivIcon>>({});

  if (status === "loading" || ((session?.user as any)?.role !== "ADMIN" && (session?.user as any)?.role !== "OFFICER")) {
     return (
        <div className="min-h-[60vh] flex items-center justify-center">
           <Loader2 className="w-12 h-12 text-[#1E40AF] animate-spin" />
        </div>
     );
  }

  const loadData = () => {
    Promise.all([
      fetch("/api/geodashboard/object-tax").then(res => res.json()),
      fetch("/api/geodashboard/statistics").then(res => res.json())
    ])
      .then(([objectsJson, statsJson]) => {
        if (objectsJson.objects) setObjects(objectsJson.objects);
        if (statsJson) setStats(statsJson);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  };

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
      setIcons({ VERIFIED: greenIcon, PENDING: yellowIcon, REJECTED: redIcon, ACTIVE: greenIcon });
    });

    loadData();
  }, []);

  const selectObjectForSurvey = (obj: TaxObject) => {
    setSelectedObj(obj);
    setNewStatus(obj.status === "ACTIVE" ? "VERIFIED" : obj.status);
    setLatInput(String(obj.lat ?? 3.595));
    setLngInput(String(obj.lng ?? 98.672));
    setNoteInput("");
    setImageUrl("");
  };

  const handleSurveySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedObj) return;

    setSubmitting(true);
    try {
      const res = await fetch("/api/geodashboard/survey", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          taxObjectId: selectedObj.id,
          status: newStatus,
          latitude: parseFloat(latInput),
          longitude: parseFloat(lngInput),
          image: imageUrl || "https://images.unsplash.com/photo-1582407947304-fd86f028f716?q=80&w=300",
          note: noteInput
        })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Gagal menyimpan survey");

      toast("Sukses", "Data survey lapangan berhasil disimpan dan status terverifikasi.", "success");
      setSelectedObj(null);
      loadData();
    } catch (err) {
      const message = err instanceof Error ? err.message : "Gagal menyimpan survey";
      toast("Error", message, "error");
    } finally {
      setSubmitting(false);
    }
  };

  const pendingList = useMemo(() => {
    return objects.filter(o => o.status === "PENDING").slice(0, 5);
  }, [objects]);

  if (loading) {
    return (
      <div className="h-[600px] flex flex-col items-center justify-center italic text-xs uppercase tracking-widest text-zinc-400">
        Menghubungkan layanan Geo Pendataan...
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
          <p className="text-[10px] font-black uppercase tracking-[0.4em] italic">Survey & Data Collection Dashboard</p>
        </div>
        <h1 className="text-4xl md:text-5xl font-black tracking-tighter uppercase italic mt-2">Geo Pendataan <span className="text-primary italic">Lapangan.</span></h1>
        <p className="text-muted-foreground font-medium text-sm italic mt-2">Monitoring aktivitas pendaftaran objek pajak baru dan pembaharuan verifikasi bidang tanah oleh petugas Bapenda.</p>
      </div>

      {/* Aggregate Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="p-6 bg-white border border-zinc-100 rounded-[2rem] shadow-sm flex items-center justify-between">
          <div>
            <p className="text-[10px] font-black uppercase text-zinc-400">Terverifikasi</p>
            <h4 className="text-3xl font-black text-emerald-500 italic mt-1">{stats.verified}</h4>
          </div>
          <CheckCircle2 className="w-8 h-8 text-emerald-100" />
        </Card>

        <Card className="p-6 bg-white border border-zinc-100 rounded-[2rem] shadow-sm flex items-center justify-between">
          <div>
            <p className="text-[10px] font-black uppercase text-zinc-400">Belum Verifikasi</p>
            <h4 className="text-3xl font-black text-amber-500 italic mt-1">{stats.pending}</h4>
          </div>
          <Clock className="w-8 h-8 text-amber-100 animate-pulse" />
        </Card>

        <Card className="p-6 bg-white border border-zinc-100 rounded-[2rem] shadow-sm flex items-center justify-between">
          <div>
            <p className="text-[10px] font-black uppercase text-zinc-400">Bermasalah / Tolak</p>
            <h4 className="text-3xl font-black text-red-500 italic mt-1">{stats.rejected}</h4>
          </div>
          <AlertCircle className="w-8 h-8 text-red-100" />
        </Card>

        <Card className="p-6 bg-white border border-zinc-100 rounded-[2rem] shadow-sm flex items-center justify-between">
          <div>
            <p className="text-[10px] font-black uppercase text-zinc-400">Baru (30 Hari Terakhir)</p>
            <h4 className="text-3xl font-black text-blue-500 italic mt-1">+{stats.newAdded}</h4>
          </div>
          <Activity className="w-8 h-8 text-blue-100" />
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Side: Leaflet map & activity */}
        <div className="lg:col-span-2 space-y-8">
          <Card padding="none" className="h-[400px] rounded-[2.5rem] overflow-hidden border border-zinc-100 shadow-2xl relative">
            <MapContainer 
              center={[3.595, 98.672]} 
              zoom={13} 
              className="w-full h-full"
            >
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />

              {objects.map(o => {
                const latVal = o.lat ?? 3.595;
                const lngVal = o.lng ?? 98.672;
                const objIcon = icons[o.status] || icons.PENDING;

                return (
                  objIcon && (
                    <Marker 
                      key={o.id}
                      position={[latVal, lngVal]} 
                      icon={objIcon}
                    >
                      <Popup>
                        <div className="p-2 space-y-2 text-xs text-left">
                          <h4 className="font-black uppercase text-sm border-b pb-1 text-primary">{o.name}</h4>
                          <p><strong>NOP:</strong> {o.nop}</p>
                          <p><strong>Alamat:</strong> {o.address}</p>
                          <p><strong>Status:</strong> <span className="font-bold">{o.status}</span></p>
                          <Button 
                            variant="outline" 
                            size="sm"
                            className="w-full h-8 mt-2 text-[9px] uppercase font-black tracking-widest rounded-lg"
                            onClick={() => selectObjectForSurvey(o)}
                          >
                            Survey Objek
                          </Button>
                        </div>
                      </Popup>
                    </Marker>
                  )
                );
              })}
            </MapContainer>
          </Card>

          {/* Activity Log */}
          <Card className="p-8 bg-white border border-zinc-100 rounded-[3rem] shadow-sm">
            <h3 className="font-black italic uppercase text-sm tracking-widest mb-6 flex items-center gap-2 text-primary"><Activity className="w-5 h-5" /> Riwayat Aktivitas Petugas</h3>
            <div className="space-y-4 max-h-60 overflow-y-auto no-scrollbar">
              {stats.recentActivity.map((log) => (
                <div key={log.id} className="flex justify-between items-start border-b border-zinc-50 pb-4 text-xs">
                  <div>
                    <p className="font-black text-foreground">{log.officer} <span className="text-zinc-400 font-medium">memverifikasi</span> NOP</p>
                    <p className="text-[10px] text-primary font-mono mt-0.5">Status: {log.details.status}</p>
                    {log.details.note && <p className="text-[10px] italic text-zinc-400 mt-1">&quot;{log.details.note}&quot;</p>}
                  </div>
                  <span className="text-[9px] font-black uppercase text-zinc-300 italic">{new Date(log.timestamp).toLocaleDateString("id-ID")}</span>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Right Side: Survey Form */}
        <div className="space-y-8">
          <Card className="p-8 bg-white border border-zinc-100 rounded-[3rem] shadow-sm overflow-visible relative z-30">
            <h3 className="font-black italic uppercase text-sm tracking-widest mb-6 text-primary flex items-center gap-2"><MapPin className="w-5 h-5 animate-bounce" /> Input Verifikasi Survey</h3>
            
            {selectedObj ? (
              <form onSubmit={handleSurveySubmit} className="space-y-5 text-xs font-bold">
                <div className="bg-zinc-50 p-4 rounded-2xl space-y-1">
                  <p className="text-[10px] font-black text-zinc-400 uppercase">Objek Terpilih</p>
                  <p className="font-black text-foreground text-sm">{selectedObj.name}</p>
                  <p className="font-mono text-primary text-[10px]">{selectedObj.nop}</p>
                  <p className="text-zinc-500 font-medium leading-relaxed mt-1">{selectedObj.address}</p>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase text-zinc-400">Ubah Status</label>
                  <select 
                    value={newStatus}
                    onChange={e => setNewStatus(e.target.value)}
                    className="w-full px-4 py-3 bg-zinc-50 border border-zinc-100 rounded-xl outline-none focus:ring-2 focus:ring-primary/10"
                  >
                    <option value="VERIFIED">VERIFIED (Terverifikasi)</option>
                    <option value="PENDING">PENDING (Tunda / Perlu Data)</option>
                    <option value="REJECTED">REJECTED (Bermasalah / Ditolak)</option>
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase text-zinc-400">Latitude</label>
                    <input 
                      type="text" 
                      value={latInput}
                      onChange={e => setLatInput(e.target.value)}
                      className="w-full px-4 py-3 bg-zinc-50 border border-zinc-100 rounded-xl outline-none focus:ring-2 focus:ring-primary/10"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase text-zinc-400">Longitude</label>
                    <input 
                      type="text" 
                      value={lngInput}
                      onChange={e => setLngInput(e.target.value)}
                      className="w-full px-4 py-3 bg-zinc-50 border border-zinc-100 rounded-xl outline-none focus:ring-2 focus:ring-primary/10"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase text-zinc-400">Link Foto Survey Lapangan</label>
                  <div className="relative">
                    <Upload className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                    <input 
                      type="text" 
                      placeholder="https://..." 
                      value={imageUrl}
                      onChange={e => setImageUrl(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 bg-zinc-50 border border-zinc-100 rounded-xl outline-none focus:ring-2 focus:ring-primary/10"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase text-zinc-400">Catatan Survey</label>
                  <textarea 
                    rows={3}
                    placeholder="Masukkan catatan pendataan..." 
                    value={noteInput}
                    onChange={e => setNoteInput(e.target.value)}
                    className="w-full px-4 py-3 bg-zinc-50 border border-zinc-100 rounded-xl outline-none focus:ring-2 focus:ring-primary/10"
                  />
                </div>

                <div className="flex gap-4 pt-2">
                  <Button 
                    type="submit" 
                    loading={submitting}
                    className="flex-1 h-14 rounded-xl btn-premium font-black uppercase text-[10px] tracking-widest flex items-center justify-center gap-2"
                  >
                    Simpan <Save className="w-4 h-4" />
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={() => setSelectedObj(null)}
                    className="h-14 px-6 rounded-xl text-[10px]"
                  >
                    Batal
                  </Button>
                </div>
              </form>
            ) : (
              <div className="py-20 text-center space-y-4">
                <HelpCircle className="w-16 h-16 mx-auto text-zinc-200" />
                <h4 className="font-black italic uppercase text-sm tracking-widest">Pilih Objek Pajak</h4>
                <p className="text-muted-foreground leading-relaxed text-xs">Pilih salah satu objek pajak dari daftar belum terverifikasi di bawah ini atau klik marker di peta untuk memulai survey lapangan.</p>
              </div>
            )}
          </Card>

          {/* List of Pending Objects */}
          <Card className="p-8 bg-white border border-zinc-100 rounded-[3rem] shadow-sm">
            <h3 className="font-black italic uppercase text-sm tracking-widest mb-6 text-primary flex items-center gap-2"><Clock className="w-5 h-5 text-amber-500 animate-pulse" /> Antrean Survey</h3>
            <div className="space-y-3">
              {pendingList.length === 0 ? (
                <p className="text-xs font-bold text-zinc-400 text-center py-6 italic">Tidak ada antrean survey aktif.</p>
              ) : (
                pendingList.map(obj => (
                  <div 
                    key={obj.id} 
                    onClick={() => selectObjectForSurvey(obj)}
                    className="p-4 bg-zinc-50 hover:bg-zinc-100 rounded-2xl cursor-pointer flex justify-between items-center transition-all group border border-transparent hover:border-primary/10"
                  >
                    <div className="text-left space-y-0.5">
                      <p className="font-black text-foreground group-hover:text-primary transition-colors text-xs">{obj.name}</p>
                      <p className="text-[9px] text-zinc-400 font-mono italic">NOP: {obj.nop}</p>
                    </div>
                    <Eye className="w-4 h-4 text-zinc-300 group-hover:text-primary transition-colors" />
                  </div>
                ))
              )}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
