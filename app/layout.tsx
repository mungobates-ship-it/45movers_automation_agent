import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Sidebar } from "@/components/Sidebar";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "45 Movers — PDR Dashboard",
  description: "Track action items from the Procedural Documentation Record",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        {/* Sidebar */}
        <Sidebar />

        {/* Sticky Frosted Glass Header */}
        <header
          style={{
            background: 'rgba(255,255,255,0.8)',
            backdropFilter: 'saturate(180%) blur(20px)',
            borderBottom: '1px solid var(--border)',
            position: 'sticky',
            top: 0,
            zIndex: 40,
            paddingLeft: '64px'
          }}
          className="px-6 py-4"
        >
          <div className="max-w-5xl flex items-center justify-between">
            <div>
              <h1 className="text-xl font-semibold" style={{ color: 'var(--foreground)' }}>
                45 Movers
              </h1>
              <p className="text-xs" style={{ color: 'var(--secondary)' }}>
                PDR Dashboard
              </p>
            </div>
          </div>
        </header>

        {/* Main Content */}
        {children}
      </body>
    </html>
  );
}
