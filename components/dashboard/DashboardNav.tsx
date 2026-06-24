"use client";

import * as React from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import {
  BarChart3, 
  Users, 
  ShieldCheck, 
  CreditCard, 
  Settings, 
  LogOut, 
  Menu, 
  X,
  FileText,
  GraduationCap,
  Building2,
  Megaphone,
  FileQuestion,
  BookOpen,
  Calculator,
  Bell,
  Search,
  User as UserIcon,
  ChevronDown,
  Map,
  Layers,
  TrendingUp,
  MapPin,
  Scale,
  Activity
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useSession, signOut } from "next-auth/react";

interface NavItem {
  href: string;
  label: string;
  icon: React.ElementType;
}

export const DashboardSidebar = () => {
  const pathname = usePathname();
  const { data: session } = useSession();
  const [isOpen, setIsOpen] = React.useState(false);

  const role = (session?.user as { role: string })?.role ?? "USER";

  const getNavItems = (): NavItem[] => {
    if (role === "ADMIN") {
      return [
        { href: "/dashboard", label: "Dashboard", icon: BarChart3 },
        { href: "/dashboard/admin/users", label: "Pengguna", icon: Users },
        { href: "/dashboard/admin/tax-objects", label: "Objek Pajak", icon: Building2 },
        { href: "/dashboard/admin/sppt", label: "SPPT", icon: FileText },
        { href: "/dashboard/admin/submissions", label: "Pengajuan", icon: ShieldCheck },
        { href: "/dashboard/admin/payments", label: "Pembayaran", icon: CreditCard },
        { href: "/dashboard/admin/stats", label: "Statistik", icon: BarChart3 },
        { href: "/dashboard/admin/audit", label: "Aktivitas Sistem", icon: ShieldCheck },
        { href: "/dashboard/admin/announcements", label: "Informasi", icon: Megaphone },
        { href: "/dashboard/admin/research", label: "Permohonan Riset", icon: GraduationCap },
        { href: "/dashboard/ppid", label: "Permohonan PPID", icon: FileQuestion },
        { href: "/dashboard/pengaduan", label: "Pengaduan", icon: Megaphone },
        // GIS Menu
        { href: "/dashboard/gis/peta-bidang", label: "Peta Bidang PBB", icon: Map },
        { href: "/dashboard/gis/znt", label: "Zona Nilai Tanah", icon: Layers },
        { href: "/dashboard/gis/pasar-properti", label: "Pasar Properti", icon: TrendingUp },
        { href: "/dashboard/gis/pendataan", label: "Geo Pendataan", icon: MapPin },
        { href: "/dashboard/gis/penilaian", label: "Geo Penilaian", icon: Scale },
        { href: "/dashboard/gis/integrasi", label: "Portal Integrasi Data", icon: Activity },
      ];
    }

    if (role === "OFFICER") {
      return [
        { href: "/dashboard", label: "Dashboard", icon: BarChart3 },
        { href: "/dashboard/admin/tax-objects", label: "Objek Pajak", icon: Building2 },
        { href: "/dashboard/admin/sppt", label: "SPPT", icon: FileText },
        { href: "/dashboard/admin/submissions", label: "Pengajuan", icon: ShieldCheck },
        { href: "/dashboard/admin/payments", label: "Pembayaran", icon: CreditCard },
        { href: "/dashboard/admin/research", label: "Riset", icon: GraduationCap },
        { href: "/dashboard/ppid", label: "PPID", icon: FileQuestion },
        { href: "/dashboard/pengaduan", label: "Pengaduan", icon: Megaphone },
        // GIS Menu
        { href: "/dashboard/gis/peta-bidang", label: "Peta Bidang PBB", icon: Map },
        { href: "/dashboard/gis/znt", label: "Zona Nilai Tanah", icon: Layers },
        { href: "/dashboard/gis/pasar-properti", label: "Pasar Properti", icon: TrendingUp },
        { href: "/dashboard/gis/pendataan", label: "Pendataan Lapangan", icon: MapPin },
        { href: "/dashboard/gis/penilaian", label: "Penilaian Objek", icon: Scale },
      ];
    }

    if (role === "MAHASISWA") {
      return [
        { href: "/dashboard", label: "Dashboard", icon: BarChart3 },
        { href: "/dashboard/mahasiswa/pengajuan", label: "Status Riset", icon: GraduationCap },
        { href: "/dashboard/ppid", label: "Layanan PPID", icon: FileQuestion },
      ];
    }

    return [
      { href: "/dashboard", label: "Dashboard", icon: BarChart3 },
      { href: "/dashboard/pajak/objek", label: "Aset Pajak", icon: Building2 },
      { href: "/dashboard/pajak/sppt", label: "SPPT Saya", icon: FileText },
      { href: "/dashboard/pengajuan", label: "Pengajuan", icon: ShieldCheck },
      { href: "/dashboard/pajak/riwayat", label: "Riwayat Pembayaran", icon: CreditCard },
      { href: "/dashboard/pajak/hitung", label: "Kalkulator Pajak", icon: Calculator },
      { href: "/dashboard/ppid", label: "Informasi Publik", icon: FileQuestion },
      { href: "/dashboard/pengaduan", label: "Pengaduan", icon: Megaphone },
      // GIS Menu
      { href: "/dashboard/gis/peta-bidang", label: "Lokasi Aset", icon: Map },
    ];
  };

  const navItems = getNavItems();

  return (
    <>
      {/* Mobile Toggle */}
      <div className="lg:hidden fixed top-6 right-6 z-50">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="p-3 bg-white border border-zinc-100 rounded-2xl shadow-xl text-primary mt-[2px]"
        >
          {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Sidebar */}
      <aside className={cn(
        "fixed inset-y-0 left-0 z-40 w-72 bg-white border-r border-zinc-100 transform transition-transform duration-500 ease-spring lg:translate-x-0 lg:static",
        isOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="h-full flex flex-col p-8">
          {/* Logo Section */}
          <div className="flex items-center gap-4 mb-8 px-2">
            <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-xl border border-zinc-100 group-hover:rotate-6 transition-transform">
               <Image src="/logo.png" alt="Logo" width={40} height={40} className="object-contain" />
            </div>
            <div>
              <h2 className="text-xl font-black tracking-tighter text-foreground italic uppercase">Bapenda.<span className="text-primary italic">Hub</span></h2>
              <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest italic opacity-60 leading-none">Medan Digital Gov</p>
            </div>
          </div>

          {/* Global Search Bar (Admin & Officer only) */}
          {(role === "ADMIN" || role === "OFFICER") && (
            <div className="mb-6 relative group px-2">
               <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-300 group-focus-within:text-primary transition-colors" />
               <input 
                 type="text" 
                 placeholder="Cari global..." 
                 className="w-full pl-12 pr-4 py-3 bg-zinc-50 border border-zinc-100 rounded-2xl outline-none focus:ring-4 focus:ring-primary/10 transition-all text-xs font-bold italic"
                 onKeyDown={(e) => {
                   if (e.key === "Enter") {
                     const val = e.currentTarget.value.trim();
                     if (val) {
                       window.location.href = `/dashboard/admin/search?q=${encodeURIComponent(val)}`;
                     }
                   }
                 }}
               />
            </div>
          )}

          <nav className="flex-1 space-y-1.5 overflow-y-auto no-scrollbar pr-2">
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setIsOpen(false)}
                  className={cn(
                    "flex items-center gap-4 px-6 py-4 rounded-2xl text-sm font-bold transition-all group relative overflow-hidden",
                    isActive 
                      ? "bg-primary text-white shadow-xl shadow-primary/20 italic" 
                      : "text-zinc-500 hover:text-primary hover:bg-primary/5 italic"
                  )}
                >
                  <item.icon className={cn("w-5 h-5 transition-transform group-hover:scale-110", isActive ? "text-white" : "text-zinc-400 group-hover:text-primary")} />
                  <span className="uppercase tracking-tight">{item.label}</span>
                </Link>
              );
            })}
          </nav>

          <div className="mt-8 pt-8 border-t border-zinc-50 space-y-2">
            <Link href={role === "ADMIN" ? "/dashboard/admin/settings" : "/dashboard/settings"} className="flex items-center gap-4 px-6 py-4 rounded-2xl text-sm font-bold text-zinc-500 hover:text-primary hover:bg-primary/5 transition-all uppercase tracking-tight italic"><Settings className="w-5 h-5" /> Pengaturan</Link>
            <button onClick={() => signOut({ callbackUrl: "/" })} className="w-full flex items-center gap-4 px-6 py-4 rounded-2xl text-sm font-bold text-red-500 hover:bg-red-50 transition-all uppercase tracking-tight italic"><LogOut className="w-5 h-5" /> Logout</button>
          </div>
        </div>
      </aside>

      {isOpen && <div className="fixed inset-0 bg-zinc-950/20 backdrop-blur-sm z-30 lg:hidden" onClick={() => setIsOpen(false)} />}
    </>
  );
};

