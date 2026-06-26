"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { 
  Settings, 
  Database, 
  Users, 
  TrendingUp, 
  Bell, 
  Save, 
  Loader2, 
  ShieldCheck,
  AlertTriangle,
  Server,
  Lock,
  Mail,
  Coins
} from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { useToast } from "@/lib/hooks/use-toast";
import { cn } from "@/lib/utils";

type ActiveTab = "SYSTEM" | "USER" | "TAX" | "NOTIFICATION";

export default function AdminSettingsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "authenticated" && (session?.user as any)?.role !== "ADMIN") {
      router.replace("/dashboard");
    }
  }, [session, status, router]);

  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<ActiveTab>("SYSTEM");
  const [saving, setSaving] = useState(false);

  // System Configuration State
  const [sysConfig, setSysConfig] = useState({
    appName: "SIPADA MEDAN - Sistem Pendapatan Daerah",
    budgetYear: "2026",
    maintenanceMode: false,
    auditInterval: "DAILY",
    autoBackup: true,
  });

  // User Settings State
  const [userConfig, setUserConfig] = useState({
    autoVerifyWp: true,
    allowResearchReg: true,
    loginAttemptLimit: 5,
    requireNikVerify: true,
    defaultSessionExpiry: 24, // hours
  });

  // Tax Settings State
  const [taxConfig, setTaxConfig] = useState({
    pbbInterestRate: 2.0, // % per month
    defaultNjoptkp: 12000000, // Rp
    invoiceExpiryDays: 30,
    minPaymentQris: 10000,
    enableTaxRelief: true,
  });

  // Notification Settings State
  const [notifConfig, setNotifConfig] = useState({
    sendEmailReceipt: true,
    sendWhatsappReminder: false,
    notifyOfficerOnNewTaxObj: true,
    dashboardAlertSound: true,
  });

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    
    // Simulate API saving
    setTimeout(() => {
      setSaving(false);
      toast(
        "Konfigurasi Disimpan", 
        "Seluruh parameter sistem berhasil disinkronisasi ke server utama.", 
        "success"
      );
    }, 1200);
  };

  const tabs = [
    { id: "SYSTEM", label: "Sistem & Audit", icon: Server },
    { id: "USER", label: "Hak Akses & WP", icon: Users },
    { id: "TAX", label: "Parameter Fiskal", icon: Coins },
    { id: "NOTIFICATION", label: "Notifikasi & Alert", icon: Bell },
  ] as const;

  if (status === "loading" || (session?.user as any)?.role !== "ADMIN") {
     return (
        <div className="min-h-[60vh] flex items-center justify-center">
           <Loader2 className="w-12 h-12 text-[#1E40AF] animate-spin" />
        </div>
     );
  }

  return (
    <div className="space-y-12 animate-in fade-in slide-in-from-bottom-6 duration-1000 pb-20 selection:bg-primary/20 text-left">
      
      {/* ── Page Header ── */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-10">
        <div className="space-y-4">
           <div className="flex items-center gap-3 text-primary">
              <div className="w-10 h-1 bg-primary rounded-full shadow-glow" />
              <p className="text-[10px] font-black uppercase tracking-[0.3em] italic leading-none">Console Parameters</p>
           </div>
           <h1 className="text-5xl md:text-7xl font-black italic tracking-tighter leading-[0.85] text-foreground uppercase italic underline decoration-primary/10 decoration-8 underline-offset-8">
             Setelan <span className="text-primary italic">Sistem.</span>
           </h1>
           <p className="text-xl text-muted-foreground font-medium max-w-xl leading-relaxed italic border-l-4 border-primary/10 pl-8 ml-2">
              &quot;Kelola konfigurasi inti, tarif denda, ambang batas NJOP, mekanisme autentikasi wajib pajak, serta pembagian alur notifikasi.&quot;
           </p>
        </div>
      </div>

      <form onSubmit={handleSave} className="flex flex-col lg:flex-row gap-10 pt-6">
        
        {/* Left Side Navigation (Vertical Tabs) */}
        <div className="w-full lg:w-80 shrink-0">
          <Card padding="sm" className="bg-zinc-50 border border-zinc-100 rounded-[2.5rem] p-4 flex flex-col gap-2.5">
            <p className="text-[9px] font-black uppercase tracking-widest text-zinc-400 p-4 pb-2 italic">Settings Categories</p>
            {tabs.map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id as ActiveTab)}
                className={cn(
                  "w-full flex items-center gap-4 px-6 py-4.5 rounded-2xl text-xs font-black uppercase tracking-widest transition-all",
                  activeTab === tab.id 
                    ? "bg-white text-primary shadow-xl border border-primary/10" 
                    : "text-zinc-500 hover:text-zinc-900 hover:bg-zinc-100/60"
                )}
              >
                <tab.icon className={cn("w-5 h-5", activeTab === tab.id ? "text-primary" : "text-zinc-400")} />
                {tab.label}
              </button>
            ))}
            
            <div className="border-t border-zinc-200/60 my-4 pt-4 px-4 flex items-center gap-3 text-zinc-400 opacity-60">
              <Lock className="w-4 h-4" />
              <span className="text-[9px] font-black uppercase tracking-wider italic">Protected Config Zone</span>
            </div>
          </Card>
        </div>

        {/* Right Side Settings Panel */}
        <div className="flex-1">
          <Card padding="lg" className="bg-white border border-zinc-100 rounded-[3.5rem] shadow-xl shadow-primary/[0.02] overflow-visible relative z-30">
            
            {/* Tab 1: System Settings */}
            {activeTab === "SYSTEM" && (
              <div className="space-y-10 animate-in fade-in duration-300">
                <div className="space-y-1">
                  <h3 className="text-2xl font-black italic tracking-tight text-zinc-900 uppercase">Sistem & Audit Konfigurasi</h3>
                  <p className="text-xs text-zinc-400 italic font-semibold">Ubah variabel server dasar, tahun berjalan, dan pemeliharaan ledger.</p>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 italic">Nama Aplikasi Portal</label>
                    <input 
                      type="text" 
                      value={sysConfig.appName}
                      onChange={(e) => setSysConfig({ ...sysConfig, appName: e.target.value })}
                      className="w-full px-6 h-14 bg-zinc-50 border border-zinc-200 rounded-xl outline-none focus:ring-4 focus:ring-primary/10 transition-all font-bold text-sm text-zinc-800"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 italic">Tahun Anggaran Aktif</label>
                    <select
                      value={sysConfig.budgetYear}
                      onChange={(e) => setSysConfig({ ...sysConfig, budgetYear: e.target.value })}
                      className="w-full px-6 h-14 bg-zinc-50 border border-zinc-200 rounded-xl outline-none focus:ring-4 focus:ring-primary/10 transition-all font-bold text-sm text-zinc-800 cursor-pointer"
                    >
                      <option value="2025">2025 Fiscal Year</option>
                      <option value="2026">2026 Fiscal Year</option>
                      <option value="2027">2027 Fiscal Year</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 italic">Frekuensi Auto-Audit</label>
                    <select
                      value={sysConfig.auditInterval}
                      onChange={(e) => setSysConfig({ ...sysConfig, auditInterval: e.target.value })}
                      className="w-full px-6 h-14 bg-zinc-50 border border-zinc-200 rounded-xl outline-none focus:ring-4 focus:ring-primary/10 transition-all font-bold text-sm text-zinc-800 cursor-pointer"
                    >
                      <option value="HOURLY">Tiap Jam</option>
                      <option value="DAILY">Harian (Tiap Tengah Malam)</option>
                      <option value="WEEKLY">Mingguan</option>
                    </select>
                  </div>
                </div>

                <div className="pt-6 border-t border-zinc-100 space-y-6">
                  {/* Toggles */}
                  <div className="flex items-center justify-between p-6 bg-zinc-50 border border-zinc-100 rounded-2xl">
                    <div className="space-y-1">
                      <p className="text-sm font-black uppercase text-zinc-800 tracking-tight italic">Maintenance Mode</p>
                      <p className="text-[10px] text-zinc-400 font-semibold italic">Matikan akses publik untuk wajib pajak selama migrasi database.</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input 
                        type="checkbox" 
                        checked={sysConfig.maintenanceMode}
                        onChange={(e) => setSysConfig({ ...sysConfig, maintenanceMode: e.target.checked })}
                        className="sr-only peer" 
                      />
                      <div className="w-14 h-8 bg-zinc-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[4px] after:left-[4px] after:bg-white after:border-zinc-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-primary"></div>
                    </label>
                  </div>

                  <div className="flex items-center justify-between p-6 bg-zinc-50 border border-zinc-100 rounded-2xl">
                    <div className="space-y-1">
                      <p className="text-sm font-black uppercase text-zinc-800 tracking-tight italic">Database Auto-Backup</p>
                      <p className="text-[10px] text-zinc-400 font-semibold italic">Cadangkan snapshot ledger ke media penyimpanan terdistribusi lokal.</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input 
                        type="checkbox" 
                        checked={sysConfig.autoBackup}
                        onChange={(e) => setSysConfig({ ...sysConfig, autoBackup: e.target.checked })}
                        className="sr-only peer" 
                      />
                      <div className="w-14 h-8 bg-zinc-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[4px] after:left-[4px] after:bg-white after:border-zinc-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-primary"></div>
                    </label>
                  </div>
                </div>
              </div>
            )}

            {/* Tab 2: User Settings */}
            {activeTab === "USER" && (
              <div className="space-y-10 animate-in fade-in duration-300">
                <div className="space-y-1">
                  <h3 className="text-2xl font-black italic tracking-tight text-zinc-900 uppercase">Manajemen Hak Akses & Wajib Pajak</h3>
                  <p className="text-xs text-zinc-400 italic font-semibold">Tentukan limit keamanan, alur aktivasi identitas, dan riset mahasiswa.</p>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 italic">Batas Gagal Login (Attempt limit)</label>
                    <input 
                      type="number" 
                      value={userConfig.loginAttemptLimit}
                      onChange={(e) => setUserConfig({ ...userConfig, loginAttemptLimit: parseInt(e.target.value) || 5 })}
                      className="w-full px-6 h-14 bg-zinc-50 border border-zinc-200 rounded-xl outline-none focus:ring-4 focus:ring-primary/10 transition-all font-bold text-sm text-zinc-800"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 italic">Masa Kedaluwarsa Sesi User (Jam)</label>
                    <input 
                      type="number" 
                      value={userConfig.defaultSessionExpiry}
                      onChange={(e) => setUserConfig({ ...userConfig, defaultSessionExpiry: parseInt(e.target.value) || 24 })}
                      className="w-full px-6 h-14 bg-zinc-50 border border-zinc-200 rounded-xl outline-none focus:ring-4 focus:ring-primary/10 transition-all font-bold text-sm text-zinc-800"
                    />
                  </div>
                </div>

                <div className="pt-6 border-t border-zinc-100 space-y-6">
                  <div className="flex items-center justify-between p-6 bg-zinc-50 border border-zinc-100 rounded-2xl">
                    <div className="space-y-1">
                      <p className="text-sm font-black uppercase text-zinc-800 tracking-tight italic">Validasi NIK Terintegrasi</p>
                      <p className="text-[10px] text-zinc-400 font-semibold italic">Wajibkan pencocokan nomor NIK dengan data Disdukcapil saat pendaftaran.</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input 
                        type="checkbox" 
                        checked={userConfig.requireNikVerify}
                        onChange={(e) => setUserConfig({ ...userConfig, requireNikVerify: e.target.checked })}
                        className="sr-only peer" 
                      />
                      <div className="w-14 h-8 bg-zinc-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[4px] after:left-[4px] after:bg-white after:border-zinc-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-primary"></div>
                    </label>
                  </div>

                  <div className="flex items-center justify-between p-6 bg-zinc-50 border border-zinc-100 rounded-2xl">
                    <div className="space-y-1">
                      <p className="text-sm font-black uppercase text-zinc-800 tracking-tight italic">Verifikasi Otomatis Akun Wajib Pajak</p>
                      <p className="text-[10px] text-zinc-400 font-semibold italic">Akun wajib pajak langsung aktif setelah registrasi tanpa harus diaudit petugas.</p>
                    </div>
                    <label className="relative inline-flex inline-flex items-center cursor-pointer">
                      <input 
                        type="checkbox" 
                        checked={userConfig.autoVerifyWp}
                        onChange={(e) => setUserConfig({ ...userConfig, autoVerifyWp: e.target.checked })}
                        className="sr-only peer" 
                      />
                      <div className="w-14 h-8 bg-zinc-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[4px] after:left-[4px] after:bg-white after:border-zinc-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-primary"></div>
                    </label>
                  </div>

                  <div className="flex items-center justify-between p-6 bg-zinc-50 border border-zinc-100 rounded-2xl">
                    <div className="space-y-1">
                      <p className="text-sm font-black uppercase text-zinc-800 tracking-tight italic">Izinkan Registrasi Akses Riset Mahasiswa</p>
                      <p className="text-[10px] text-zinc-400 font-semibold italic">Buka portal registrasi untuk Civitas Akademik mengajukan riset geospasial.</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input 
                        type="checkbox" 
                        checked={userConfig.allowResearchReg}
                        onChange={(e) => setUserConfig({ ...userConfig, allowResearchReg: e.target.checked })}
                        className="sr-only peer" 
                      />
                      <div className="w-14 h-8 bg-zinc-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[4px] after:left-[4px] after:bg-white after:border-zinc-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-primary"></div>
                    </label>
                  </div>
                </div>
              </div>
            )}

            {/* Tab 3: Tax Settings */}
            {activeTab === "TAX" && (
              <div className="space-y-10 animate-in fade-in duration-300">
                <div className="space-y-1">
                  <h3 className="text-2xl font-black italic tracking-tight text-zinc-900 uppercase">Parameter Fiskal & Pajak Daerah</h3>
                  <p className="text-xs text-zinc-400 italic font-semibold">Tentukan suku denda berkala, batas NJOPTKP, dan jatuh tempo invoice.</p>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 italic">Suku Bunga Denda Bulanan (%)</label>
                    <input 
                      type="number" 
                      step="0.1"
                      value={taxConfig.pbbInterestRate}
                      onChange={(e) => setTaxConfig({ ...taxConfig, pbbInterestRate: parseFloat(e.target.value) || 0 })}
                      className="w-full px-6 h-14 bg-zinc-50 border border-zinc-200 rounded-xl outline-none focus:ring-4 focus:ring-primary/10 transition-all font-bold text-sm text-zinc-800"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 italic">Default NJOPTKP (Nominal Rupiah)</label>
                    <input 
                      type="number" 
                      value={taxConfig.defaultNjoptkp}
                      onChange={(e) => setTaxConfig({ ...taxConfig, defaultNjoptkp: parseInt(e.target.value) || 0 })}
                      className="w-full px-6 h-14 bg-zinc-50 border border-zinc-200 rounded-xl outline-none focus:ring-4 focus:ring-primary/10 transition-all font-bold text-sm text-zinc-800"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 italic">Masa Aktif Surat Ketetapan / Invoice (Hari)</label>
                    <input 
                      type="number" 
                      value={taxConfig.invoiceExpiryDays}
                      onChange={(e) => setTaxConfig({ ...taxConfig, invoiceExpiryDays: parseInt(e.target.value) || 30 })}
                      className="w-full px-6 h-14 bg-zinc-50 border border-zinc-200 rounded-xl outline-none focus:ring-4 focus:ring-primary/10 transition-all font-bold text-sm text-zinc-800"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 italic">Batas Minimum Pembayaran QRIS (Rp)</label>
                    <input 
                      type="number" 
                      value={taxConfig.minPaymentQris}
                      onChange={(e) => setTaxConfig({ ...taxConfig, minPaymentQris: parseInt(e.target.value) || 10000 })}
                      className="w-full px-6 h-14 bg-zinc-50 border border-zinc-200 rounded-xl outline-none focus:ring-4 focus:ring-primary/10 transition-all font-bold text-sm text-zinc-800"
                    />
                  </div>
                </div>

                <div className="pt-6 border-t border-zinc-100 space-y-6">
                  <div className="flex items-center justify-between p-6 bg-zinc-50 border border-zinc-100 rounded-2xl">
                    <div className="space-y-1">
                      <p className="text-sm font-black uppercase text-zinc-800 tracking-tight italic">Program Keringanan / Relaksasi Pajak</p>
                      <p className="text-[10px] text-zinc-400 font-semibold italic">Aktifkan penghapusan denda otomatis bagi wajib pajak di hari besar.</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input 
                        type="checkbox" 
                        checked={taxConfig.enableTaxRelief}
                        onChange={(e) => setTaxConfig({ ...taxConfig, enableTaxRelief: e.target.checked })}
                        className="sr-only peer" 
                      />
                      <div className="w-14 h-8 bg-zinc-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[4px] after:left-[4px] after:bg-white after:border-zinc-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-primary"></div>
                    </label>
                  </div>
                </div>
              </div>
            )}

            {/* Tab 4: Notification Settings */}
            {activeTab === "NOTIFICATION" && (
              <div className="space-y-10 animate-in fade-in duration-300">
                <div className="space-y-1">
                  <h3 className="text-2xl font-black italic tracking-tight text-zinc-900 uppercase">Mekanisme Notifikasi & Siaran</h3>
                  <p className="text-xs text-zinc-400 italic font-semibold">Atur pembagian gateway, notifikasi audit, dan sound alert dashboard.</p>
                </div>

                <div className="pt-4 space-y-6">
                  <div className="flex items-center justify-between p-6 bg-zinc-50 border border-zinc-100 rounded-2xl">
                    <div className="space-y-1">
                      <p className="text-sm font-black uppercase text-zinc-800 tracking-tight italic">Kirim Bukti Bayar Via Email</p>
                      <p className="text-[10px] text-zinc-400 font-semibold italic">Kirimkan kuitansi pelunasan pajak (PDF) ke email wajib pajak secara real-time.</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input 
                        type="checkbox" 
                        checked={notifConfig.sendEmailReceipt}
                        onChange={(e) => setNotifConfig({ ...notifConfig, sendEmailReceipt: e.target.checked })}
                        className="sr-only peer" 
                      />
                      <div className="w-14 h-8 bg-zinc-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[4px] after:left-[4px] after:bg-white after:border-zinc-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-primary"></div>
                    </label>
                  </div>

                  <div className="flex items-center justify-between p-6 bg-zinc-50 border border-zinc-100 rounded-2xl">
                    <div className="space-y-1">
                      <p className="text-sm font-black uppercase text-zinc-800 tracking-tight italic">Notifikasi Tagihan Via WhatsApp Gateway</p>
                      <p className="text-[10px] text-zinc-400 font-semibold italic">Kirim pengingat jatuh tempo pajak secara masal melalui integrasi API WhatsApp.</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input 
                        type="checkbox" 
                        checked={notifConfig.sendWhatsappReminder}
                        onChange={(e) => setNotifConfig({ ...notifConfig, sendWhatsappReminder: e.target.checked })}
                        className="sr-only peer" 
                      />
                      <div className="w-14 h-8 bg-zinc-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[4px] after:left-[4px] after:bg-white after:border-zinc-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-primary"></div>
                    </label>
                  </div>

                  <div className="flex items-center justify-between p-6 bg-zinc-50 border border-zinc-100 rounded-2xl">
                    <div className="space-y-1">
                      <p className="text-sm font-black uppercase text-zinc-800 tracking-tight italic">Peringatan Petugas Lapangan</p>
                      <p className="text-[10px] text-zinc-400 font-semibold italic">Kirim notifikasi langsung ke Officer ketika ada pendaftaran objek pajak baru.</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input 
                        type="checkbox" 
                        checked={notifConfig.notifyOfficerOnNewTaxObj}
                        onChange={(e) => setNotifConfig({ ...notifConfig, notifyOfficerOnNewTaxObj: e.target.checked })}
                        className="sr-only peer" 
                      />
                      <div className="w-14 h-8 bg-zinc-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[4px] after:left-[4px] after:bg-white after:border-zinc-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-primary"></div>
                    </label>
                  </div>

                  <div className="flex items-center justify-between p-6 bg-zinc-50 border border-zinc-100 rounded-2xl">
                    <div className="space-y-1">
                      <p className="text-sm font-black uppercase text-zinc-800 tracking-tight italic">Dashboard Alert Sound</p>
                      <p className="text-[10px] text-zinc-400 font-semibold italic">Bunyikan notifikasi audio saat admin menerima pengaduan baru masuk.</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input 
                        type="checkbox" 
                        checked={notifConfig.dashboardAlertSound}
                        onChange={(e) => setNotifConfig({ ...notifConfig, dashboardAlertSound: e.target.checked })}
                        className="sr-only peer" 
                      />
                      <div className="w-14 h-8 bg-zinc-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[4px] after:left-[4px] after:bg-white after:border-zinc-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-primary"></div>
                    </label>
                  </div>
                </div>
              </div>
            )}

            {/* Save Controls Footer */}
            <div className="px-2 py-6 border-t border-zinc-100 mt-10 flex flex-wrap items-center justify-between gap-6">
              <div className="flex items-center gap-3 text-zinc-400">
                <ShieldCheck className="w-5 h-5 text-emerald-500" />
                <p className="text-[10px] font-black uppercase tracking-widest italic">Authorized System Settings Console</p>
              </div>
              
              <Button
                type="submit"
                disabled={saving}
                className="h-16 px-10 bg-primary text-white rounded-full font-black uppercase text-xs tracking-widest shadow-xl shadow-primary/20 flex items-center gap-3 italic"
              >
                {saving ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" /> Menyinkronkan...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" /> Simpan Konfigurasi
                  </>
                )}
              </Button>
            </div>

          </Card>
        </div>

      </form>

    </div>
  );
}
