"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { User, Mail, Shield, Phone, MapPin, Key, Loader2, Save, CheckCircle2, AlertTriangle, Eye, EyeOff, FileText, Building } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Skeleton } from "@/components/ui/Skeleton";
import { useToast } from "@/lib/hooks/use-toast";

export default function ProfilePage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { toast } = useToast();

  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({ name: "", phone: "", address: "" });
  const [passwordForm, setPasswordForm] = useState({ currentPassword: "", newPassword: "", confirmPassword: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.replace("/login?callbackUrl=/dashboard/profile");
    }
  }, [status, router]);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await fetch("/api/profile");
        if (!res.ok) throw new Error("Failed to fetch profile");
        const data = await res.json();
        setProfile(data.user || data);
        setForm({
          name: data.user?.name || data.name || "",
          phone: data.user?.phone || data.phone || "",
          address: data.user?.address || data.address || "",
        });
      } catch (err) {
        console.error("[PROFILE_FETCH_ERROR]", err);
      } finally {
        setLoading(false);
      }
    };
    if (status === "authenticated") fetchProfile();
  }, [status]);

  const handleUpdateProfile = async () => {
    setSaving(true);
    try {
      const res = await fetch("/api/users/" + session?.user?.id, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: form.name, phone: form.phone, address: form.address }),
      });
      if (!res.ok) throw new Error("Failed to update profile");
      toast("Berhasil", "Profil berhasil diperbarui", "success");
    } catch (err) {
      toast("Gagal", "Gagal memperbarui profil", "error");
    } finally {
      setSaving(false);
    }
  };

  const handleChangePassword = async () => {
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast("Error", "Konfirmasi password tidak cocok", "error");
      return;
    }
    if (passwordForm.newPassword.length < 6) {
      toast("Error", "Password minimal 6 karakter", "error");
      return;
    }
    setChangingPassword(true);
    try {
      const res = await fetch("/api/profile/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          currentPassword: passwordForm.currentPassword,
          newPassword: passwordForm.newPassword,
        }),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Gagal mengubah password");
      }
      toast("Berhasil", "Password berhasil diubah", "success");
      setPasswordForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
    } catch (err: any) {
      toast("Gagal", err.message, "error");
    } finally {
      setChangingPassword(false);
    }
  };

  const roleBadge = (role: string) => {
    const styles: Record<string, string> = {
      ADMIN: "bg-red-100 text-red-700 border-red-200",
      OFFICER: "bg-blue-100 text-blue-700 border-blue-200",
      USER: "bg-emerald-100 text-emerald-700 border-emerald-200",
      MAHASISWA: "bg-purple-100 text-purple-700 border-purple-200",
      DEVELOPER: "bg-amber-100 text-amber-700 border-amber-200",
    };
    return styles[role] || "bg-zinc-100 text-zinc-700 border-zinc-200";
  };

  if (status === "loading" || loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Loader2 className="w-12 h-12 text-[#1E40AF] animate-spin" />
      </div>
    );
  }

  const user = profile || session?.user;

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      {/* Profile Header */}
      <div className="flex items-center gap-6">
        <div className="w-20 h-20 rounded-full bg-gradient-to-br from-[#1E40AF] to-[#3B82F6] flex items-center justify-center text-white text-3xl font-bold shadow-lg shadow-[#1E40AF]/20">
          {(user?.name || "U")[0].toUpperCase()}
        </div>
        <div>
          <h1 className="text-3xl font-black tracking-tight">{user?.name || "Pengguna"}</h1>
          <div className="flex items-center gap-3 mt-2">
            <span className={`text-xs font-bold px-3 py-1 rounded-full border ${roleBadge(user?.role)}`}>
              {user?.role}
            </span>
            <span className="text-sm text-zinc-500">{user?.email}</span>
          </div>
        </div>
      </div>

      {/* Profile Information */}
      <Card className="p-8">
        <h2 className="text-lg font-black tracking-tight mb-6 flex items-center gap-3">
          <User className="w-5 h-5 text-[#1E40AF]" />
          INFORMASI PROFIL
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="text-xs font-bold text-zinc-400 uppercase tracking-widest">Nama Lengkap</label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="w-full mt-1.5 px-4 py-3 bg-zinc-50 border border-zinc-200 rounded-xl outline-none focus:bg-white focus:border-[#1E40AF]/50 transition-all text-sm font-semibold"
            />
          </div>
          <div>
            <label className="text-xs font-bold text-zinc-400 uppercase tracking-widest">Email</label>
            <div className="mt-1.5 px-4 py-3 bg-zinc-50 border border-zinc-200 rounded-xl text-sm font-semibold text-zinc-400 flex items-center gap-2">
              <Mail className="w-4 h-4" />
              {user?.email}
            </div>
          </div>
          <div>
            <label className="text-xs font-bold text-zinc-400 uppercase tracking-widest">Role</label>
            <div className="mt-1.5 px-4 py-3 bg-zinc-50 border border-zinc-200 rounded-xl text-sm font-semibold text-zinc-400 flex items-center gap-2">
              <Shield className="w-4 h-4" />
              {user?.role}
            </div>
          </div>
          <div>
            <label className="text-xs font-bold text-zinc-400 uppercase tracking-widest">NIK</label>
            <div className="mt-1.5 px-4 py-3 bg-zinc-50 border border-zinc-200 rounded-xl text-sm font-semibold text-zinc-400 flex items-center gap-2">
              <FileText className="w-4 h-4" />
              {user?.nik || "-"}
            </div>
          </div>
          <div>
            <label className="text-xs font-bold text-zinc-400 uppercase tracking-widest">No. Telepon</label>
            <input
              type="text"
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
              className="w-full mt-1.5 px-4 py-3 bg-zinc-50 border border-zinc-200 rounded-xl outline-none focus:bg-white focus:border-[#1E40AF]/50 transition-all text-sm font-semibold"
            />
          </div>
          <div>
            <label className="text-xs font-bold text-zinc-400 uppercase tracking-widest">Institusi</label>
            <div className="mt-1.5 px-4 py-3 bg-zinc-50 border border-zinc-200 rounded-xl text-sm font-semibold text-zinc-400 flex items-center gap-2">
              <Building className="w-4 h-4" />
              {user?.institution || "-"}
            </div>
          </div>
        </div>
        <div className="mt-6">
          <label className="text-xs font-bold text-zinc-400 uppercase tracking-widest">Alamat</label>
          <textarea
            value={form.address}
            onChange={(e) => setForm({ ...form, address: e.target.value })}
            rows={2}
            className="w-full mt-1.5 px-4 py-3 bg-zinc-50 border border-zinc-200 rounded-xl outline-none focus:bg-white focus:border-[#1E40AF]/50 transition-all text-sm font-semibold resize-none"
          />
        </div>
        <div className="mt-6 flex justify-end">
          <Button onClick={handleUpdateProfile} disabled={saving}>
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            Simpan Perubahan
          </Button>
        </div>
      </Card>

      {/* Change Password */}
      <Card className="p-8">
        <h2 className="text-lg font-black tracking-tight mb-6 flex items-center gap-3">
          <Key className="w-5 h-5 text-[#1E40AF]" />
          UBAH PASSWORD
        </h2>
        <div className="space-y-4">
          <div>
            <label className="text-xs font-bold text-zinc-400 uppercase tracking-widest">Password Saat Ini</label>
            <div className="relative mt-1.5">
              <input
                type={showPassword ? "text" : "password"}
                value={passwordForm.currentPassword}
                onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                className="w-full px-4 py-3 pr-12 bg-zinc-50 border border-zinc-200 rounded-xl outline-none focus:bg-white focus:border-[#1E40AF]/50 transition-all text-sm font-semibold"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>
          <div>
            <label className="text-xs font-bold text-zinc-400 uppercase tracking-widest">Password Baru</label>
            <div className="relative mt-1.5">
              <input
                type={showNewPassword ? "text" : "password"}
                value={passwordForm.newPassword}
                onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                className="w-full px-4 py-3 pr-12 bg-zinc-50 border border-zinc-200 rounded-xl outline-none focus:bg-white focus:border-[#1E40AF]/50 transition-all text-sm font-semibold"
              />
              <button
                type="button"
                onClick={() => setShowNewPassword(!showNewPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600"
              >
                {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>
          <div>
            <label className="text-xs font-bold text-zinc-400 uppercase tracking-widest">Konfirmasi Password Baru</label>
            <input
              type="password"
              value={passwordForm.confirmPassword}
              onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
              className="w-full mt-1.5 px-4 py-3 bg-zinc-50 border border-zinc-200 rounded-xl outline-none focus:bg-white focus:border-[#1E40AF]/50 transition-all text-sm font-semibold"
            />
          </div>
        </div>
        <div className="mt-6 flex justify-end">
          <Button onClick={handleChangePassword} disabled={changingPassword}>
            {changingPassword ? <Loader2 className="w-4 h-4 animate-spin" /> : <Key className="w-4 h-4" />}
            Ubah Password
          </Button>
        </div>
      </Card>
    </div>
  );
}