export const DashboardTopbar = () => {
  const { data: session } = useSession();
  const [unreadCount, setUnreadCount] = React.useState(0);

  React.useEffect(() => {
    const checkNotifications = async () => {
      try {
        const res = await fetch("/api/notifications");
        const data = await res.json();
        const unread = data.notifications?.filter((n: { isRead: boolean }) => !n.isRead).length || 0;
        setUnreadCount(unread);
      } catch (e) {
        console.error("Failed to fetch notification count", e);
      }
    };
    
    checkNotifications();
    const interval = setInterval(checkNotifications, 30000); // Check every 30s
    return () => clearInterval(interval);
  }, []);
  
  return (
    <header className="h-24 bg-white border-b border-zinc-100 flex items-center justify-between px-8 lg:px-12 sticky top-0 z-30 shadow-sm shadow-zinc-100/10 text-left">
       <div className="flex-1" />

       <div className="flex items-center gap-4 ml-auto">
          <Link href="/dashboard/notifications" className="relative p-3 bg-zinc-50 rounded-2xl border border-zinc-100 text-zinc-400 hover:text-primary transition-all group">
             <Bell className="w-5 h-5 transition-transform group-hover:scale-110" />
             {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 min-w-[20px] h-5 bg-primary border-2 border-white rounded-full flex items-center justify-center text-[8px] font-bold text-white shadow-glow">
                   {unreadCount > 9 ? "9+" : unreadCount}
                </span>
             )}
          </Link>
          
          <div className="flex items-center gap-4 pl-6 border-l border-zinc-100 group cursor-pointer">
             <div className="text-right hidden sm:block">
                <p className="text-xs font-black uppercase italic tracking-tighter text-foreground leading-none">{session?.user?.name ?? "Portal User"}</p>
                <p className="text-[10px] font-black text-primary uppercase italic opacity-60 leading-none mt-1">{(session?.user as { role: string })?.role ?? "USER"}</p>
             </div>
             <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center border border-primary/20 shadow-inner group-hover:rotate-6 transition-all overflow-hidden text-primary relative">
                {session?.user?.image ? (
                   <Image 
                     src={session.user.image} 
                     alt="Avatar" 
                     fill 
                     className="object-cover"
                   />
                ) : (
                   <UserIcon className="w-6 h-6" />
                )}
             </div>
             <ChevronDown className="w-4 h-4 text-zinc-300 transition-transform group-hover:translate-y-0.5" />
          </div>
       </div>
    </header>
  );
};
