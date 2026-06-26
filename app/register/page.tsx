"use client";

import Link from "next/link";
import { User, Lock, Mail, ArrowLeft, Phone, CreditCard, GraduationCap } from "lucide-react";
import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Image from "next/image";

const ROLES = [
  { value: "USER", label: "Wajib Pajak", icon: User, desc: "Akses layanan pajak pribadi" },
  { value: "MAHASISWA", label: "Mahasiswa / Peneliti", icon: GraduationCap, desc: "Akses untuk keperluan riset" },
] as const;

export default function RegisterPage() {
  const [form, setForm] = useState({ name: "", email: "", password: "", nik: "", phone: "", role: "USER" as "USER" | "MAHASISWA" });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Registrasi gagal.");
        setIsLoading(false);
        return;
      }

      // Auto login after register
      const loginRes = await signIn("credentials", {
        email: form.email,
        password: form.password,
        redirect: false,
      });

      if (loginRes?.ok) {
        router.push("/dashboard");
      } else {
        router.push("/login");
      }
    } catch {
      setError("Terjadi kesalahan. Silakan coba lagi.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-background">
      {/* Left Decoration */}
      <div className="hidden lg:flex w-1/2 bg-primary relative p-20 flex-col justify-between overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-primary via-primary/90 to-green-900" />
        <div className="absolute -bottom-20 -right-20 w-[600px] h-[600px] bg-white/5 rounded-full blur-[100px]" />
        <div className="absolute top-32 -left-20 w-[400px] h-[400px] bg-white/5 rounded-full blur-[80px]" />

        <Link href="/" className="relative z-10 flex items-center gap-2 group text-white">
          <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
          <span className="font-bold text-sm tracking-widest uppercase">Kembali ke Beranda</span>
        </Link>

        <div className="relative z-10 space-y-8">
          <div className="inline-flex items-center gap-3 px-6 py-2 rounded-full bg-white/10 border border-white/20">
             <div className="w-20 h-7 bg-white rounded-lg flex items-center justify-center">
                <Image src="/logo.png" alt="Logo" width={64} height={19} className="object-contain" />
             </div>
            <span className="text-sm font-bold text-white tracking-widest uppercase">SIPADA MEDAN</span>
          </div>
          <h1 className="text-6xl font-black tracking-tight text-white leading-tight">
            Daftar &amp; Akses <br /> Layanan Digital
          </h1>
          <p className="text-xl text-white/70 max-w-lg leading-relaxed font-medium">
            Bergabunglah dengan 450.000+ wajib pajak Kota Medan dalam platform perpajakan digital terpadu.
          </p>

          <div className="grid grid-cols-2 gap-4">
            {[
              { label: "Keamanan Data", desc: "Enkripsi SSL 256-bit" },
              { label: "Layanan 24/7", desc: "Dukungan penuh" },
              { label: "Transaksi Cepat", desc: "Proses &lt; 5 detik" },
              { label: "Multi-Platform", desc: "Web & Mobile" },
            ].map((f) => (
              <div key={f.label} className="p-4 rounded-2xl bg-white/10 border border-white/10">
                <p className="font-bold text-white text-sm">{f.label}</p>
                 <p className="text-white/80 text-xs mt-1">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="relative z-10 pt-10 border-t border-white/10">
           <p className="text-white/70 text-sm font-medium">© 2026 Bapenda Kota Medan. Hak Cipta Dilindungi.</p>
        </div>
      </div>

      {/* Right Form */}
      <div className="flex-1 flex flex-col items-center justify-center p-8 md:p-16 overflow-y-auto">
        <div className="lg:hidden mb-8 self-start">
             <Link href="/" className="flex items-center gap-2 text-primary font-black uppercase text-[10px] tracking-widest italic">
               <ArrowLeft className="w-4 h-4" /> Beranda
             </Link>
        </div>

        <div className="max-w-md w-full space-y-8">
          <div className="space-y-3">
            <h2 className="text-4xl font-extrabold tracking-tight">Buat Akun Baru</h2>
            <p className="text-muted-foreground font-medium leading-relaxed">
              Isi data di bawah untuk mendaftar ke portal SIPADA Medan.
            </p>
          </div>

          {/* Role Selector */}
          <div className="grid grid-cols-2 gap-3">
            {ROLES.map((r) => (
              <button
                key={r.value}
                type="button"
                onClick={() => setForm((p) => ({ ...p, role: r.value }))}
                className={`p-4 rounded-2xl border-2 text-left transition-all ${
                  form.role === r.value
                    ? "border-primary bg-primary/5"
                    : "border-border hover:border-primary/30"
                }`}
              >
                <r.icon className={`w-6 h-6 mb-2 ${form.role === r.value ? "text-primary" : "text-muted-foreground"}`} />
                <p className="font-bold text-sm">{r.label}</p>
                 <p className="text-xs text-zinc-600 mt-0.5">{r.desc}</p>
              </button>
            ))}
          </div>

          {error && (
            <div className="p-4 rounded-2xl bg-destructive/10 border border-destructive/20 text-destructive font-medium text-sm">
              ⚠️ {error}
            </div>
          )}

          <form onSubmit={handleRegister} className="space-y-5">
            {/* Name */}
            <div className="group relative">
              <div className="absolute inset-y-0 left-5 flex items-center text-muted-foreground pointer-events-none group-focus-within:text-primary transition-colors">
                <User className="w-5 h-5" />
              </div>
              <input
                name="name"
                type="text"
                placeholder="Nama Lengkap"
                value={form.name}
                onChange={handleChange}
                className="w-full pl-14 pr-6 py-4 bg-muted/30 border border-transparent rounded-2xl focus:ring-2 focus:ring-primary/20 focus:bg-white focus:border-primary/20 transition-all font-medium outline-none"
                required
              />
            </div>

            {/* Email */}
            <div className="group relative">
              <div className="absolute inset-y-0 left-5 flex items-center text-muted-foreground pointer-events-none group-focus-within:text-primary transition-colors">
                <Mail className="w-5 h-5" />
              </div>
              <input
                name="email"
                type="email"
                placeholder="Alamat Email"
                value={form.email}
                onChange={handleChange}
                className="w-full pl-14 pr-6 py-4 bg-muted/30 border border-transparent rounded-2xl focus:ring-2 focus:ring-primary/20 focus:bg-white focus:border-primary/20 transition-all font-medium outline-none"
                required
              />
            </div>

            {/* NIK */}
            <div className="group relative">
              <div className="absolute inset-y-0 left-5 flex items-center text-muted-foreground pointer-events-none group-focus-within:text-primary transition-colors">
                <CreditCard className="w-5 h-5" />
              </div>
              <input
                name="nik"
                type="text"
                placeholder="NIK KTP (16 digit) — Opsional"
                value={form.nik}
                onChange={handleChange}
                maxLength={16}
                pattern="\d{16}"
                className="w-full pl-14 pr-6 py-4 bg-muted/30 border border-transparent rounded-2xl focus:ring-2 focus:ring-primary/20 focus:bg-white focus:border-primary/20 transition-all font-medium outline-none"
              />
            </div>

            {/* Phone */}
            <div className="group relative">
              <div className="absolute inset-y-0 left-5 flex items-center text-muted-foreground pointer-events-none group-focus-within:text-primary transition-colors">
                <Phone className="w-5 h-5" />
              </div>
              <input
                name="phone"
                type="tel"
                placeholder="Nomor HP — Opsional"
                value={form.phone}
                onChange={handleChange}
                className="w-full pl-14 pr-6 py-4 bg-muted/30 border border-transparent rounded-2xl focus:ring-2 focus:ring-primary/20 focus:bg-white focus:border-primary/20 transition-all font-medium outline-none"
              />
            </div>

            {/* Password */}
            <div className="group relative">
              <div className="absolute inset-y-0 left-5 flex items-center text-muted-foreground pointer-events-none group-focus-within:text-primary transition-colors">
                <Lock className="w-5 h-5" />
              </div>
              <input
                name="password"
                type="password"
                placeholder="Kata Sandi (min. 8 karakter)"
                value={form.password}
                onChange={handleChange}
                minLength={8}
                className="w-full pl-14 pr-6 py-4 bg-muted/30 border border-transparent rounded-2xl focus:ring-2 focus:ring-primary/20 focus:bg-white focus:border-primary/20 transition-all font-medium outline-none"
                required
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-4 bg-primary text-white font-bold rounded-2xl hover:bg-primary/90 transition-all shadow-xl shadow-primary/20 active:scale-95 text-lg disabled:opacity-50 disabled:active:scale-100 flex items-center justify-center gap-3"
            >
              {isLoading ? (
                <div className="w-6 h-6 border-4 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                "Daftar Sekarang"
              )}
            </button>
          </form>

          <p className="text-center text-muted-foreground font-medium">
            Sudah punya akun?{" "}
            <Link href="/login" className="text-primary font-bold hover:underline">
              Masuk Sekarang
            </Link>
          </p>

          <p className="text-center text-xs text-muted-foreground">
            Dengan mendaftar, Anda menyetujui{" "}
            <a href="#" className="text-primary hover:underline">Syarat &amp; Ketentuan</a>{" "}
            dan{" "}
            <a href="#" className="text-primary hover:underline">Kebijakan Privasi</a>{" "}
            Bapenda Kota Medan.
          </p>
        </div>
      </div>
    </div>
  );
}
