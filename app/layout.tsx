import { Jost, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/Providers";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

const jost = Jost({
  variable: "--font-jost",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

import { constructMetadata } from "@/lib/metadata";
import { StickyBottomNav } from "@/components/StickyBottomNav";
import { AccessibilityWidget } from "@/components/AccessibilityWidget";
import { ChatbotWidget } from "@/components/ChatbotWidget";


export const metadata = constructMetadata();

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await getServerSession(authOptions);
  return (
    <html lang="id" suppressHydrationWarning>
      <body
        className={`${jost.variable} ${geistMono.variable} antialiased`}
      >
        <Providers session={session}>
          {children}
          <AccessibilityWidget />
          <ChatbotWidget />

          <StickyBottomNav />
        </Providers>
      </body>
    </html>
  );
}
