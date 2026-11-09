import React from "react";
import { redirect } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { getPrivateSession } from "@/lib/auth/session";
import SidebarNav from "@/components/private/SidebarNav";
import SignOutButton from "@/components/private/SignOutButton";
import { ShieldCheck, Server, Radio } from "lucide-react";

export const metadata = {
  title: "Agency Operations Portal | OFFSCRIPT Studio",
  robots: {
    index: false,
    follow: false,
  },
};

export default async function PrivatePortalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getPrivateSession();

  if (!session.authenticated) {
    redirect("/private/login");
  }

  return (
    <div className="min-h-screen bg-obsidian text-ivory flex flex-col md:flex-row antialiased selection:bg-acid selection:text-obsidian">
      {/* Desktop Sidebar */}
      <aside className="w-full md:w-64 border-b md:border-b-0 md:border-r border-ivory/10 bg-[#141414] flex flex-col shrink-0 md:min-h-screen">
        {/* Brand Header */}
        <div className="p-5 border-b border-ivory/10 flex items-center justify-between">
          <Link href="/private" className="group block focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-acid">
            <Image
              src="/logos/Website — Horizontal (Dark).svg"
              alt="OFFSCRIPT Studio"
              width={140}
              height={28}
              priority
              className="h-6 w-auto object-contain transition-opacity group-hover:opacity-90"
            />
            <div className="text-[10px] font-mono uppercase tracking-widest text-ivory/40 flex items-center gap-1.5 mt-2">
              <span className="w-1.5 h-1.5 rounded-full bg-acid animate-pulse" />
              <span>Operations Portal</span>
            </div>
          </Link>
          <div className="hidden md:flex items-center gap-1 px-2 py-0.5 rounded border border-ivory/10 bg-ivory/[0.02] text-[10px] font-mono text-acid">
            <Radio className="w-3 h-3 animate-pulse" />
            <span>LIVE</span>
          </div>
        </div>

        {/* Sidebar Nav */}
        <div className="flex-1 py-4">
          <SidebarNav />
        </div>

        {/* Studio Admin User Badge & Sign Out */}
        <div className="p-4 border-t border-ivory/10 bg-[#111111]/80 space-y-3">
          <div className="flex items-center gap-2.5 px-2">
            <div className="w-7 h-7 rounded-full bg-acid/10 border border-acid/30 flex items-center justify-center text-acid font-mono text-xs font-semibold">
              {(session.adminId?.[0] || "A").toUpperCase()}
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-xs font-mono text-ivory font-medium truncate">
                {session.adminId}
              </div>
              <div className="text-[10px] font-mono text-ivory/40 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                <span>Authorized Admin</span>
              </div>
            </div>
          </div>

          <SignOutButton />
        </div>
      </aside>

      {/* Main Operations Work Area */}
      <div className="flex-1 flex flex-col min-w-0 bg-obsidian">
        {/* Top bar */}
        <header className="h-14 border-b border-ivory/10 px-6 flex items-center justify-between bg-obsidian/60 backdrop-blur-sm sticky top-0 z-20">
          <div className="flex items-center gap-2 text-xs font-mono text-ivory/50">
            <span className="text-ivory font-medium">OFFSCRIPT Studio</span>
            <span>/</span>
            <span className="text-ivory/70">Private Admin Console</span>
          </div>

          <div className="flex items-center gap-4 text-xs font-mono">
            <Link
              href="/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-ivory/40 hover:text-ivory text-xs font-mono transition-colors flex items-center gap-1"
            >
              <span>Live Website</span>
              <span className="text-[10px]">↗</span>
            </Link>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-6 lg:p-8 max-w-7xl w-full mx-auto">{children}</main>
      </div>
    </div>
  );
}
