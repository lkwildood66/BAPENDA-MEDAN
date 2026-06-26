"use client";

import { useEffect, useState } from "react";
import {
  Search, CreditCard, Clock, CheckCircle,
  QrCode, Building2, ChevronRight, Info
} from "lucide-react";
import Link from "next/link";
import Script from "next/script";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Skeleton } from "@/components/ui/Skeleton";
import { useToast } from "@/lib/hooks/use-toast";
import { cn } from "@/lib/utils";

interface Payment {
  id: string;
  invoiceNumber: string;
  amount: number;
  status: string;
  taxPeriod: string;
  method?: string;
  expiredAt: string;
  createdAt: string;
  taxObject: { nop: string; type: string; name: string; address: string; njop: number };
}

function formatCurrency(val: number) {
  return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(val);
}

function formatDate(d: string) {
  return new Date(d).toLocaleDateString("id-ID", { day: "2-digit", month: "long", year: "numeric" });
}

type Step = "list" | "success";

export default function TagihanPajakPage() {
  const { toast } = useToast();
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<Payment | null>(null);
  const [step, setStep] = useState<Step>("list");
  const [processing, setProcessing] = useState(false);
  const [nopSearch, setNopSearch] = useState("");
  const snapUrl = "https://app.sandbox.midtrans.com/snap/snap.js";

  const [showMockForId, setShowMockForId] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/tax/pay")
      .then((r) => r.json())
      .then((d) => setPayments(d.payments ?? []))
      .finally(() => setLoading(false));
  }, []);

  const pending = payments.filter((p) => p.status === "PENDING" || p.status === "EXPIRED");
  const filtered = nopSearch
    ? pending.filter((p) =>
      p.taxObject.nop.includes(nopSearch) || p.taxObject.name.toLowerCase().includes(nopSearch.toLowerCase())
    )
    : pending;

  const handlePay = async (payment: Payment) => {
    setSelected(payment);
    setProcessing(true);
    try {
      const res = await fetch("/api/tax/pay", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ paymentId: payment.id }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Gagal inisialisasi pembayaran");

      // @ts-expect-error window.snap
      window.snap.pay(data.token, {
        onSuccess: () => {
          setPayments((prev) => prev.map((p) => (p.id === payment.id ? { ...p, status: "PAID" } : p)));
          setStep("success");
          setProcessing(false);
          toast("Pembayaran Berhasil", "Terima kasih telah memenuhi kewajiban pajak Anda.", "success");
        },
        onPending: () => {
          setStep("list");
          setProcessing(false);
          toast("Menunggu Pembayaran", "Silakan selesaikan pembayaran di aplikasi Anda.", "warning");
        },
        onError: () => {
          setProcessing(false);
          toast("Pembayaran Gagal", "Terjadi kesalahan saat memproses pembayaran.", "error");
        },
        onClose: () => {
          setProcessing(false);
        }
      });
    } catch (err) {
      const message = err instanceof Error ? err.message : "Gagal inisialisasi pembayaran";
      toast("Mode Simulasi Diaktifkan", `${message}. Mengaktifkan tombol simulasi bayar instan.`, "warning");
      setShowMockForId(payment.id);
      setProcessing(false);
    }
  };

  const handleMockPay = async (payment: Payment) => {
    setSelected(payment);
    setProcessing(true);
    try {
      const res = await fetch("/api/tax/pay/mock", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ paymentId: payment.id }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Gagal melakukan simulasi pembayaran");

      setPayments((prev) => prev.map((p) => (p.id === payment.id ? { ...p, status: "PAID" } : p)));
      setStep("success");
      setProcessing(false);
      toast("Pembayaran Berhasil (Simulasi)", "Terima kasih telah memenuhi kewajiban pajak Anda melalui simulasi.", "success");
    } catch (err) {
      const message = err instanceof Error ? err.message : "Gagal simulasi pembayaran";
      toast("Error", message, "error");
      setProcessing(false);
    }
  };

  if (step === "success") {
    return (
      <div className="flex flex-col items-center justify-center min-h-[600px] text-center p-8 animate-in zoom-in duration-500">
        <div className="w-40 h-40 bg-emerald-50 rounded-[4rem] flex items-center justify-center mb-10 shadow-2xl shadow-emerald-500/10 border-4 border-white">
          <CheckCircle className="w-20 h-20 text-emerald-500" />
        </div>
        <h1 className="text-5xl font-black italic tracking-tighter uppercase italic text-foreground mb-4">Pembayaran Sukses!</h1>
        <p className="text-muted-foreground font-medium text-lg max-w-md mb-12 border-l-4 border-emerald-500/20 pl-8 text-left italic">
           &quot;Terima kasih. Kontribusi perpajakan Anda membantu pembangunan infrastruktur dan layanan publik di Kota Medan.&quot;
        </p>
        <div className="flex flex-wrap gap-4 justify-center">
           <Link href="/dashboard/pajak/riwayat">
             <Button variant="primary" className="btn-premium px-12 h-18 rounded-[2rem] font-black uppercase text-xs tracking-widest shadow-2xl shadow-primary/30">Cetak E-Receipt</Button>
           </Link>
           <Button variant="outline" onClick={() => setStep("list")} className="px-10 h-18 rounded-[2rem] bg-zinc-50 border-zinc-100 font-black uppercase text-[10px] tracking-widest hover:bg-white transition-all">Kembali ke Tagihan</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-700 max-w-5xl selection:bg-primary/20">
      <Script
        src={snapUrl}
        data-client-key={process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY}
        strategy="afterInteractive"
      />
      
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-10">
        <div className="space-y-4">
           <div className="flex items-center gap-3 text-primary">
              <div className="w-10 h-0.5 bg-primary" />
              <p className="text-[10px] font-black uppercase tracking-[0.4em] italic">Electronic Billing System</p>
           </div>
           <h1 className="text-4xl md:text-6xl font-black tracking-tighter uppercase italic text-foreground inline-block">
             Tagihan <span className="text-primary italic">PBB.</span>
           </h1>
           <p className="text-muted-foreground font-medium text-lg max-w-xl leading-relaxed italic border-l-4 border-primary/10 pl-8">
              Selesaikan kewajiban Pajak Bumi dan Bangunan Anda secara aman melalui integrasi pembayaran elektronik Sipada Medan.
           </p>
        </div>
        
        <div className="relative group min-w-[320px]">
           <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-400 group-focus-within:text-primary transition-all" />
           <input
             type="text"
             placeholder="Cari NOP Anda..."
             value={nopSearch}
             onChange={(e) => setNopSearch(e.target.value)}
             className="w-full pl-14 pr-7 py-5 bg-white border border-zinc-100 rounded-[2rem] focus:ring-4 focus:ring-primary/10 outline-none transition-all font-black text-xs uppercase tracking-widest shadow-sm group-hover:border-primary/20"
           />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-10">
        {loading ? (
          [1, 2].map((i) => <div key={i} className="h-64 bg-zinc-50 border border-zinc-100 rounded-[4rem] animate-pulse" />)
        ) : filtered.length === 0 ? (
          <div className="py-24 text-center bg-white border-2 border-dashed border-zinc-100 rounded-[5rem] group hover:border-primary/20 transition-all">
            <CreditCard className="w-20 h-20 mx-auto mb-8 text-zinc-200 group-hover:text-primary transition-all group-hover:scale-110 duration-500" />
            <h3 className="text-2xl font-black italic tracking-tighter uppercase italic mb-2 tracking-widest">Tidak Ada Tagihan Aktif.</h3>
            <p className="text-muted-foreground font-medium italic">Seluruh kewajiban pembayaran Anda saat ini telah terpenuhi.</p>
          </div>
        ) : (
          filtered.map((p) => (
            <Card key={p.id} padding="none" variant="elevated" className="group bg-white border-zinc-100 dark:border-zinc-100 hover:border-primary/20 hover:scale-[1.01] transition-all duration-500 rounded-[4rem] overflow-hidden shadow-2xl shadow-primary/5 flex flex-col md:flex-row p-12 gap-12 relative">
               <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-primary/5 rounded-full blur-[80px] -z-0 opacity-0 group-hover:opacity-100 transition-opacity" />
               
               <div className="flex-1 space-y-10 relative z-10 text-left">
                  <div className="flex items-center gap-4 flex-wrap">
                    <span className="px-5 py-2 bg-primary/5 text-primary text-[10px] font-black uppercase tracking-widest rounded-full border border-primary/10">{p.taxObject.type}</span>
                    <span className="px-5 py-2 bg-amber-50 text-amber-600 border border-amber-100 text-[10px] font-black uppercase tracking-widest rounded-full">Tahun {p.taxPeriod}</span>
                  </div>
                  
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-zinc-50 rounded-xl flex items-center justify-center text-primary shadow-inner">
                        <Building2 className="w-5 h-5" />
                      </div>
                      <h3 className="text-3xl font-black italic tracking-tighter text-foreground italic uppercase group-hover:text-primary transition-colors">{p.taxObject.name}</h3>
                    </div>
                    <p className="text-[12px] font-black text-zinc-400 font-mono italic flex items-center gap-3 pl-13">
                       <span className="bg-zinc-50 border border-zinc-100 px-3 py-1 rounded-lg">NOP: {p.taxObject.nop}</span>
                    </p>
                    <p className="text-muted-foreground font-medium text-sm leading-relaxed max-w-md border-l-4 border-zinc-50 pl-8 ml-1">{p.taxObject.address}</p>
                  </div>
                  
                  <div className="flex items-center gap-3 text-red-500/80 font-black text-[10px] uppercase tracking-widest bg-red-50 border border-red-100 w-fit px-5 py-3 rounded-[1.5rem] italic">
                    <Clock className="w-4 h-4 animate-pulse" /> Jatuh Tempo: {formatDate(p.expiredAt)}
                  </div>
               </div>
               
               <div className="md:w-[320px] flex flex-col justify-between items-start md:items-end gap-10 relative z-10 border-t md:border-t-0 md:border-l border-border/50 pt-10 md:pt-0 md:pl-12 text-left md:text-right">
                  <div className="space-y-3">
                    <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-1 italic">Nominal Tagihan</p>
                    <p className="text-5xl font-black text-primary tracking-tighter italic decoration-amber-500/20 underline decoration-8 underline-offset-8">{formatCurrency(p.amount)}</p>
                  </div>
                  
                  <Button
                    loading={processing && selected?.id === p.id && !showMockForId}
                    onClick={() => handlePay(p)}
                    size="xl"
                    className="w-full h-20 rounded-full btn-premium flex items-center justify-center gap-4 font-black uppercase text-xs tracking-widest shadow-2xl shadow-primary/30"
                  >
                    Bayar Sekarang <QrCode className="w-6 h-6 group-hover:rotate-12 transition-transform" />
                  </Button>
                  
                  {showMockForId === p.id && (
                    <Button
                      loading={processing && selected?.id === p.id}
                      onClick={() => handleMockPay(p)}
                      variant="outline"
                      className="w-full h-14 mt-4 rounded-[1.5rem] border-dashed border-amber-500 text-amber-600 hover:bg-amber-50/50 flex items-center justify-center gap-2 font-black uppercase text-[10px] tracking-widest transition-all"
                    >
                      Simulasi Bayar Instan (Bypass) <CheckCircle className="w-4 h-4" />
                    </Button>
                  )}
               </div>
            </Card>
          ))
        )}
      </div>

      <div className="bg-zinc-50 border border-zinc-100 p-10 rounded-[4rem] flex flex-col md:flex-row items-center gap-10">
        <div className="w-20 h-20 bg-white rounded-[2rem] flex items-center justify-center shadow-xl border border-zinc-100 shrink-0">
          <Info className="w-10 h-10 text-primary" />
        </div>
        <div className="text-left">
          <h4 className="text-xl font-black italic tracking-tighter uppercase italic italic mb-2">Instruksi Pembayaran Digital</h4>
          <p className="text-muted-foreground font-medium text-sm leading-relaxed italic">
            Klik tombol &quot;Bayar Sekarang&quot; untuk mengaktifkan antarmuka Midtrans. Anda dapat membayar menggunakan QRIS (Gopay/OVO/Dana), Transfer Bank (Virtual Account), atau Kartu Kredit.
          </p>
        </div>
      </div>
    </div>
  );
}
