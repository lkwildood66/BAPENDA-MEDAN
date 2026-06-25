import { withAuth } from "next-auth/middleware";

export default withAuth({
  callbacks: {
    authorized({ req, token }) {
      const pathname = req.nextUrl.pathname;

      const publicPaths = [
        "/",
        "/login",
        "/register",
        "/informasi",
        "/layanan",
        "/pajak-daerah",
        "/panduan",
        "/api/auth",
        "/api/tax/check",
        "/api/gis",
        "/api/cms/news",
        "/api/announcements",
        "/api/uploadthing",
        "/api/chatbot",
      ];

      if (publicPaths.some((p) => pathname === p || pathname.startsWith(p + "/"))) {
        return true;
      }

      if (pathname.startsWith("/dashboard") || pathname.startsWith("/api/admin") || pathname.startsWith("/api/profile") || pathname.startsWith("/api/notifications")) {
        return !!token;
      }

      return true;
    },
  },
});

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|logo-.*\\.webp).*)"],
};
