"use client";

import * as React from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  Home,
  Users,
  Building2,
  FileText,
  CreditCard,
  BarChart3,
  ClipboardList,
  History,
  Bell,
  Settings,
  LogOut,
  Menu,
  X,
  MapPinned,
  Map,
  Scale,
  ClipboardCheck,
  Wallet,
  FileSearch,
  GraduationCap,
  Landmark,
  FileBadge,
  Receipt,
  FilePenLine,
  MessageSquareWarning,
  Calculator,
  MapPin,
  Info,
  Layers,
  TrendingUp,
  Search,
  ChevronDown,
  User as UserIcon
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useSession, signOut } from "next-auth/react";

interface NavItem {
  href: string;
  label: string;
  icon: React.ElementType;
}

interface NavGroup {
  label: string;
  items: NavItem[];
}

export const DashboardSidebar = () => {
  const pathname = usePathname();
  const router = useRouter();
  const { data: session } = useSession();
  const [isOpen, setIsOpen] = React.useState(false);

  const role = (session?.user as { role: string })?.role ?? "USER";

  const getDashboardIcon = () => {
    if (role === "ADMIN" || role === "OFFICER") {
      return LayoutDashboard;
    }
    return Home;
  };

  const DashboardIcon = getDashboardIcon();

  const getNavGroups = (): NavGroup[] => {
    if (role === "ADMIN") {
      return [
        {
          label: "DATA PAJAK",
          items: [
            { href: "/dashboard/admin/tax-objects", label: "Objek Pajak", icon: Building2 },
            { href: "/dashboard/admin/sppt", label: "SPPT", icon: FileText },
            { href: "/dashboard/admin/payments", label: "Pembayaran", icon: CreditCard }
          ]
        },
        {
          label: "LAYANAN",
          items: [
            { href: "/dashboard/admin/submissions", label: "Pengajuan", icon: ClipboardList },
            { href: "/dashboard/pengaduan", label: "Pengaduan", icon: MessageSquareWarning },
            { href: "/dashboard/ppid", label: "PPID", icon: FileSearch },
            { href: "/dashboard/admin/research", label: "Riset Mahasiswa", icon: GraduationCap }
          ]
        },
        {
          label: "ANALISIS",
          items: [
            { href: "/dashboard/admin/stats", label: "Statistik", icon: BarChart3 },
            { href: "/dashboard/gis/peta-bidang", label: "Peta Bidang PBB", icon: Map },
            { href: "/dashboard/gis/znt", label: "Zona Nilai Tanah", icon: Layers },
            { href: "/dashboard/gis/pasar-properti", label: "Pasar Properti", icon: TrendingUp }
          ]
        },
        {
          label: "SISTEM",
          items: [
            { href: "/dashboard/admin/users", label: "Pengguna", icon: Users },
            { href: "/dashboard/notifications", label: "Notifikasi", icon: Bell },
            { href: "/dashboard/admin/audit", label: "Aktivitas Sistem", icon: History }
          ]
        }
      ];
    }

    if (role === "OFFICER") {
      return [
        {
          label: "DATA PAJAK",
          items: [
            { href: "/dashboard/admin/tax-objects", label: "Objek Pajak", icon: MapPinned },
            { href: "/dashboard/admin/sppt", label: "SPPT", icon: FileText },
            { href: "/dashboard/admin/payments", label: "Pembayaran", icon: Wallet }
          ]
        },
        {
          label: "LAYANAN",
          items: [
            { href: "/dashboard/admin/submissions", label: "Pengajuan", icon: ClipboardCheck },
            { href: "/dashboard/pengaduan", label: "Pengaduan", icon: MessageSquareWarning },
            { href: "/dashboard/ppid", label: "PPID", icon: FileSearch },
            { href: "/dashboard/admin/research", label: "Riset", icon: GraduationCap }
          ]
        },
        {
          label: "ANALISIS",
          items: [
            { href: "/dashboard/gis/peta-bidang", label: "Peta Bidang PBB", icon: Map },
            { href: "/dashboard/gis/znt", label: "Zona Nilai Tanah", icon: Layers },
            { href: "/dashboard/gis/pasar-properti", label: "Pasar Properti", icon: TrendingUp },
            { href: "/dashboard/gis/pendataan", label: "Pendataan Lapangan", icon: Map },
            { href: "/dashboard/gis/penilaian", label: "Penilaian Objek", icon: Scale }
          ]
        },
        {
          label: "SISTEM",
          items: [
            { href: "/dashboard/notifications", label: "Notifikasi", icon: Bell }
          ]
        }
      ];
    }

    if (role === "MAHASISWA") {
      return [
        {
          label: "LAYANAN",
          items: [
            { href: "/dashboard/mahasiswa/pengajuan", label: "Status Riset", icon: GraduationCap },
            { href: "/dashboard/ppid", label: "Layanan PPID", icon: Info }
          ]
        },
        {
          label: "SISTEM",
          items: [
            { href: "/dashboard/notifications", label: "Notifikasi", icon: Bell }
          ]
        }
      ];
    }

    // USER / WAJIB PAJAK
    return [
      {
        label: "DATA PAJAK",
        items: [
          { href: "/dashboard/pajak/objek", label: "Aset Pajak", icon: Landmark },
          { href: "/dashboard/pajak/sppt", label: "SPPT Saya", icon: FileBadge },
          { href: "/dashboard/pajak/tagihan", label: "Pembayaran Pajak", icon: CreditCard },
          { href: "/dashboard/pajak/riwayat", label: "Riwayat Pembayaran", icon: Receipt }
        ]
      },
      {
        label: "LAYANAN",
        items: [
          { href: "/dashboard/pengajuan", label: "Pengajuan", icon: FilePenLine },
          { href: "/dashboard/pengaduan", label: "Pengaduan", icon: MessageSquareWarning },
          { href: "/dashboard/ppid", label: "Informasi Publik", icon: Info }
        ]
      },
      {
        label: "ANALISIS",
        items: [
          { href: "/dashboard/pajak/hitung", label: "Kalkulator Pajak", icon: Calculator },
          { href: "/dashboard/gis/peta-bidang", label: "Lokasi Aset", icon: MapPin }
        ]
      },
      {
        label: "SISTEM",
        items: [
          { href: "/dashboard/notifications", label: "Notifikasi", icon: Bell }
        ]
      }
    ];
  };

  const navGroups = getNavGroups();
  const isDashboardActive = pathname === "/dashboard";

  return (
    <>
      {/* Mobile Toggle */}
      <div className="lg:hidden fixed top-6 right-6 z-50">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="p-3 bg-white border border-zinc-150 rounded-2xl shadow-lg text-[#1E40AF] mt-[2px]"
        >
          {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Sidebar */}
      <aside className={cn(
        "fixed inset-y-0 left-0 z-40 w-72 bg-white border-r border-zinc-150 transform transition-transform duration-500 ease-spring lg:translate-x-0 lg:static",
        isOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="h-full flex flex-col p-8">
          {/* Logo Section */}
          <div className="flex items-center gap-4 mb-8 px-2">
             <div className="w-28 h-12 bg-white rounded-2xl flex items-center justify-center shadow-md border border-zinc-100 group-hover:rotate-6 transition-transform">
                <Image src="/logo.png" alt="Logo" width={106} height={32} className="object-contain" />
             </div>
            <div>
              <h2 className="text-xl font-black tracking-tighter text-foreground italic uppercase">Bapenda.<span className="text-[#1E40AF] italic">Hub</span></h2>
              <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest italic opacity-60 leading-none">Medan Digital Gov</p>
            </div>
          </div>

          {/* Global Search Bar (Admin & Officer only) */}
          {(role === "ADMIN" || role === "OFFICER") && (
            <div className="mb-4 relative px-2">
               <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
               <input 
                 type="text" 
                 placeholder="Cari data..." 
                 className="w-full pl-10 pr-4 py-2 bg-zinc-50 border border-zinc-200 rounded-xl outline-none focus:bg-white focus:border-[#1E40AF]/50 transition-all text-xs font-semibold"
                 onKeyDown={(e) => {
                   if (e.key === "Enter") {
                     const val = e.currentTarget.value.trim();
                     if (val) {
                       router.push(`/dashboard/admin/search?q=${encodeURIComponent(val)}`);
                     }
                   }
                 }}
               />
            </div>
          )}

          <nav className="flex-1 space-y-4 overflow-y-auto no-scrollbar pr-2">
            {/* Dashboard Link (Main top item) */}
            <div className="px-2">
              <Link
                href="/dashboard"
                onClick={() => setIsOpen(false)}
                className={cn(
                  "flex items-center gap-4 px-6 py-3.5 rounded-2xl text-sm font-bold transition-all group relative overflow-hidden italic",
                  isDashboardActive 
                    ? "bg-[#1E40AF] text-white shadow-md shadow-[#1E40AF]/20" 
                    : "text-zinc-500 hover:text-[#1E40AF] hover:bg-[#1E40AF]/5"
                )}
              >
                <DashboardIcon className={cn("w-5 h-5 transition-transform group-hover:scale-110", isDashboardActive ? "text-white" : "text-zinc-400 group-hover:text-[#1E40AF]")} />
                <span className="uppercase tracking-tight">Dashboard</span>
              </Link>
            </div>

            {/* Grouped items */}
            {navGroups.map((group) => (
              <div key={group.label} className="space-y-1 px-2">
                <div className="text-[10px] font-black text-zinc-400 tracking-widest uppercase pb-1.5 pl-6 pt-2 select-none opacity-80">
                  {group.label}
                </div>
                {group.items.map((item) => {
                  const isActive = pathname === item.href;
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setIsOpen(false)}
                      className={cn(
                        "flex items-center gap-4 px-6 py-3.5 rounded-2xl text-sm font-bold transition-all group relative overflow-hidden italic",
                        isActive 
                          ? "bg-[#1E40AF] text-white shadow-md shadow-[#1E40AF]/20" 
                          : "text-zinc-500 hover:text-[#1E40AF] hover:bg-[#1E40AF]/5"
                      )}
                    >
                      <item.icon className={cn("w-5 h-5 transition-transform group-hover:scale-110", isActive ? "text-white" : "text-zinc-400 group-hover:text-[#1E40AF]")} />
                      <span className="uppercase tracking-tight">{item.label}</span>
                    </Link>
                  );
                })}
              </div>
            ))}
          </nav>

          <div className="mt-6 pt-6 border-t border-zinc-150 space-y-1">
            <Link href="/dashboard/profile" className="flex items-center gap-4 px-6 py-3.5 rounded-2xl text-sm font-bold text-zinc-500 hover:text-[#1E40AF] hover:bg-[#1E40AF]/5 transition-all uppercase tracking-tight italic"><UserIcon className="w-5 h-5 text-zinc-400 hover:text-[#1E40AF]" /> Profil</Link>
            <Link href={role === "ADMIN" ? "/dashboard/admin/settings" : "/dashboard/settings"} className="flex items-center gap-4 px-6 py-3.5 rounded-2xl text-sm font-bold text-zinc-500 hover:text-[#1E40AF] hover:bg-[#1E40AF]/5 transition-all uppercase tracking-tight italic"><Settings className="w-5 h-5 text-zinc-400 hover:text-[#1E40AF]" /> Pengaturan</Link>
            <button onClick={() => signOut({ callbackUrl: window.location.origin })} className="w-full flex items-center gap-4 px-6 py-3.5 rounded-2xl text-sm font-bold text-red-500 hover:bg-red-50 transition-all uppercase tracking-tight italic cursor-pointer"><LogOut className="w-5 h-5 text-red-400" /> Logout</button>
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
  const [dropdownOpen, setDropdownOpen] = React.useState(false);

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
    <header className="h-24 bg-white border-b border-zinc-150 flex items-center justify-between px-8 lg:px-12 sticky top-0 z-35 shadow-sm shadow-zinc-100/5 text-left">
       <div className="flex-1" />

       <div className="flex items-center gap-4 ml-auto">
          <Link href="/dashboard/notifications" className="relative p-3 bg-zinc-50 rounded-2xl border border-zinc-100 text-zinc-400 hover:text-[#1E40AF] transition-all group">
             <Bell className="w-5 h-5 transition-transform group-hover:scale-110" />
             {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 min-w-[20px] h-5 bg-[#1E40AF] border-2 border-white rounded-full flex items-center justify-center text-[8px] font-bold text-white shadow-glow animate-pulse">
                   {unreadCount > 9 ? "9+" : unreadCount}
                </span>
             )}
          </Link>
          
          <div className="relative">
             <div 
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="flex items-center gap-4 pl-6 border-l border-zinc-150 group cursor-pointer select-none"
             >
                <div className="text-right hidden sm:block">
                   <p className="text-xs font-black uppercase italic tracking-tighter text-foreground leading-none">{session?.user?.name ?? "Portal User"}</p>
                   <p className="text-[10px] font-black text-[#1E40AF] uppercase italic opacity-85 leading-none mt-1">{(session?.user as { role: string })?.role ?? "USER"}</p>
                </div>
                <div className="w-12 h-12 rounded-2xl bg-[#1E40AF]/10 flex items-center justify-center border border-[#1E40AF]/20 shadow-inner group-hover:rotate-6 transition-all overflow-hidden text-[#1E40AF] relative">
                   {session?.user?.image ? (
                      <Image 
                        src={session.user.image} 
                        alt="Avatar" 
                        fill 
                        sizes="48px"
                        className="object-cover"
                      />
                   ) : (
                      <UserIcon className="w-6 h-6" />
                   )}
                </div>
                <ChevronDown className={cn("w-4 h-4 text-zinc-300 transition-transform duration-200 group-hover:translate-y-0.5", dropdownOpen && "rotate-180")} />
             </div>

             {dropdownOpen && (
                <>
                   {/* Backdrop to dismiss dropdown */}
                   <div className="fixed inset-0 z-40 cursor-default" onClick={() => setDropdownOpen(false)} />
                   
                   {/* Dropdown Card */}
                   <div className="absolute right-0 mt-3 w-60 bg-white border border-zinc-150 rounded-[1.5rem] shadow-2xl py-3.5 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                      <div className="px-6 py-2.5 border-b border-zinc-100 mb-2">
                         <p className="text-xs font-black text-zinc-800 uppercase truncate">{session?.user?.name ?? "User"}</p>
                         <p className="text-[9px] font-mono text-zinc-400 truncate mt-0.5">{session?.user?.email ?? ""}</p>
                      </div>

                      <Link 
                         href={(session?.user as { role: string })?.role === "ADMIN" ? "/dashboard/admin/settings" : "/dashboard/settings"}
                         onClick={() => setDropdownOpen(false)}
                         className="flex items-center gap-3 px-6 py-3 text-xs font-black text-zinc-500 hover:text-primary hover:bg-primary/5 transition-all uppercase tracking-tight italic"
                      >
                         <Settings className="w-4.5 h-4.5 text-zinc-400" />
                         Pengaturan Akun
                      </Link>

                      <Link 
                         href="/dashboard/notifications"
                         onClick={() => setDropdownOpen(false)}
                         className="flex items-center gap-3 px-6 py-3 text-xs font-black text-zinc-500 hover:text-primary hover:bg-primary/5 transition-all uppercase tracking-tight italic"
                      >
                         <Bell className="w-4.5 h-4.5 text-zinc-400" />
                         Notifikasi Saya
                      </Link>

                      <div className="border-t border-zinc-100 my-2" />

                      <button 
                          onClick={() => {
                             setDropdownOpen(false);
                             signOut({ callbackUrl: window.location.origin });
                          }}
                          className="w-full flex items-center gap-3 px-6 py-3 text-xs font-black text-red-500 hover:bg-red-50 transition-all uppercase tracking-tight italic text-left cursor-pointer"
                      >
                         <LogOut className="w-4.5 h-4.5 text-red-400" />
                         Logout / Keluar
                      </button>
                   </div>
                </>
             )}
          </div>
       </div>
    </header>
  );
};
