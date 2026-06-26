"use client";

import { useEffect, useState, useCallback } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { 
  Users, Search, ShieldAlert, Star, 
  Activity, ArrowRight, Filter, ShieldCheck, 
  Trash2, Plus, X, Loader2, Eye, Mail, User as UserIcon, Edit2, CheckCircle2, AlertTriangle, Phone, Lock, MapPin, Calendar, Clock, CreditCard, ChevronDown
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Skeleton } from "@/components/ui/Skeleton";
import { useToast } from "@/lib/hooks/use-toast";
import { cn } from "@/lib/utils";

interface Payment {
  id: string;
  amount: number;
  status: string;
  taxPeriod: string;
  createdAt: string;
  taxObject: { name: string; nop: string };
}

interface AuditLog {
  id: string;
  action: string;
  table: string;
  createdAt: string;
  oldValue: any;
  newValue: any;
}

interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  nik?: string;
  phone?: string;
  address?: string;
  isActive: boolean;
  createdAt: string;
  _count: { taxObjects: number; payments: number };
  payments: Payment[];
  auditLogs: AuditLog[];
}

const ROLES = ["USER", "OFFICER", "ADMIN", "MAHASISWA"] as const;
type UserRole = (typeof ROLES)[number];

const roleBadge: Record<string, string> = {
  ADMIN: "bg-purple-50 text-purple-600 border-purple-100 shadow-purple-500/5",
  OFFICER: "bg-blue-50 text-blue-600 border-blue-100 shadow-blue-500/5",
  USER: "bg-emerald-50 text-emerald-600 border-emerald-100 shadow-emerald-500/5",
  MAHASISWA: "bg-amber-50 text-amber-600 border-amber-100 shadow-amber-500/5",
};

const roleLabel: Record<string, string> = {
  ADMIN: "Super Admin",
  OFFICER: "Petugas Pajak",
  USER: "Wajib Pajak",
  MAHASISWA: "Civitas Research",
};

const MEDAN_REGIONS = [
  "Medan Baru",
  "Medan Petisah",
  "Medan Sunggal",
  "Medan Helvetia",
  "Medan Johor",
  "Medan Area",
  "Medan Polonia"
];

function formatCurrency(val: number) {
  return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(val);
}

