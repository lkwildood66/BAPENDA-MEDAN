"use client";

import React, { useEffect, useState, useCallback } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { 
  ShieldAlert, 
  Search, 
  Filter, 
  RefreshCcw, 
  Calendar, 
  ChevronLeft, 
  ChevronRight,
  Database,
  Users,
  Activity,
  Clock,
  Loader2
} from "lucide-react";
// import { format } from "date-fns";
import AuditTimeline from "@/components/admin/AuditTimeline";

interface AuditLog {
  id: string;
  action: string;
  table: string;
  recordId: string;
  oldValue: Record<string, any> | null;
  newValue: Record<string, any> | null;
  createdAt: string;
  user: {
    name: string | null;
    email: string | null;
    role: string;
  };
}

export default function AuditLogPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "authenticated" && (session?.user as any)?.role !== "ADMIN") {
      router.replace("/dashboard");
    }
  }, [session, status, router]);

  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [limit] = useState(20);

  // Filters
  const [userId, setUserId] = useState("");
  const [table, setTable] = useState("");
  const [action, setAction] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const fetchLogs = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        limit: limit.toString(),
        offset: ((page - 1) * limit).toString(),
        ...(userId && { userId }),
        ...(table && { table }),
        ...(action && { action }),
        ...(startDate && { startDate }),
        ...(endDate && { endDate }),
      });

      const res = await fetch(`/api/admin/audit-logs?${params}`);
      const data = await res.json();
      
      if (res.ok) {
        setLogs(data.logs);
        setTotal(data.total);
      }
    } catch (error) {
      console.error("Failed to fetch audit logs", error);
    } finally {
      setLoading(false);
    }
  }, [limit, page, userId, table, action, startDate, endDate]);

  useEffect(() => {
    if (status !== "authenticated" || (session?.user as any)?.role !== "ADMIN") return;
    fetchLogs();
  }, [fetchLogs, status, session]);

  if (status === "loading" || (session?.user as any)?.role !== "ADMIN") {
     return (
        <div className="min-h-[60vh] flex items-center justify-center">
           <Loader2 className="w-12 h-12 text-[#1E40AF] animate-spin" />
        </div>
     );
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchLogs();
  };

  const totalPages = Math.ceil(total / limit);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-in fade-in duration-500">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-rose-50 text-rose-600 rounded-xl shadow-sm">
              <ShieldAlert className="w-6 h-6" />
            </div>
            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Audit Log System</h1>
          </div>
          <p className="text-slate-500 font-medium ml-12">
            Riwayat aktivitas sistem, perubahan data, dan log administratif Bapenda Medan.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button 
            onClick={fetchLogs}
            className="p-2.5 bg-white border border-slate-200 text-slate-600 rounded-xl hover:bg-slate-50 hover:text-slate-900 transition-all shadow-sm flex items-center gap-2 text-sm font-semibold"
          >
            <RefreshCcw className="w-4 h-4" />
            <span className="hidden sm:inline">Segarkan Data</span>
          </button>
        </div>
      </div>

      {/* Stats Quick View */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          { label: "Total Aktivitas", value: total.toLocaleString(), icon: Activity, color: "blue" },
          { label: "Objek Terpantau", value: "Tax, User, Payment", icon: Database, color: "emerald" },
          { label: "Pengguna Admin", value: "Sistem Terpusat", icon: Users, color: "purple" }
        ].map((stat, i) => (
          <div key={i} className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4">
            <div className={`p-3 bg-${stat.color}-50 text-${stat.color}-600 rounded-xl`}>
              <stat.icon className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[10px] uppercase tracking-wider font-bold text-slate-400">{stat.label}</p>
              <p className="text-xl font-bold text-slate-900">{stat.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Filters Card */}
      <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm border-l-4 border-l-rose-500">
        <form onSubmit={handleSearch} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-600 uppercase flex items-center gap-2">
              <Filter className="w-3 h-3" /> Filter Tabel
            </label>
            <select 
              value={table} 
              onChange={(e) => setTable(e.target.value)}
              className="w-full bg-slate-50 border border-slate-100 px-4 py-2.5 rounded-xl text-sm focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 outline-none transition-all"
            >
              <option value="">Semua Tabel</option>
              <option value="Notification">Notification</option>
              <option value="Payment">Payment</option>
              <option value="User">User</option>
              <option value="News">News</option>
              <option value="TaxObject">TaxObject</option>
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-600 uppercase flex items-center gap-2">
              <Activity className="w-3 h-3" /> Aksi
            </label>
            <select 
              value={action} 
              onChange={(e) => setAction(e.target.value)}
              className="w-full bg-slate-50 border border-slate-100 px-4 py-2.5 rounded-xl text-sm focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 outline-none transition-all"
            >
              <option value="">Semua Aksi</option>
              <option value="CREATE_BILLING">Create Billing</option>
              <option value="PROCESS_PAYMENT_MOCK">Mock Payment</option>
              <option value="CREATE_NEWS">Create News</option>
              <option value="CREATE_ANNOUNCEMENT">Create Announcement</option>
              <option value="NOTIFY_CREATE">Create Notification</option>
            </select>
          </div>

          <div className="space-y-2 lg:col-span-2">
            <label className="text-xs font-bold text-slate-600 uppercase flex items-center gap-2">
              <Calendar className="w-3 h-3" /> Rentang Waktu
            </label>
            <div className="flex gap-3">
              <input 
                type="date" 
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="flex-1 bg-slate-50 border border-slate-100 px-4 py-2.5 rounded-xl text-sm outline-none"
              />
              <span className="self-center text-slate-300">-</span>
              <input 
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="flex-1 bg-slate-50 border border-slate-100 px-4 py-2.5 rounded-xl text-sm outline-none"
              />
              <button 
                type="submit"
                className="px-6 bg-rose-600 text-white rounded-xl font-bold text-sm hover:bg-rose-700 transition-colors shadow-md shadow-rose-600/20 flex items-center gap-2"
              >
                <Search className="w-4 h-4" /> Cari
              </button>
            </div>
          </div>
        </form>
      </div>

      {/* Main Content: Timeline */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <Clock className="w-5 h-5 text-rose-500" /> Linimasa Aktivitas
          </h2>
          <p className="text-sm text-slate-500">
            Menampilkan <span className="font-bold text-slate-900">{total > 0 ? (page - 1) * limit + 1 : 0}-{Math.min(page * limit, total)}</span> dari <span className="font-bold text-slate-900">{total}</span> aktivitas
          </p>
        </div>

        {loading ? (
          <div className="space-y-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="relative pl-12">
                <div className="absolute left-0 top-0 w-10 h-10 rounded-full bg-slate-100 animate-pulse" />
                <div className="h-32 bg-white rounded-xl border border-slate-100 animate-pulse" />
              </div>
            ))}
          </div>
        ) : (
          <AuditTimeline logs={logs} />
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-2 pt-4">
            <button 
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="p-2 border border-slate-200 rounded-lg hover:bg-slate-50 disabled:opacity-50 transition-all"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-1">
              {[...Array(totalPages)].map((_, i) => (
                <button
                  key={i}
                  onClick={() => setPage(i + 1)}
                  className={`w-9 h-9 rounded-lg text-sm font-bold transition-all ${
                    page === i + 1 ? "bg-rose-600 text-white shadow-lg shadow-rose-200" : "hover:bg-slate-50 text-slate-600"
                  }`}
                >
                  {i + 1}
                </button>
              ))}
            </div>
            <button 
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="p-2 border border-slate-200 rounded-lg hover:bg-slate-50 disabled:opacity-50 transition-all"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
