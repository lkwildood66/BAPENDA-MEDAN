import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { AdminDashboard } from "@/components/dashboard/AdminDashboard";
import { OfficerDashboard } from "@/components/dashboard/OfficerDashboard";
import { UserDashboard } from "@/components/dashboard/UserDashboard";
import { MahasiswaDashboard } from "@/components/dashboard/MahasiswaDashboard";

export const metadata = {
  title: "Dashboard — SIPADA Medan",
  description: "Dashboard layanan perpajakan digital Bapenda Kota Medan",
};

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/login");
  }

  const role = (session.user as { role?: string }).role;

  if (role === "ADMIN") {
    return <AdminDashboard session={session} />;
  }

  if (role === "OFFICER") {
    return <OfficerDashboard session={session} />;
  }

  if (role === "MAHASISWA") {
    return <MahasiswaDashboard session={session} />;
  }

  return <UserDashboard session={session} />;
}
