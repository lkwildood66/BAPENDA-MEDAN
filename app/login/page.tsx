"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { 
  ArrowRight, Lock, 
  Mail, Sparkles, Zap, 
  Fingerprint, History,
  Loader2
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { useToast } from "@/lib/hooks/use-toast";
import Image from "next/image";

export default function LoginPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (res?.error) {
        setError("Kredensial tidak valid. Silakan periksa kembali email dan kata sandi Anda.");
      } else {
        router.push("/dashboard");
      }
    } catch {
      setError("Terjadi kesalahan sistem. Silakan coba beberapa saat lagi.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-white selection:bg-primary/20">
      
      {/* ── Left Side: Brand & Visual ── */}
      <div className="hidden lg:flex w-1/2 bg-zinc-50 border-r border-zinc-100 flex-col justify-between p-20 relative overflow-hidden">
         {/* Decorative Mesh */}
         <div className="absolute top-0 right-0 w-full h-full bg-gradient-to-br from-primary/5 via-transparent to-blue-400/5" />
         <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary opacity-5 rounded-full blur-[120px] animate-pulse-slow" />
         
         <Link href="/" className="flex items-center gap-4 relative z-10 group">
            <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center shadow-2xl border border-zinc-100 group-hover:rotate-6 transition-transform">
               <Image src="/logo.png" alt="Logo" width={44} height={44} />
            </div>
            <div>
               <h1 className="text-2xl font-black italic tracking-tighter leading-none text-foreground uppercase">SIPADA<span className="text-primary italic font-black">MEDAN</span></h1>
               <p className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.3em] mt-1 italic">Secure Gateway Node</p>
            </div>
         </Link>

         <div className="space-y-12 relative z-10 animate-in fade-in slide-in-from-left-8 duration-1000">
            <h2 className="text-6xl md:text-7xl font-black italic tracking-tighter leading-[0.9] text-foreground">
               Keamanan <br /> Data Adalah <br /> <span className="text-primary underline decoration-primary/20 decoration-8 underline-offset-4">Prioritas Utama.</span>
            </h2>
            <div className="grid grid-cols-2 gap-8">
               <div className="space-y-3">
                  <Fingerprint className="w-8 h-8 text-primary" />
                  <p className="text-xs font-black uppercase tracking-widest leading-none">Otentikasi Ganda</p>
                  <p className="text-[10px] text-zinc-600 font-bold italic leading-relaxed border-l-2 border-primary/20 pl-3">&quot;Sistem verifikasi identitas berlapis untuk perlindungan akun maksimal.&quot;</p>
               </div>
               <div className="space-y-3">
                  <History className="w-8 h-8 text-blue-500" />
                  <p className="text-xs font-black uppercase tracking-widest leading-none">Audit Real-Time</p>
                  <p className="text-[10px] text-zinc-600 font-bold italic leading-relaxed border-l-2 border-primary/20 pl-3">&quot;Setiap log aktivitas login dipantau oleh sistem keamanan terpusat.&quot;</p>
               </div>
            </div>
         </div>

         <div className="flex items-center gap-10 relative z-10 opacity-50">
            <p className="text-[10px] font-black uppercase tracking-widest italic cursor-default hover:text-primary transition-colors">Integrity System</p>
            <p className="text-[10px] font-black uppercase tracking-widest italic cursor-default hover:text-primary transition-colors">Encrypted V3</p>
            <p className="text-[10px] font-black uppercase tracking-widest italic cursor-default hover:text-primary transition-colors">Audit Node: MEDAN-BPN</p>
         </div>
      </div>

      {/* ── Right Side: Login Form ── */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-white relative">
         {/* Mobile Logo Only */}
         <div className="absolute top-12 left-12 lg:hidden flex items-center gap-4">
            <div className="w-10 h-10 bg-white border border-zinc-100 rounded-xl flex items-center justify-center">
               <Image src="/logo.png" alt="Logo" width={28} height={28} />
            </div>
            <h1 className="text-xl font-black italic tracking-tighter text-foreground">SIPADA<span className="text-primary italic">.</span></h1>
         </div>

         <Card padding="none" variant="elevated" className="w-full max-w-lg border-0 bg-white shadow-none relative overflow-hidden lg:shadow-2xl lg:shadow-primary/5 lg:p-14 lg:rounded-[3.5rem] lg:border lg:border-zinc-50">
            <div className="absolute top-0 right-10 p-20 opacity-5 -z-0">
               <Zap className="w-32 h-32 text-primary" />
            </div>
            
            <div className="space-y-12 relative z-10">
               <div className="space-y-4">
                  <h3 className="text-4xl md:text-5xl font-black italic tracking-tighter leading-none italic uppercase">Akses Portal.</h3>
                  <p className="text-muted-foreground font-medium italic">Silakan masukkan kredensial resmi Anda untuk mengelola kewajiban perpajakan daerah.</p>
               </div>

               <form onSubmit={handleSubmit} className="space-y-8">
                  <div className="space-y-8">
                      <div className="space-y-4 group">
                         <div className="relative font-bold group">
                            <Mail className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-300 group-focus-within:text-primary transition-colors" />
                            <input
                               type="email"
                               value={email}
                               onChange={(e) => setEmail(e.target.value)}
                               placeholder="Email"
                               required
                               className="w-full pl-16 pr-8 h-16 bg-zinc-50 border border-zinc-200 rounded-[1.5rem] focus:ring-4 focus:ring-primary/10 focus:border-primary/30 outline-none transition-all font-black text-sm shadow-inner"
                            />
                         </div>
                      </div>
                      <div className="space-y-4 group">
                         <div className="relative font-bold group">
                            <Lock className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-300 group-focus-within:text-primary transition-colors" />
                            <input
                               type="password"
                               value={password}
                               onChange={(e) => setPassword(e.target.value)}
                               placeholder="Kata Sandi"
                               required
                               className="w-full pl-16 pr-8 h-16 bg-zinc-50 border border-zinc-200 rounded-[1.5rem] focus:ring-4 focus:ring-primary/10 focus:border-primary/30 outline-none transition-all font-black text-sm tracking-widest shadow-inner"
                            />
                            <button type="button" onClick={() => toast({ title: "Info", description: "Fitur reset password akan segera tersedia. Hubungi admin untuk bantuan.", type: "info" })} className="absolute right-6 top-1/2 -translate-y-1/2 text-[10px] font-black uppercase tracking-widest text-primary hover:underline italic z-10 cursor-pointer">Lupa Sandi?</button>
                         </div>
                      </div>
                  </div>

                  {error && (
                     <div className="p-5 bg-red-50 border border-red-200 text-red-600 rounded-2xl text-xs font-black italic flex items-center gap-4 animate-in fade-in scale-95 slide-in-from-top-2 duration-500">
                        <span className="w-8 h-8 rounded-lg bg-red-100 flex items-center justify-center shrink-0">!</span>
                        {error}
                     </div>
                  )}

                  <Button
                     type="submit"
                     disabled={loading}
                     size="xl"
                     className="w-full h-18 btn-premium rounded-[1.5rem] shadow-2xl relative overflow-hidden group shadow-primary/20"
                  >
                     {loading ? (
                        <div className="flex items-center gap-3">
                           <Loader2 className="w-5 h-5 animate-spin" />
                           <span className="text-xs font-black uppercase tracking-widest">Memproses Enkripsi...</span>
                        </div>
                     ) : (
                        <div className="flex items-center justify-center gap-3">
                           <span className="text-xs font-black uppercase tracking-widest transition-transform group-hover:scale-105">Masuk Gateway</span>
                           <ArrowRight className="w-4 h-4 group-hover:translate-x-2 transition-transform" />
                        </div>
                     )}
                  </Button>
               </form>

               <div className="pt-10 flex flex-col items-center gap-4 border-t border-zinc-50">
                  <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Belum Memiliki ID Wajib Pajak?</p>
                  <Link href="/register">
                     <Button variant="ghost" className="rounded-full gap-2 font-black uppercase text-[10px] tracking-widest border-zinc-100 border-b-2 hover:border-primary px-8 h-12 transition-all">Daftar Akun Baru <Sparkles className="w-3 h-3 text-primary" /></Button>
                  </Link>
               </div>
            </div>
         </Card>

         {/* Right-Footer Badge Only */}
         <div className="absolute bottom-12 right-12 hidden md:flex items-center gap-2 opacity-30">
            <div className="w-4 h-4 bg-primary rounded-full animate-pulse shadow-glow" />
            <p className="text-[8px] font-black uppercase tracking-widest italic">Server Status: Online & Integrated</p>
         </div>
      </div>
    </div>
  );
}