export default function AdminUsersPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "authenticated" && (session?.user as any)?.role !== "ADMIN") {
      router.replace("/dashboard");
    }
  }, [session, status, router]);

  const { toast } = useToast();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterRole, setFilterRole] = useState("ALL");
  const [filterStatus, setFilterStatus] = useState("ALL");
  const [filterPayment, setFilterPayment] = useState("ALL");
  const [filterRegion, setFilterRegion] = useState("ALL");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const pageSize = 20;
  
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [createLoading, setCreateLoading] = useState(false);
  const [editLoading, setEditLoading] = useState(false);

  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  const [newUser, setNewUser] = useState({
    name: "", email: "", password: "", role: "USER" as UserRole, nik: "", phone: "", address: "", isActive: true
  });

  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [editForm, setEditForm] = useState({
    name: "", email: "", role: "USER" as UserRole, nik: "", phone: "", address: "", isActive: true, password: ""
  });

  const fetchUsers = useCallback(() => {
    if (status !== "authenticated" || (session?.user as any)?.role !== "ADMIN") return;
    setLoading(true);
    fetch("/api/users")
      .then((r) => r.json())
      .then((d) => setUsers(d.users ?? []))
      .catch(() => toast("Gagal Sinkronisasi", "Sistem tidak dapat memanggil data identitas dari database pusat.", "error"))
      .finally(() => setLoading(false));
  }, [toast, status, session]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  if (status === "loading" || (session?.user as any)?.role !== "ADMIN") {
     return (
        <div className="min-h-[60vh] flex items-center justify-center">
           <Loader2 className="w-12 h-12 text-[#1E40AF] animate-spin" />
        </div>
     );
  }

  const validateNIK = (nik: string) => {
    if (!nik) return true; // optional in DB
    return /^\d{16}$/.test(nik);
  };

  const handleToggleActive = async (id: string, currentStatus: boolean) => {
    setUpdatingId(id);
    const newStatus = !currentStatus;
    try {
      const res = await fetch("/api/users", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, isActive: newStatus }),
      });
      if (!res.ok) throw new Error();
      
      setUsers((prev) => prev.map((u) => (u.id === id ? { ...u, isActive: newStatus } : u)));
      if (selectedUser?.id === id) {
        setSelectedUser(prev => prev ? { ...prev, isActive: newStatus } : null);
      }
      toast("Status Diperbarui", `User sekarang ${newStatus ? 'Aktif' : 'Nonaktif'}`, "success");
    } catch {
      toast("Kesalahan Sistem", "Gagal memperbarui status aktif user.", "error");
    } finally {
      setUpdatingId(null);
    }
  };

  const handleDelete = async (id: string) => {
     if (!confirm("Hapus identitas ini secara permanen dari sistem?")) return;
     setUpdatingId(id);
     try {
       const res = await fetch(`/api/users/${id}`, { method: "DELETE" });
       if (!res.ok) throw new Error();
       setUsers(prev => prev.filter(u => u.id !== id));
       toast("Terhapus", "Akun telah dimusnahkan dari database.", "success");
     } catch {
       toast("Gagal", "Sistem menolak perintah penghapusan.", "error");
     } finally {
       setUpdatingId(null);
     }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newUser.nik && !validateNIK(newUser.nik)) {
      toast("NIK Tidak Valid", "Nomor Induk Kependudukan (NIK) harus terdiri dari 16 digit angka.", "error");
      return;
    }
    setCreateLoading(true);
    try {
        const res = await fetch("/api/users", {
           method: "POST",
           headers: { "Content-Type": "application/json" },
           body: JSON.stringify(newUser)
        });
        if (!res.ok) {
          const errData = await res.json();
          throw new Error(errData.error || "Gagal");
        }
        setShowCreateModal(false);
        setNewUser({ name: "", email: "", password: "", role: "USER", nik: "", phone: "", address: "", isActive: true });
        fetchUsers();
        toast("Berhasil", "Node identitas baru telah didaftarkan dalam sistem.", "success");
    } catch (err: any) {
        toast("Error", err.message || "Gagal registrasi identitas baru.", "error");
    } finally {
        setCreateLoading(false);
    }
  };

  const openEditModal = (user: User) => {
    setEditingUser(user);
    setEditForm({
      name: user.name || "",
      email: user.email || "",
      role: user.role || "USER",
      nik: user.nik || "",
      phone: user.phone || "",
      address: user.address || "",
      isActive: user.isActive,
      password: ""
    });
    setShowEditModal(true);
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;
    if (editForm.nik && !validateNIK(editForm.nik)) {
      toast("NIK Tidak Valid", "Nomor Induk Kependudukan (NIK) harus terdiri dari 16 digit angka.", "error");
      return;
    }
    setEditLoading(true);
    try {
      const res = await fetch("/api/users", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: editingUser.id,
          ...editForm,
          password: editForm.password || undefined
        }),
      });
      if (!res.ok) throw new Error();
      setShowEditModal(false);
      fetchUsers();
      toast("Berhasil", "Identitas user telah diperbarui.", "success");
    } catch {
      toast("Error", "Gagal memperbarui data user.", "error");
    } finally {
      setEditLoading(false);
    }
  };

  const openDetailModal = (user: User) => {
    setSelectedUser(user);
    setShowDetailModal(true);
  };

  const getUserPaymentStatus = (user: User) => {
    if (!user.payments || user.payments.length === 0) return "LUNAS";
    const hasArrears = user.payments.some(p => p.status === "PENDING" || p.status === "EXPIRED");
    return hasArrears ? "MENUNGGAK" : "LUNAS";
  };

  useEffect(() => {
    setPage(1);
  }, [search, filterRole, filterStatus, filterPayment, filterRegion]);

  const filtered = users.filter((u) => {
    const matchSearch =
      u.name?.toLowerCase().includes(search.toLowerCase()) ||
      u.email?.toLowerCase().includes(search.toLowerCase()) ||
      u.nik?.includes(search);
    const matchRole = filterRole === "ALL" || u.role === filterRole;
    
    // Status Filter (Active / Inactive)
    const matchStatus = filterStatus === "ALL" || 
      (filterStatus === "ACTIVE" && u.isActive) ||
      (filterStatus === "INACTIVE" && !u.isActive);

    // Payment Status Filter (Lunas / Menunggak)
    const pStatus = getUserPaymentStatus(u);
    const matchPayment = filterPayment === "ALL" || pStatus === filterPayment;

    // Region Filter (Address containment)
    const matchRegion = filterRegion === "ALL" || 
      (u.address && u.address.toLowerCase().includes(filterRegion.toLowerCase()));

    return matchSearch && matchRole && matchStatus && matchPayment && matchRegion;
  });

  const totalFilteredPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const paginatedUsers = filtered.slice((page - 1) * pageSize, page * pageSize);

  return (
    <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-1000 pb-20 w-full text-left">
      
      {/* ── Page Header ── */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-10">
        <div className="space-y-4">
          <div className="flex items-center gap-3 text-primary">
             <div className="w-10 h-1 bg-primary rounded-full shadow-glow" />
             <p className="text-[10px] font-black uppercase tracking-[0.3em] italic leading-none">Security Identity Hub</p>
          </div>
          <h1 className="text-5xl md:text-7xl font-black italic tracking-tighter leading-[0.85] text-foreground uppercase italic underline decoration-primary/10 decoration-8 underline-offset-8">
            Manajemen <span className="text-primary italic">User.</span>
          </h1>
          <p className="text-xl text-muted-foreground font-medium max-w-xl leading-relaxed italic border-l-4 border-primary/10 pl-8 ml-2">
            &quot;Sistem pengelolaan wajib pajak dan petugas PBB-P2 dengan monitoring pembayaran serta validasi kependudukan terpadu.&quot;
          </p>
        </div>
        <div className="flex items-center gap-6">
            <Button 
               size="xl" 
               onClick={() => setShowCreateModal(true)}
               className="btn-premium px-10 h-20 rounded-full font-black uppercase text-xs tracking-widest shadow-2xl shadow-primary/30 group"
            >
               Registrasi User <Plus className="ml-4 w-5 h-5 group-hover:rotate-90 transition-transform" />
            </Button>
            <Card padding="lg" variant="outline" className="hidden xl:flex bg-zinc-50 border border-zinc-100 rounded-[2.5rem] shadow-inner py-4 px-8 min-w-[200px] text-right">
               <div className="space-y-1">
                  <p className="text-[10px] font-black uppercase text-zinc-400 tracking-[0.3em] italic leading-none">Total Nodes</p>
                   <p className="text-2xl font-black italic tracking-tighter uppercase">{filtered.length} <span className="text-primary tracking-normal font-sans text-xs">Identities</span></p>
               </div>
            </Card>
        </div>
      </div>

      {/* ── Search & Filter ── */}
      <div className="flex flex-col gap-6 pt-6 bg-zinc-50/50 p-8 rounded-[3rem] border border-zinc-100 relative z-30 overflow-visible">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Quick Search */}
          <div className="lg:col-span-4 relative group">
            <Search className="absolute left-8 top-1/2 -translate-y-1/2 w-6 h-6 text-zinc-300 group-focus-within:text-primary transition-colors" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Cari Identitas, Email, atau NIK Pengguna..."
              className="w-full pl-22 pr-10 h-20 bg-white border border-zinc-100 rounded-[2.5rem] outline-none shadow-2xl shadow-primary/[0.02] focus:ring-4 focus:ring-primary/10 focus:border-primary/20 transition-all font-bold text-sm tracking-tight italic"
            />
          </div>
          {/* Role Filter */}
          <div className="relative group lg:col-span-2">
             <select
               value={filterRole}
               onChange={(e) => setFilterRole(e.target.value)}
               className="w-full pl-8 pr-12 h-20 bg-white border border-zinc-100 rounded-[2.5rem] outline-none shadow-2xl shadow-primary/[0.02] focus:ring-4 focus:ring-primary/10 focus:border-primary/20 transition-all font-black text-xs uppercase tracking-widest appearance-none cursor-pointer italic"
             >
               <option value="ALL">Semua Role</option>
               {ROLES.map(r => <option key={r} value={r}>{roleLabel[r]}</option>)}
             </select>
             <ChevronDown className="absolute right-8 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400 pointer-events-none" />
          </div>
          {/* Status Filter */}
          <div className="relative group lg:col-span-2">
             <select
               value={filterStatus}
               onChange={(e) => setFilterStatus(e.target.value)}
               className="w-full pl-8 pr-12 h-20 bg-white border border-zinc-100 rounded-[2.5rem] outline-none shadow-2xl shadow-primary/[0.02] focus:ring-4 focus:ring-primary/10 focus:border-primary/20 transition-all font-black text-xs uppercase tracking-widest appearance-none cursor-pointer italic"
             >
               <option value="ALL">Semua Status Akun</option>
               <option value="ACTIVE">Aktif</option>
               <option value="INACTIVE">Nonaktif</option>
             </select>
             <ChevronDown className="absolute right-8 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400 pointer-events-none" />
          </div>
          {/* Payment Status Filter */}
          <div className="relative group lg:col-span-2">
             <select
               value={filterPayment}
               onChange={(e) => setFilterPayment(e.target.value)}
               className="w-full pl-8 pr-12 h-20 bg-white border border-zinc-100 rounded-[2.5rem] outline-none shadow-2xl shadow-primary/[0.02] focus:ring-4 focus:ring-primary/10 focus:border-primary/20 transition-all font-black text-xs uppercase tracking-widest appearance-none cursor-pointer italic"
             >
               <option value="ALL">Semua Status Bayar</option>
               <option value="LUNAS">Lunas Pajak</option>
               <option value="MENUNGGAK">Menunggak / Piutang</option>
             </select>
             <ChevronDown className="absolute right-8 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400 pointer-events-none" />
          </div>
          {/* Region Filter */}
          <div className="relative group lg:col-span-2">
             <select
               value={filterRegion}
               onChange={(e) => setFilterRegion(e.target.value)}
               className="w-full pl-8 pr-12 h-20 bg-white border border-zinc-100 rounded-[2.5rem] outline-none shadow-2xl shadow-primary/[0.02] focus:ring-4 focus:ring-primary/10 focus:border-primary/20 transition-all font-black text-xs uppercase tracking-widest appearance-none cursor-pointer italic"
             >
               <option value="ALL">Semua Wilayah</option>
               {MEDAN_REGIONS.map(reg => <option key={reg} value={reg}>{reg}</option>)}
             </select>
             <ChevronDown className="absolute right-8 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400 pointer-events-none" />
          </div>
        </div>
      </div>

      {/* ── Users Table ── */}
      <Card padding="none" className="bg-white border-zinc-100 rounded-[3rem] overflow-hidden shadow-xl shadow-primary/[0.02]">
        <div className="overflow-x-auto w-full">
           <table className="w-full text-left border-collapse min-w-[900px]">
              <thead>
                 <tr className="bg-zinc-50 border-b border-zinc-100">
                    <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-zinc-400">Nama / Kode Node</th>
                    <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-zinc-400">Alamat / Kontak</th>
                    <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-zinc-400">NIK</th>
                    <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-zinc-400">Role</th>
                    <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-zinc-400">Status Bayar</th>
                    <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-zinc-400">Status</th>
                    <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-zinc-400 text-center">Aksi</th>
                 </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100">
                 {loading ? (
                    <tr>
                       <td colSpan={7} className="p-8"><div className="flex justify-center"><Loader2 className="w-8 h-8 text-primary animate-spin" /></div></td>
                    </tr>
                  ) : paginatedUsers.length === 0 ? (
                     <tr>
                        <td colSpan={7} className="px-8 py-16 text-center text-zinc-300 italic font-bold">Void List — Tidak ada user ditemukan.</td>
                     </tr>
                  ) : (
                     paginatedUsers.map((u) => {
                      const payStatus = getUserPaymentStatus(u);
                      return (
                        <tr key={u.id} className="hover:bg-zinc-50/30 transition-colors font-bold text-zinc-800">
                           <td className="px-8 py-6">
                              <div className="flex items-center gap-4">
                                 <div className="w-10 h-10 bg-primary/5 text-primary rounded-xl flex items-center justify-center font-black text-lg italic">
                                    {u.name?.[0] ?? "U"}
                                 </div>
                                 <div>
                                    <p className="text-xs font-black uppercase tracking-tight text-zinc-900 leading-none">{u.name}</p>
                                    <span className="text-[9px] font-black text-zinc-400 uppercase italic">NODE: {u.id.slice(-8).toUpperCase()}</span>
                                 </div>
                              </div>
                           </td>
                           <td className="px-8 py-6">
                              <p className="text-xs font-bold text-zinc-700 leading-none">{u.email}</p>
                              <p className="text-[9px] text-zinc-400 font-black mt-1 uppercase tracking-tight truncate max-w-[180px]">{u.address || "Belum ada alamat"}</p>
                           </td>
                           <td className="px-8 py-6 text-xs text-zinc-500 font-bold">{u.nik || "—"}</td>
                           <td className="px-8 py-6">
                              <span className={cn("px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest border italic leading-none shadow-sm", roleBadge[u.role])}>
                                 {roleLabel[u.role] ?? u.role}
                              </span>
                           </td>
                           <td className="px-8 py-6">
                              {u.role === "USER" ? (
                                <span className={cn(
                                  "px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border leading-none",
                                  payStatus === "LUNAS" 
                                    ? "bg-emerald-50 text-emerald-600 border-emerald-100" 
                                    : "bg-rose-50 text-rose-600 border-rose-100"
                                )}>
                                  {payStatus}
                                </span>
                              ) : (
                                <span className="text-zinc-300 text-xs italic font-medium">—</span>
                              )}
                           </td>
                           <td className="px-8 py-6">
                              <button
                                onClick={() => handleToggleActive(u.id, u.isActive)}
                                disabled={updatingId === u.id}
                                className={cn(
                                   "px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest border transition-all cursor-pointer",
                                   u.isActive 
                                      ? "bg-emerald-50 text-emerald-600 border-emerald-100 hover:bg-emerald-100" 
                                      : "bg-red-50 text-red-500 border-red-100 hover:bg-red-100"
                                )}
                              >
                                 {u.isActive ? "Aktif" : "Nonaktif"}
                              </button>
                           </td>
                           <td className="px-8 py-6 text-center">
                              <div className="flex items-center justify-center gap-3">
                                 <button
                                   onClick={() => openDetailModal(u)}
                                   className="p-3 rounded-xl bg-zinc-50 border border-zinc-100 text-zinc-400 hover:text-primary hover:bg-primary/5 transition-all shadow-sm cursor-pointer"
                                   title="Detail & Riwayat"
                                 >
                                    <Eye className="w-4 h-4" />
                                 </button>
                                 <button
                                   onClick={() => openEditModal(u)}
                                   disabled={updatingId === u.id}
                                   className="p-3 rounded-xl bg-zinc-50 border border-zinc-100 text-zinc-400 hover:text-primary hover:bg-primary/5 transition-all shadow-sm cursor-pointer"
                                   title="Edit User / Reset Password"
                                 >
                                    <Edit2 className="w-4 h-4" />
                                 </button>
                                 <button
                                   onClick={() => handleDelete(u.id)}
                                   disabled={updatingId === u.id}
                                   className="p-3 rounded-xl bg-red-50 border border-red-100 text-red-500 hover:bg-red-500 hover:text-white transition-all shadow-sm cursor-pointer"
                                   title="Hapus User"
                                 >
                                    <Trash2 className="w-4 h-4" />
                                 </button>
                              </div>
                           </td>
                        </tr>
                      );
                    })
                 )}
              </tbody>
            </table>
         </div>

         {/* ── Pagination ── */}
         {!loading && totalFilteredPages > 1 && (
            <div className="flex items-center justify-between px-8 py-6 border-t border-zinc-100">
               <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400 italic">
                  Menampilkan {(page - 1) * pageSize + 1}–{Math.min(page * pageSize, filtered.length)} dari {filtered.length} identitas
               </p>
               <div className="flex items-center gap-3">
                  <button
                     onClick={() => setPage(p => Math.max(1, p - 1))}
                     disabled={page <= 1}
                     className="px-6 py-3 rounded-full bg-zinc-50 border border-zinc-100 text-zinc-600 font-black text-[10px] uppercase tracking-widest hover:bg-zinc-100 disabled:opacity-30 disabled:cursor-not-allowed transition-all cursor-pointer"
                  >
                     Sebelumnya
                  </button>
                  <div className="flex items-center gap-1.5">
                     {Array.from({ length: Math.min(totalFilteredPages, 7) }, (_, i) => {
                        let pageNum: number;
                        if (totalFilteredPages <= 7) {
                           pageNum = i + 1;
                        } else if (page <= 4) {
                           pageNum = i + 1;
                        } else if (page >= totalFilteredPages - 3) {
                           pageNum = totalFilteredPages - 6 + i;
                        } else {
                           pageNum = page - 3 + i;
                        }
                        return (
                           <button
                              key={pageNum}
                              onClick={() => setPage(pageNum)}
                              className={cn(
                                 "w-10 h-10 rounded-full text-[11px] font-black transition-all cursor-pointer",
                                 page === pageNum
                                    ? "bg-primary text-white shadow-lg shadow-primary/30"
                                    : "text-zinc-400 hover:bg-zinc-50"
                              )}
                           >
                              {pageNum}
                           </button>
                        );
                     })}
                  </div>
                  <button
                     onClick={() => setPage(p => Math.min(totalFilteredPages, p + 1))}
                     disabled={page >= totalFilteredPages}
                     className="px-6 py-3 rounded-full bg-zinc-50 border border-zinc-100 text-zinc-600 font-black text-[10px] uppercase tracking-widest hover:bg-zinc-100 disabled:opacity-30 disabled:cursor-not-allowed transition-all cursor-pointer"
                  >
                     Selanjutnya
                  </button>
               </div>
            </div>
         )}
      </Card>

      {/* ── Create Modal ── */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-zinc-950/40 backdrop-blur-md p-6 text-left animate-in fade-in duration-500">
           <Card padding="none" className="bg-white rounded-[5rem] shadow-2xl w-full max-w-2xl max-h-[92vh] overflow-y-auto border border-zinc-100 animate-in zoom-in-95 duration-500 relative p-12 lg:p-20">
              <div className="flex items-start justify-between mb-16">
                 <div className="space-y-3">
                    <h2 className="text-4xl lg:text-6xl font-black italic tracking-tighter uppercase leading-none italic">New <span className="text-primary">Node.</span></h2>
                    <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest leading-none mt-2 italic shadow-glow">Identity Creation Terminal</p>
                 </div>
                 <button onClick={() => setShowCreateModal(false)} className="p-5 bg-zinc-50 text-zinc-400 rounded-full hover:bg-zinc-100 shadow-inner transition-all"><X className="w-8 h-8" /></button>
              </div>

              <form onSubmit={handleCreate} className="space-y-10">
                 <div className="space-y-4">
                    <label className="text-[10px] font-black uppercase tracking-[0.4em] text-zinc-400 italic pl-8 leading-none">Full Legal Name</label>
                    <div className="relative group">
                       <UserIcon className="absolute left-8 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-300 group-focus-within:text-primary transition-all" />
                       <input 
                         required 
                         className="w-full pl-20 pr-8 py-6 bg-zinc-50 border border-zinc-100 rounded-[2.5rem] focus:ring-4 focus:ring-primary/10 focus:bg-white outline-none transition-all font-black text-xs uppercase tracking-widest italic shadow-inner"
                         placeholder="Nama Lengkap..." 
                         value={newUser.name}
                         onChange={e => setNewUser({...newUser, name: e.target.value})}
                       />
                    </div>
                 </div>
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                       <label className="text-[10px] font-black uppercase tracking-[0.4em] text-zinc-400 italic pl-8 leading-none">Email Address</label>
                       <div className="relative group">
                          <Mail className="absolute left-8 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-300 group-focus-within:text-primary transition-all" />
                          <input 
                            required type="email"
                            className="w-full pl-20 pr-8 py-6 bg-zinc-50 border border-zinc-100 rounded-[2.5rem] focus:ring-4 focus:ring-primary/10 focus:bg-white outline-none transition-all font-black text-xs uppercase tracking-widest italic shadow-inner"
                            placeholder="email@bapenda.go.id" 
                            value={newUser.email}
                            onChange={e => setNewUser({...newUser, email: e.target.value})}
                          />
                       </div>
                    </div>
                    <div className="space-y-4">
                       <label className="text-[10px] font-black uppercase tracking-[0.4em] text-zinc-400 italic pl-8 leading-none">System Password</label>
                       <div className="relative group">
                          <Lock className="absolute left-8 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-300 group-focus-within:text-primary transition-all" />
                          <input 
                            required type="password"
                            className="w-full pl-20 pr-8 py-6 bg-zinc-50 border border-zinc-100 rounded-[2.5rem] focus:ring-4 focus:ring-primary/10 focus:bg-white outline-none transition-all font-black text-xs uppercase tracking-widest italic shadow-inner"
                            placeholder="••••••••" 
                            value={newUser.password}
                            onChange={e => setNewUser({...newUser, password: e.target.value})}
                          />
                       </div>
                    </div>
                 </div>
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                       <label className="text-[10px] font-black uppercase tracking-[0.4em] text-zinc-400 italic pl-8 leading-none">NIK (16 Digit)</label>
                       <div className="relative group">
                          <UserIcon className="absolute left-8 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-300 group-focus-within:text-primary transition-all" />
                          <input 
                            className="w-full pl-20 pr-8 py-6 bg-zinc-50 border border-zinc-100 rounded-[2.5rem] focus:ring-4 focus:ring-primary/10 focus:bg-white outline-none transition-all font-black text-xs uppercase tracking-widest italic shadow-inner"
                            placeholder="1271..." 
                            value={newUser.nik}
                            onChange={e => setNewUser({...newUser, nik: e.target.value})}
                          />
                       </div>
                    </div>
                    <div className="space-y-4">
                       <label className="text-[10px] font-black uppercase tracking-[0.4em] text-zinc-400 italic pl-8 leading-none">Nomor Telepon</label>
                       <div className="relative group">
                          <Phone className="absolute left-8 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-300 group-focus-within:text-primary transition-all" />
                          <input 
                            className="w-full pl-20 pr-8 py-6 bg-zinc-50 border border-zinc-100 rounded-[2.5rem] focus:ring-4 focus:ring-primary/10 focus:bg-white outline-none transition-all font-black text-xs uppercase tracking-widest italic shadow-inner"
                            placeholder="0812..." 
                            value={newUser.phone}
                            onChange={e => setNewUser({...newUser, phone: e.target.value})}
                          />
                       </div>
                    </div>
                 </div>
                 <div className="space-y-4">
                    <label className="text-[10px] font-black uppercase tracking-[0.4em] text-zinc-400 italic pl-8 leading-none">Alamat Lengkap</label>
                    <div className="relative group">
                       <MapPin className="absolute left-8 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-300 group-focus-within:text-primary transition-all" />
                       <input 
                         className="w-full pl-20 pr-8 py-6 bg-zinc-50 border border-zinc-100 rounded-[2.5rem] focus:ring-4 focus:ring-primary/10 focus:bg-white outline-none transition-all font-black text-xs uppercase tracking-widest italic shadow-inner"
                         placeholder="Jl. Letjen Suprapto No. X..." 
                         value={newUser.address}
                         onChange={e => setNewUser({...newUser, address: e.target.value})}
                       />
                    </div>
                 </div>
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                       <label className="text-[10px] font-black uppercase tracking-[0.4em] text-zinc-400 italic pl-8 leading-none">Authority Level</label>
                       <select
                         className="w-full px-12 py-6 bg-zinc-50 border border-zinc-100 rounded-[2.5rem] focus:ring-4 focus:ring-primary/10 transition-all font-black text-xs uppercase tracking-widest italic appearance-none cursor-pointer shadow-inner animate-none"
                         value={newUser.role}
                         onChange={e => setNewUser({...newUser, role: e.target.value as UserRole})}
                       >
                         {ROLES.map(r => <option key={r} value={r}>{roleLabel[r]}</option>)}
                       </select>
                    </div>
                    <div className="space-y-4">
                       <label className="text-[10px] font-black uppercase tracking-[0.4em] text-zinc-400 italic pl-8 leading-none">Status Akun</label>
                       <select
                         className="w-full px-12 py-6 bg-zinc-50 border border-zinc-100 rounded-[2.5rem] focus:ring-4 focus:ring-primary/10 transition-all font-black text-xs uppercase tracking-widest italic appearance-none cursor-pointer shadow-inner animate-none"
                         value={newUser.isActive ? "ACTIVE" : "INACTIVE"}
                         onChange={e => setNewUser({...newUser, isActive: e.target.value === "ACTIVE"})}
                       >
                          <option value="ACTIVE">AKTIF</option>
                          <option value="INACTIVE">NONAKTIF</option>
                       </select>
                    </div>
                 </div>

                 <div className="pt-10 flex border-t border-zinc-50">
                    <Button type="submit" disabled={createLoading} className="rounded-full px-16 h-20 btn-premium group font-black uppercase text-xs tracking-widest shadow-2xl shadow-primary/30">
                       {createLoading ? "Creating..." : "Daftarkan User Baru"}
                       <ShieldCheck className="ml-4 w-5 h-5" />
                    </Button>
                 </div>
              </form>
           </Card>
        </div>
      )}

      {/* ── Edit Modal ── */}
      {showEditModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-zinc-950/40 backdrop-blur-md p-6 text-left animate-in fade-in duration-500">
           <Card padding="none" className="bg-white rounded-[5rem] shadow-2xl w-full max-w-2xl max-h-[92vh] overflow-y-auto border border-zinc-100 animate-in zoom-in-95 duration-500 relative p-12 lg:p-20">
              <div className="flex items-start justify-between mb-16">
                 <div className="space-y-3">
                    <h2 className="text-4xl lg:text-6xl font-black italic tracking-tighter uppercase leading-none italic">Edit <span className="text-primary">Profile.</span></h2>
                    <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest leading-none mt-2 italic shadow-glow">Identity Parameter Adjustment</p>
                 </div>
                 <button onClick={() => setShowEditModal(false)} className="p-5 bg-zinc-50 text-zinc-400 rounded-full hover:bg-zinc-100 shadow-inner transition-all"><X className="w-8 h-8" /></button>
              </div>

              <form onSubmit={handleEditSubmit} className="space-y-10">
                 <div className="space-y-4">
                    <label className="text-[10px] font-black uppercase tracking-[0.4em] text-zinc-400 italic pl-8 leading-none">Full Legal Name</label>
                    <div className="relative group">
                       <UserIcon className="absolute left-8 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-300 group-focus-within:text-primary transition-all" />
                       <input 
                         required 
                         className="w-full pl-20 pr-8 py-6 bg-zinc-50 border border-zinc-100 rounded-[2.5rem] focus:ring-4 focus:ring-primary/10 focus:bg-white outline-none transition-all font-black text-xs uppercase tracking-widest italic shadow-inner"
                         placeholder="Nama Lengkap..." 
                         value={editForm.name}
                         onChange={e => setEditForm({...editForm, name: e.target.value})}
                       />
                    </div>
                 </div>
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                       <label className="text-[10px] font-black uppercase tracking-[0.4em] text-zinc-400 italic pl-8 leading-none">Email Address</label>
                       <div className="relative group">
                          <Mail className="absolute left-8 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-300 group-focus-within:text-primary transition-all" />
                          <input 
                            required type="email"
                            className="w-full pl-20 pr-8 py-6 bg-zinc-50 border border-zinc-100 rounded-[2.5rem] focus:ring-4 focus:ring-primary/10 focus:bg-white outline-none transition-all font-black text-xs uppercase tracking-widest italic shadow-inner"
                            placeholder="email@bapenda.go.id" 
                            value={editForm.email}
                            onChange={e => setEditForm({...editForm, email: e.target.value})}
                          />
                       </div>
                    </div>
                    <div className="space-y-4">
                       <label className="text-[10px] font-black uppercase tracking-[0.4em] text-zinc-400 italic pl-8 leading-none">Reset Password (Opsional)</label>
                       <div className="relative group">
                          <Lock className="absolute left-8 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-300 group-focus-within:text-primary transition-all" />
                          <input 
                            type="password"
                            className="w-full pl-20 pr-8 py-6 bg-zinc-50 border border-zinc-100 rounded-[2.5rem] focus:ring-4 focus:ring-primary/10 focus:bg-white outline-none transition-all font-black text-xs uppercase tracking-widest italic shadow-inner"
                            placeholder="Isi untuk ganti password..." 
                            value={editForm.password}
                            onChange={e => setEditForm({...editForm, password: e.target.value})}
                          />
                       </div>
                    </div>
                 </div>
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                       <label className="text-[10px] font-black uppercase tracking-[0.4em] text-zinc-400 italic pl-8 leading-none">NIK (16 Digit)</label>
                       <div className="relative group">
                          <UserIcon className="absolute left-8 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-300 group-focus-within:text-primary transition-all" />
                          <input 
                            className="w-full pl-20 pr-8 py-6 bg-zinc-50 border border-zinc-100 rounded-[2.5rem] focus:ring-4 focus:ring-primary/10 focus:bg-white outline-none transition-all font-black text-xs uppercase tracking-widest italic shadow-inner"
                            placeholder="1271..." 
                            value={editForm.nik}
                            onChange={e => setEditForm({...editForm, nik: e.target.value})}
                          />
                       </div>
                    </div>
                    <div className="space-y-4">
                       <label className="text-[10px] font-black uppercase tracking-[0.4em] text-zinc-400 italic pl-8 leading-none">Nomor Telepon</label>
                       <div className="relative group">
                          <Phone className="absolute left-8 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-300 group-focus-within:text-primary transition-all" />
                          <input 
                            className="w-full pl-20 pr-8 py-6 bg-zinc-50 border border-zinc-100 rounded-[2.5rem] focus:ring-4 focus:ring-primary/10 focus:bg-white outline-none transition-all font-black text-xs uppercase tracking-widest italic shadow-inner"
                            placeholder="0812..." 
                            value={editForm.phone}
                            onChange={e => setEditForm({...editForm, phone: e.target.value})}
                          />
                       </div>
                    </div>
                 </div>
                 <div className="space-y-4">
                    <label className="text-[10px] font-black uppercase tracking-[0.4em] text-zinc-400 italic pl-8 leading-none">Alamat Lengkap</label>
                    <div className="relative group">
                       <MapPin className="absolute left-8 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-300 group-focus-within:text-primary transition-all" />
                       <input 
                         className="w-full pl-20 pr-8 py-6 bg-zinc-50 border border-zinc-100 rounded-[2.5rem] focus:ring-4 focus:ring-primary/10 focus:bg-white outline-none transition-all font-black text-xs uppercase tracking-widest italic shadow-inner"
                         placeholder="Jl. Letjen Suprapto No. X..." 
                         value={editForm.address}
                         onChange={e => setEditForm({...editForm, address: e.target.value})}
                       />
                    </div>
                 </div>
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                       <label className="text-[10px] font-black uppercase tracking-[0.4em] text-zinc-400 italic pl-8 leading-none">Authority Level</label>
                       <select
                         className="w-full px-12 py-6 bg-zinc-50 border border-zinc-100 rounded-[2.5rem] focus:ring-4 focus:ring-primary/10 transition-all font-black text-xs uppercase tracking-widest italic appearance-none cursor-pointer shadow-inner animate-none"
                         value={editForm.role}
                         onChange={e => setEditForm({...editForm, role: e.target.value as UserRole})}
                       >
                         {ROLES.map(r => <option key={r} value={r}>{roleLabel[r]}</option>)}
                       </select>
                    </div>
                    <div className="space-y-4">
                       <label className="text-[10px] font-black uppercase tracking-[0.4em] text-zinc-400 italic pl-8 leading-none">Status Akun</label>
                       <select
                         className="w-full px-12 py-6 bg-zinc-50 border border-zinc-100 rounded-[2.5rem] focus:ring-4 focus:ring-primary/10 transition-all font-black text-xs uppercase tracking-widest italic appearance-none cursor-pointer shadow-inner animate-none"
                         value={editForm.isActive ? "ACTIVE" : "INACTIVE"}
                         onChange={e => setEditForm({...editForm, isActive: e.target.value === "ACTIVE"})}
                       >
                          <option value="ACTIVE">AKTIF</option>
                          <option value="INACTIVE">NONAKTIF</option>
                       </select>
                    </div>
                 </div>

                 <div className="pt-10 flex border-t border-zinc-50">
                    <Button type="submit" disabled={editLoading} className="rounded-full px-16 h-20 btn-premium group font-black uppercase text-xs tracking-widest shadow-2xl shadow-primary/30">
                       {editLoading ? "Saving..." : "Simpan Perubahan User"}
                       <ShieldCheck className="ml-4 w-5 h-5" />
                    </Button>
                 </div>
              </form>
           </Card>
        </div>
      )}

      {/* ── Detail & History Modal ── */}
      {showDetailModal && selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-zinc-950/40 backdrop-blur-md p-6 text-left animate-in fade-in duration-500">
           <Card padding="none" className="bg-white rounded-[5rem] shadow-2xl w-full max-w-4xl max-h-[92vh] overflow-y-auto border border-zinc-100 animate-in zoom-in-95 duration-500 relative p-12 lg:p-20">
              <div className="flex items-start justify-between mb-12">
                 <div className="space-y-3">
                    <h2 className="text-4xl lg:text-6xl font-black italic tracking-tighter uppercase leading-none italic">User <span className="text-primary">Details.</span></h2>
                    <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest leading-none mt-2 italic shadow-glow">Identity & Transaction History Ledger</p>
                 </div>
                 <button onClick={() => setShowDetailModal(false)} className="p-5 bg-zinc-50 text-zinc-400 rounded-full hover:bg-zinc-100 shadow-inner transition-all"><X className="w-8 h-8" /></button>
              </div>

              <div className="space-y-12">
                 {/* Profil Summary */}
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-8 bg-zinc-50 p-8 rounded-[3rem] border border-zinc-100">
                    <div>
                       <p className="text-[9px] font-black uppercase text-zinc-400 tracking-widest">Informasi Utama</p>
                       <div className="space-y-3 mt-4 text-sm font-bold text-zinc-800">
                          <p><span className="text-zinc-400">Nama:</span> {selectedUser.name}</p>
                          <p><span className="text-zinc-400">Email:</span> {selectedUser.email}</p>
                          <p><span className="text-zinc-400">NIK:</span> {selectedUser.nik || "Belum terekam"}</p>
                          <p><span className="text-zinc-400">Telepon:</span> {selectedUser.phone || "—"}</p>
                       </div>
                    </div>
                    <div>
                       <p className="text-[9px] font-black uppercase text-zinc-400 tracking-widest">Alamat & Otoritas</p>
                       <div className="space-y-3 mt-4 text-sm font-bold text-zinc-800">
                          <p><span className="text-zinc-400">Role:</span> {roleLabel[selectedUser.role] ?? selectedUser.role}</p>
                          <p><span className="text-zinc-400">Status Akun:</span> {selectedUser.isActive ? "AKTIF" : "NONAKTIF"}</p>
                          <p className="truncate max-w-[320px]"><span className="text-zinc-400">Alamat:</span> {selectedUser.address || "Belum terdata"}</p>
                          <p><span className="text-zinc-400">Terdaftar:</span> {new Date(selectedUser.createdAt).toLocaleDateString("id-ID")}</p>
                       </div>
                    </div>
                 </div>

                 {/* Riwayat Pembayaran */}
                 <div className="space-y-4">
                    <p className="text-xs font-black uppercase text-primary tracking-widest border-l-4 border-primary pl-4">Riwayat Pembayaran Pajak</p>
                    <div className="border border-zinc-100 rounded-[2.5rem] overflow-hidden">
                       <table className="w-full text-left border-collapse">
                          <thead>
                             <tr className="bg-zinc-50 text-[10px] font-black text-zinc-400 uppercase tracking-widest border-b border-zinc-150">
                                <th className="px-6 py-4">Nomor Invoice</th>
                                <th className="px-6 py-4">Objek Pajak</th>
                                <th className="px-6 py-4">Jumlah</th>
                                <th className="px-6 py-4">Status</th>
                                <th className="px-6 py-4">Tanggal</th>
                             </tr>
                          </thead>
                          <tbody className="divide-y divide-zinc-100 text-xs font-bold text-zinc-800">
                             {selectedUser.payments && selectedUser.payments.length > 0 ? (
                                selectedUser.payments.map((p) => (
                                   <tr key={p.id} className="hover:bg-zinc-50/50">
                                      <td className="px-6 py-4 text-mono text-primary">{p.id}</td>
                                      <td className="px-6 py-4">{p.taxObject.name} <br/><span className="text-[9px] text-zinc-400">{p.taxObject.nop}</span></td>
                                      <td className="px-6 py-4 text-emerald-600">{formatCurrency(p.amount)}</td>
                                      <td className="px-6 py-4">
                                         <span className={cn(
                                            "px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest border",
                                            p.status === "PAID" 
                                              ? "bg-emerald-50 text-emerald-600 border-emerald-100" 
                                              : "bg-rose-50 text-rose-600 border-rose-100"
                                         )}>
                                            {p.status}
                                         </span>
                                      </td>
                                      <td className="px-6 py-4 font-normal text-zinc-500">{new Date(p.createdAt).toLocaleDateString("id-ID")}</td>
                                   </tr>
                                ))
                             ) : (
                                <tr>
                                   <td colSpan={5} className="px-6 py-8 text-center text-zinc-400 italic">Belum ada catatan pembayaran.</td>
                                </tr>
                             )}
                          </tbody>
                       </table>
                    </div>
                 </div>

                 {/* Riwayat Perubahan Data */}
                 <div className="space-y-4">
                    <p className="text-xs font-black uppercase text-primary tracking-widest border-l-4 border-primary pl-4">Log Perubahan Data / Aktivitas</p>
                    <div className="space-y-4">
                       {selectedUser.auditLogs && selectedUser.auditLogs.length > 0 ? (
                          selectedUser.auditLogs.map((log) => (
                             <div key={log.id} className="p-6 bg-zinc-50 border border-zinc-100 rounded-2xl flex items-center justify-between text-xs font-bold">
                                <div>
                                   <p className="text-primary font-black uppercase tracking-wider">{log.action.replace(/_/g, ' ')}</p>
                                   <p className="text-zinc-500 mt-1">Pada tabel: <span className="text-zinc-800 font-mono">{log.table}</span></p>
                                </div>
                                <div className="text-right text-zinc-400 font-normal">
                                   <Clock className="w-3.5 h-3.5 inline mr-1" />
                                   {new Date(log.createdAt).toLocaleString("id-ID")}
                                </div>
                             </div>
                          ))
                       ) : (
                          <p className="text-xs text-zinc-400 italic pl-4">Belum ada log perubahan data wajib pajak ini.</p>
                       )}
                    </div>
                 </div>
              </div>

              <div className="pt-10 flex border-t border-zinc-50 mt-12 justify-end">
                 <button onClick={() => setShowDetailModal(false)} className="rounded-full px-10 h-16 bg-zinc-100 hover:bg-zinc-200 font-black uppercase text-[10px] tracking-widest transition-all">
                    Tutup Detail
                 </button>
              </div>
           </Card>
        </div>
      )}
    </div>
  );
}
