"use client";

import { useEffect, useState } from "react";
import { CreditCard, Search, Calendar, CheckCircle, Clock, Info, ShieldCheck, ArrowRight, Download, X } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Skeleton } from "@/components/ui/Skeleton";
import { useToast } from "@/lib/hooks/use-toast";

interface Payment {
  id: string;
  invoiceNumber: string;
  amount: number;
  status: string;
  taxPeriod: string;
  method?: string;
  paidAt?: string;
  createdAt: string;
  user: { name: string; email: string };
  taxObject: { nop: string; name: string; type: string };
}

function formatCurrency(val: number | string) {
  const num = typeof val === "string" ? Number(val) : val;
  if (isNaN(num)) return "Rp 0";
  return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(num);
}

const statusColor: Record<string, string> = {
  PAID: "bg-green-500/10 text-green-600 border-green-200",
  PENDING: "bg-amber-500/10 text-amber-600 border-amber-200",
  EXPIRED: "bg-red-500/10 text-red-600 border-red-200",
  CANCELLED: "bg-red-500/10 text-red-600 border-red-200",
};

export default function AdminPaymentsPage() {
  const { toast } = useToast();
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("ALL");

  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);

  useEffect(() => {
    fetch("/api/admin/payments")
      .then((r) => r.json())
      .then((d) => setPayments(d.payments ?? []))
      .catch(() => toast("Gagal", "Tidak dapat memuat data transaksi", "error"))
      .finally(() => setLoading(false));
  }, [toast]);

  const filtered = payments.filter((p) => {
    const matchSearch =
      p.invoiceNumber?.toLowerCase().includes(search.toLowerCase()) ||
      p.user?.name?.toLowerCase().includes(search.toLowerCase()) ||
      p.taxObject?.nop?.includes(search);
    const matchStatus = filterStatus === "ALL" || p.status === filterStatus;
    return matchSearch && matchStatus;
  });

  const totalAmount = filtered
    .filter(p => p.status === "PAID")
    .reduce((sum, p) => sum + Number(p.amount), 0);

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
        <div>
          <p className="text-primary font-black uppercase tracking-[0.2em] text-xs">Pendapatan Daerah</p>
          <h1 className="text-4xl font-black tracking-tighter mt-2 flex items-center gap-4">
            <CreditCard className="w-12 h-12 text-primary rotate-[-10deg]" /> Monitoring Transaksi
          </h1>
          <p className="text-muted-foreground mt-2 font-medium">Pengawasan pembayaran Pajak Daerah Kota Medan secara real-time dan terintegrasi.</p>
        </div>
        <div className="flex gap-4">
            <Button
              variant="outline" size="lg" className="gap-2 group overflow-hidden relative"
              onClick={() => {
                const headers = ["Invoice", "Wajib Pajak", "NOP", "Jenis", "Jumlah", "Status", "Tanggal"];
                const rows = payments.map(p => [
                  p.invoiceNumber, p.user.name, p.taxObject.nop, p.taxObject.type,
                  p.amount.toString(), p.status, new Date(p.createdAt).toLocaleDateString("id-ID")
                ]);
                const csv = [headers, ...rows].map(r => r.map(v => `"${v}"`).join(",")).join("\r\n");
                const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;?" });
                const url = URL.createObjectURL(blob);
                const a = document.createElement("a"); a.href = url; a.download = `laporan-pembayaran-${new Date().toISOString().slice(0,10)}.csv`;
                document.body.appendChild(a); a.click(); document.body.removeChild(a); URL.revokeObjectURL(url);
                toast("Berhasil", "Laporan berhasil diexport.", "success");
              }}
            >
               <Download className="w-5 h-5 group-hover:translate-y-1 transition-transform" /> Ekspor Laporan Excel
            </Button>
         </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <SummaryCard label="Total Pendapatan" value={formatCurrency(totalAmount)} icon={<ShieldCheck />} color="green" />
        <SummaryCard label="Menunggu Bayar" value={filtered.filter(p => p.status === "PENDING").length.toString()} icon={<Clock />} color="amber" />
        <SummaryCard label="Transaksi PAID" value={filtered.filter(p => p.status === "PAID").length.toString()} icon={<CheckCircle />} color="blue" />
        <SummaryCard label="Item Terdata" value={filtered.length.toString()} icon={<Info />} color="zinc" />
      </div>

      <div className="flex flex-col md:flex-row gap-6">
        <div className="relative group flex-1">
          <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-400 group-focus-within:text-primary transition-colors" />
          <input
            type="text"
            placeholder="Cari berdasarkan Nomor Invoice, NOP, atau Nama Wajib Pajak..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-14 pr-6 py-4 bg-white border border-border/50 rounded-2xl focus:ring-4 focus:ring-primary/10 outline-none transition-all font-bold shadow-sm shadow-inner"
          />
        </div>
        
        <div className="flex gap-2 p-1.5 bg-zinc-50 rounded-2xl border border-border/50 shadow-inner">
          {["ALL", "PAID", "PENDING", "EXPIRED"].map((s) => (
            <button
              key={s}
              onClick={() => setFilterStatus(s)}
              className={`px-6 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${
                filterStatus === s 
                  ? "bg-white text-primary shadow-sm border border-primary/10" 
                  : "text-zinc-500 hover:text-zinc-900"
              }`}
            >
              {s === "ALL" ? "Semua" : s}
            </button>
          ))}
        </div>
      </div>

      <Card padding="none" variant="outline" className="shadow-2xl shadow-black/5 overflow-hidden border-border/50">
        <div className="overflow-x-auto">
          {loading ? (
             <div className="p-8 space-y-6">
                {[1, 2, 3, 4, 5].map(i => <Skeleton key={i} className="h-16 rounded-2xl w-full" />)}
             </div>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-zinc-50 border-b border-border/50">
                  <th className="px-8 py-6 text-xs font-black uppercase tracking-widest text-zinc-500">Invoice / Wajib Pajak</th>
                  <th className="px-8 py-6 text-xs font-black uppercase tracking-widest text-zinc-500">Objek Pajak</th>
                  <th className="px-8 py-6 text-xs font-black uppercase tracking-widest text-zinc-500">Jumlah</th>
                  <th className="px-8 py-6 text-xs font-black uppercase tracking-widest text-zinc-500">Status</th>
                  <th className="px-8 py-6 text-xs font-black uppercase tracking-widest text-zinc-500">Tgl Transaksi</th>
                  <th className="px-8 py-6 text-right text-xs font-black uppercase tracking-widest text-zinc-500">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/50">
                {filtered.length === 0 ? (
                  <tr><td colSpan={6} className="px-8 py-20 text-center font-black text-zinc-400">Tidak ada riwayat transaksi ditemukan.</td></tr>
                ) : (
                  filtered.map((p) => (
                    <tr key={p.id} className="group hover:bg-zinc-50 transition-all font-bold text-zinc-900">
                      <td className="px-8 py-6">
                        <div className="flex flex-col">
                          <span className="text-sm font-mono tracking-tight text-primary">{p.invoiceNumber}</span>
                          <span className="text-xs text-zinc-500 font-medium group-hover:text-foreground transition-colors mt-1">{p.user?.name}</span>
                        </div>
                      </td>
                      <td className="px-8 py-6">
                         <div className="flex items-center gap-2">
                            <span className="px-2 py-0.5 bg-zinc-50 text-[10px] uppercase font-black tracking-widest rounded-lg border border-border/50">{p.taxObject.type}</span>
                            <span className="text-xs truncate max-w-[150px]">{p.taxObject.name}</span>
                         </div>
                      </td>
                      <td className="px-8 py-6">
                         <span className="text-sm text-amber-600 font-black tracking-tight">{formatCurrency(p.amount)}</span>
                      </td>
                      <td className="px-8 py-6">
                        <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border transition-all ${statusColor[p.status] || "bg-zinc-100"}`}>
                          {p.status}
                        </span>
                      </td>
                      <td className="px-8 py-6">
                         <div className="flex flex-col gap-1">
                            <div className="flex items-center gap-2 text-xs text-zinc-500 font-bold">
                               <Calendar className="w-3.5 h-3.5" /> {new Date(p.createdAt).toLocaleDateString("id-ID")}
                            </div>
                            {p.paidAt && (
                               <div className="flex items-center gap-2 text-[10px] text-green-600 uppercase font-black">
                                  <CheckCircle className="w-3.5 h-3.5 font-bold" /> PAID {new Date(p.paidAt).toLocaleTimeString("id-ID", { hour: '2-digit', minute: '2-digit' })}
                               </div>
                            )}
                         </div>
                      </td>
                      <td className="px-8 py-6 text-right">
                         <Button onClick={() => setSelectedPayment(p)} variant="ghost" size="icon" className="hover:text-primary"><ArrowRight className="w-4 h-4" /></Button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          )}
        </div>
      </Card>

      {/* Detail Modal */}
      {selectedPayment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-zinc-950/40 backdrop-blur-sm p-6 animate-in fade-in duration-300 text-left">
          <Card padding="none" className="bg-white rounded-[3rem] shadow-2xl w-full max-w-lg border border-zinc-100 animate-in zoom-in-95 duration-300 relative p-8">
            <div className="flex items-start justify-between mb-6">
              <div>
                <span className="text-[10px] font-black uppercase text-zinc-400">Rincian Transaksi</span>
                <h3 className="text-2xl font-black italic tracking-tighter uppercase text-zinc-900 mt-1">{selectedPayment.invoiceNumber}</h3>
              </div>
              <button onClick={() => setSelectedPayment(null)} className="p-3 bg-zinc-50 text-zinc-400 rounded-full hover:bg-zinc-100 shadow-inner transition-all">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-4 text-xs font-bold">
              <div className="bg-zinc-50 p-4 rounded-2xl space-y-2">
                <p className="text-[9px] font-black uppercase text-zinc-400">Wajib Pajak</p>
                <p className="text-zinc-900 font-black text-sm">{selectedPayment.user.name}</p>
                <p className="text-zinc-500 font-medium font-sans leading-none">{selectedPayment.user.email}</p>
              </div>

              <div className="bg-zinc-50 p-4 rounded-2xl space-y-2">
                <p className="text-[9px] font-black uppercase text-zinc-400">Objek Pajak</p>
                <p className="text-zinc-900 font-black text-sm">{selectedPayment.taxObject.name}</p>
                <p className="text-primary font-mono text-[10px]">NOP: {selectedPayment.taxObject.nop}</p>
                <p className="text-zinc-500 font-medium font-sans leading-none">Tipe: {selectedPayment.taxObject.type}</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-zinc-50 p-4 rounded-2xl">
                  <p className="text-[9px] font-black uppercase text-zinc-400 mb-1">Masa Pajak</p>
                  <p className="text-zinc-800 text-sm font-black italic">{selectedPayment.taxPeriod}</p>
                </div>
                <div className="bg-zinc-50 p-4 rounded-2xl">
                  <p className="text-[9px] font-black uppercase text-zinc-400 mb-1">Total Pembayaran</p>
                  <p className="text-amber-600 text-sm font-black">{formatCurrency(selectedPayment.amount)}</p>
                </div>
              </div>

              <div className="bg-zinc-50 p-4 rounded-2xl space-y-2">
                <p className="text-[9px] font-black uppercase text-zinc-400">Status Pembayaran</p>
                <div className="flex items-center gap-2">
                  <span className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest border leading-none ${statusColor[selectedPayment.status] || "bg-zinc-100"}`}>
                    {selectedPayment.status}
                  </span>
                  {selectedPayment.paidAt && (
                    <span className="text-[10px] text-green-600 font-black">
                      LUNAS PADA {new Date(selectedPayment.paidAt).toLocaleString("id-ID")}
                    </span>
                  )}
                </div>
              </div>

              <div className="bg-zinc-50 p-4 rounded-2xl">
                <p className="text-[9px] font-black uppercase text-zinc-400 mb-1">Tanggal Tagihan Dibuat</p>
                <p className="text-zinc-500 font-medium font-sans">{new Date(selectedPayment.createdAt).toLocaleString("id-ID")}</p>
              </div>
            </div>

            <div className="mt-8 flex gap-3">
              <Button onClick={() => setSelectedPayment(null)} className="flex-1 h-12 bg-primary text-white rounded-2xl font-black uppercase text-[10px] tracking-widest">
                Tutup Rincian
              </Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}

function SummaryCard({ label, value, icon, color }: { label: string; value: string; icon: React.ReactNode; color: string }) {
  const colors: Record<string, string> = {
    green: "bg-green-500/10 text-green-600 border-green-200 shadow-green-500/10",
    amber: "bg-amber-500/10 text-amber-600 border-amber-200 shadow-amber-500/10",
    blue: "bg-blue-500/10 text-blue-600 border-blue-200 shadow-blue-500/10",
    zinc: "bg-zinc-500/10 text-zinc-600 border-zinc-200 shadow-zinc-500/10",
  };

  return (
    <Card padding="md" variant="elevated" className={colors[color]}>
      <div className="flex items-center gap-5">
        <div className="w-14 h-14 rounded-2xl flex items-center justify-center border-2 border-current/20 bg-white/50 shadow-inner">
           {icon}
        </div>
        <div>
           <p className="text-[10px] font-black uppercase tracking-widest text-zinc-500 mb-1">{label}</p>
           <p className="text-2xl font-black tracking-tight leading-none tabular-nums truncate max-w-[150px]">{value}</p>
        </div>
      </div>
    </Card>
  );
}
