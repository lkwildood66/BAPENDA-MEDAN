"use client";

import { useEffect, useState, useMemo, useCallback } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Scale, TrendingUp, TrendingDown, Clock, Search, HelpCircle, Save, Plus, ArrowUpRight, ArrowDownRight, Loader2 } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { useToast } from "@/lib/hooks/use-toast";

interface TaxObject {
  id: string;
  nop: string;
  name: string;
  njop: number;
  address: string;
}

interface Assessment {
  id: string;
  objectTaxId: string;
  oldNJOP: number;
  newNJOP: number;
  assessmentReason: string;
  assessmentDate: string;
  objectTax: {
    nop: string;
    name: string;
    type: string;
  };
  assessor: {
    name: string;
  };
}

interface Analytics {
  topIncreases: Array<{
    id: string;
    nop: string;
    name: string;
    oldNJOP: number;
    newNJOP: number;
    diff: number;
    pct: number;
  }>;
  topDecreases: Array<{
    id: string;
    nop: string;
    name: string;
    oldNJOP: number;
    newNJOP: number;
    diff: number;
    pct: number;
  }>;
}

export default function GeoPenilaianPage() {
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
  const [assessments, setAssessments] = useState<Assessment[]>([]);
  const [analytics, setAnalytics] = useState<Analytics>({ topIncreases: [], topDecreases: [] });
  const [objects, setObjects] = useState<TaxObject[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedObj, setSelectedObj] = useState<TaxObject | null>(null);
  const [newNjopInput, setNewNjopInput] = useState("");
  const [reasonInput, setReasonInput] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const loadData = useCallback(() => {
    if (status !== "authenticated") return;
    const role = (session?.user as any)?.role;
    if (role !== "ADMIN" && role !== "OFFICER") return;
    Promise.all([
      fetch("/api/geodashboard/object-tax").then(res => res.json()),
      fetch("/api/gis/assessments").then(res => res.json())
    ])
      .then(([objectsJson, assessmentsJson]) => {
        if (objectsJson.objects) setObjects(objectsJson.objects);
        if (assessmentsJson.assessments) setAssessments(assessmentsJson.assessments);
        if (assessmentsJson.analytics) setAnalytics(assessmentsJson.analytics);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, [status, session]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  if (status === "loading" || ((session?.user as any)?.role !== "ADMIN" && (session?.user as any)?.role !== "OFFICER")) {
     return (
        <div className="min-h-[60vh] flex items-center justify-center">
           <Loader2 className="w-12 h-12 text-[#1E40AF] animate-spin" />
        </div>
     );
  }

  const handleAssessmentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedObj) return;

    setSubmitting(true);
    try {
      const res = await fetch("/api/gis/assessments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          objectTaxId: selectedObj.id,
          newNJOP: parseFloat(newNjopInput),
          reason: reasonInput
        })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Gagal memproses penilaian");

      toast("Sukses", "Penilaian ulang NJOP berhasil disimpan.", "success");
      setSelectedObj(null);
      loadData();
    } catch (err) {
      const message = err instanceof Error ? err.message : "Gagal memproses penilaian";
      toast("Error", message, "error");
    } finally {
      setSubmitting(false);
    }
  };

  const selectObjectForValuation = (obj: TaxObject) => {
    setSelectedObj(obj);
    setNewNjopInput(String(obj.njop));
    setReasonInput("");
  };

  const filteredObjects = useMemo(() => {
    return searchQuery
      ? objects.filter(o => o.nop.includes(searchQuery) || o.name.toLowerCase().includes(searchQuery.toLowerCase()))
      : objects.slice(0, 5);
  }, [objects, searchQuery]);

  if (loading) {
    return (
      <div className="h-[600px] flex flex-col items-center justify-center italic text-xs uppercase tracking-widest text-zinc-400">
        Menghubungkan pusat penilaian...
      </div>
    );
  }

  return (
    <div className="space-y-10 text-left max-w-7xl mx-auto">
      <div>
        <div className="flex items-center gap-3 text-primary">
          <div className="w-10 h-0.5 bg-primary" />
          <p className="text-[10px] font-black uppercase tracking-[0.4em] italic">Property Valuation & Appraisals</p>
        </div>
        <h1 className="text-4xl md:text-5xl font-black tracking-tighter uppercase italic mt-2">Geo Penilaian <span className="text-primary italic">Individual.</span></h1>
        <p className="text-muted-foreground font-medium text-sm italic mt-2">Pusat penilaian ulang NJOP untuk objek pajak potensial khusus demi keadilan perpajakan berbasis data spasial.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left: Input Form & Revaluation Finder */}
        <div className="space-y-8 lg:col-span-1">
          <Card className="p-8 bg-white border border-zinc-100 rounded-[3rem] shadow-sm">
            <h3 className="font-black italic uppercase text-sm tracking-widest mb-6 text-primary flex items-center gap-2"><Scale className="w-5 h-5" /> Form Penilaian Ulang</h3>
            
            {selectedObj ? (
              <form onSubmit={handleAssessmentSubmit} className="space-y-5 text-xs font-bold">
                <div className="bg-zinc-50 p-4 rounded-2xl space-y-1">
                  <p className="text-[10px] font-black text-zinc-400 uppercase">Objek Dipilih</p>
                  <p className="font-black text-foreground text-sm">{selectedObj.name}</p>
                  <p className="font-mono text-primary text-[10px]">{selectedObj.nop}</p>
                  <p className="text-[10px] text-zinc-500 font-bold mt-1">NJOP Lama: Rp {Number(selectedObj.njop).toLocaleString("id-ID")}</p>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase text-zinc-400">NJOP Baru (Total Rp)</label>
                  <input 
                    type="number" 
                    value={newNjopInput}
                    onChange={e => setNewNjopInput(e.target.value)}
                    className="w-full px-4 py-3 bg-zinc-50 border border-zinc-100 rounded-xl outline-none focus:ring-2 focus:ring-primary/10 text-xs font-bold"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase text-zinc-400">Alasan Penilaian Kembali</label>
                  <textarea 
                    rows={4}
                    placeholder="Masukkan alasan revaluasi..." 
                    value={reasonInput}
                    onChange={e => setReasonInput(e.target.value)}
                    className="w-full px-4 py-3 bg-zinc-50 border border-zinc-100 rounded-xl outline-none focus:ring-2 focus:ring-primary/10 text-xs font-bold"
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
              <div className="py-14 text-center space-y-4">
                <HelpCircle className="w-12 h-12 mx-auto text-zinc-200" />
                <h4 className="font-black italic uppercase text-xs tracking-widest">Pilih Objek Pajak</h4>
                <p className="text-muted-foreground leading-relaxed text-[11px] font-medium">Cari objek pajak di bawah untuk memulai pembaharuan nilai pasar (NJOP) secara manual.</p>
              </div>
            )}
          </Card>

          {/* Search Object to Appraise */}
          <Card className="p-6 bg-white border border-zinc-100 rounded-[2.5rem] shadow-sm space-y-4">
            <h3 className="font-black italic uppercase text-xs tracking-widest text-primary flex items-center gap-2"><Search className="w-4 h-4" /> Cari Objek Pajak</h3>
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
              <input 
                type="text" 
                placeholder="Cari NOP / Nama..." 
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-zinc-50 border border-zinc-100 rounded-xl outline-none focus:ring-2 focus:ring-primary/10 text-xs font-bold"
              />
            </div>
            <div className="space-y-2">
              {filteredObjects.map(obj => (
                <div 
                  key={obj.id} 
                  onClick={() => selectObjectForValuation(obj)}
                  className="p-3 bg-zinc-50 hover:bg-zinc-100 rounded-xl cursor-pointer flex justify-between items-center transition-all group text-xs font-bold border border-transparent hover:border-primary/5"
                >
                  <div className="text-left">
                    <p className="font-black text-foreground group-hover:text-primary transition-colors">{obj.name}</p>
                    <p className="text-[9px] text-zinc-400 font-mono mt-0.5">{obj.nop}</p>
                  </div>
                  <Plus className="w-4 h-4 text-zinc-300 group-hover:text-primary transition-all" />
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Right: Revaluation analytics and list */}
        <div className="lg:col-span-2 space-y-8">
          {/* Top 10 Increases and Decreases */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="p-6 bg-white border border-zinc-100 rounded-[2.5rem] shadow-sm space-y-4">
              <h4 className="font-black italic uppercase text-xs tracking-widest text-red-500 flex items-center gap-2"><ArrowUpRight className="w-4 h-4" /> Top 10 Kenaikan NJOP</h4>
              <div className="space-y-3">
                {analytics.topIncreases.length === 0 ? (
                  <p className="text-xs font-medium text-zinc-400 italic">Belum ada kenaikan terekam.</p>
                ) : (
                  analytics.topIncreases.map((item, idx) => (
                    <div key={item.id} className="flex justify-between items-center border-b border-zinc-50 pb-2 text-xs">
                      <div className="text-left">
                        <p className="font-black text-foreground">{idx + 1}. {item.name}</p>
                        <p className="text-[9px] font-mono text-zinc-400">{item.nop}</p>
                      </div>
                      <span className="text-[10px] font-black text-red-600">+{Math.round(item.pct)}%</span>
                    </div>
                  ))
                )}
              </div>
            </Card>

            <Card className="p-6 bg-white border border-zinc-100 rounded-[2.5rem] shadow-sm space-y-4">
              <h4 className="font-black italic uppercase text-xs tracking-widest text-emerald-500 flex items-center gap-2"><ArrowDownRight className="w-4 h-4" /> Top 10 Penurunan NJOP</h4>
              <div className="space-y-3">
                {analytics.topDecreases.length === 0 ? (
                  <p className="text-xs font-medium text-zinc-400 italic">Belum ada penurunan terekam.</p>
                ) : (
                  analytics.topDecreases.map((item, idx) => (
                    <div key={item.id} className="flex justify-between items-center border-b border-zinc-50 pb-2 text-xs">
                      <div className="text-left">
                        <p className="font-black text-foreground">{idx + 1}. {item.name}</p>
                        <p className="text-[9px] font-mono text-zinc-400">{item.nop}</p>
                      </div>
                      <span className="text-[10px] font-black text-emerald-600">{Math.round(item.pct)}%</span>
                    </div>
                  ))
                )}
              </div>
            </Card>
          </div>

          {/* Historical Log list */}
          <Card className="p-8 bg-white border border-zinc-100 rounded-[3rem] shadow-sm">
            <h3 className="font-black italic uppercase text-sm tracking-widest mb-6 text-primary flex items-center gap-2"><Clock className="w-5 h-5" /> Log Riwayat Penilaian Ulang</h3>
            <div className="space-y-4 max-h-96 overflow-y-auto no-scrollbar">
              {assessments.length === 0 ? (
                <p className="text-xs font-medium text-zinc-400 text-center py-10 italic">Tidak ada riwayat revaluasi aktif.</p>
              ) : (
                assessments.map(item => (
                  <div key={item.id} className="p-4 bg-zinc-50 rounded-2xl flex justify-between items-start text-xs border border-zinc-100/50">
                    <div className="text-left space-y-1">
                      <h4 className="font-black text-foreground">{item.objectTax.name}</h4>
                      <p className="text-[10px] font-mono text-zinc-400">NOP: {item.objectTax.nop} | Tipe: {item.objectTax.type}</p>
                      <p className="text-[10px] text-zinc-500 font-medium leading-relaxed">&quot;{item.assessmentReason}&quot;</p>
                      <p className="text-[9px] text-primary font-black">Oleh: {item.assessor.name}</p>
                    </div>
                    <div className="text-right space-y-1">
                      <p className="text-[10px] text-zinc-400 font-black">{new Date(item.assessmentDate).toLocaleDateString("id-ID")}</p>
                      <p className="text-[10px] text-zinc-400 line-through">Rp {Number(item.oldNJOP).toLocaleString("id-ID")}</p>
                      <p className="font-black text-primary text-sm">Rp {Number(item.newNJOP).toLocaleString("id-ID")}</p>
                    </div>
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
