"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Inbox,
  Users,
  FileSpreadsheet,
  Receipt,
  Layers,
  BarChart3,
  ExternalLink,
} from "lucide-react";

interface NavItem {
  name: string;
  href: string;
  icon: React.ElementType;
  phase?: string;
  badge?: string;
}

const NAV_ITEMS: NavItem[] = [
  { name: "Overview", href: "/private", icon: LayoutDashboard },
  { name: "Inquiries", href: "/private/inquiries", icon: Inbox },
  { name: "Clients", href: "/private/clients", icon: Users },
  { name: "Proposals", href: "/private/proposals", icon: FileSpreadsheet },
  { name: "Invoices", href: "/private/invoices", icon: Receipt },
  { name: "Projects", href: "/private/projects", icon: Layers },
  { name: "Analytics", href: "/private/analytics", icon: BarChart3 },
];

export default function SidebarNav() {
  const pathname = usePathname();

  return (
    <nav className="space-y-1.5 px-3">
      <div className="text-[10px] font-mono uppercase tracking-widest text-ivory/30 px-3 py-2">
        Core Operations
      </div>

      {NAV_ITEMS.map((item) => {
        const Icon = item.icon;
        const isActive =
          item.href === "/private"
            ? pathname === "/private"
            : item.href !== "#" && pathname.startsWith(item.href);

        const isLocked = item.href === "#";

        if (isLocked) {
          return (
            <div
              key={item.name}
              className="flex items-center justify-between px-3 py-2 text-xs font-mono text-ivory/30 rounded-sm cursor-not-allowed select-none"
            >
              <div className="flex items-center gap-2.5">
                <Icon className="w-4 h-4 opacity-40" />
                <span>{item.name}</span>
              </div>
              {item.phase && (
                <span className="text-[9px] px-1.5 py-0.5 rounded border border-ivory/10 text-ivory/30 bg-ivory/[0.02]">
                  Phase {item.phase}
                </span>
              )}
            </div>
          );
        }

        return (
          <Link
            key={item.name}
            href={item.href}
            className={`flex items-center justify-between px-3 py-2 text-xs font-mono rounded-sm transition-all ${
              isActive
                ? "bg-acid/10 text-acid font-semibold border-l-2 border-acid"
                : "text-ivory/70 hover:text-ivory hover:bg-ivory/[0.04]"
            }`}
          >
            <div className="flex items-center gap-2.5">
              <Icon className="w-4 h-4" />
              <span>{item.name}</span>
            </div>
          </Link>
        );
      })}

      <div className="pt-4 mt-4 border-t border-ivory/10">
        <div className="text-[10px] font-mono uppercase tracking-widest text-ivory/30 px-3 py-2">
          Agency Links
        </div>
        <Link
          href="/"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-between px-3 py-2 text-xs font-mono text-ivory/50 hover:text-ivory hover:bg-ivory/[0.04] rounded-sm transition-colors"
        >
          <div className="flex items-center gap-2.5">
            <ExternalLink className="w-4 h-4" />
            <span>Public Website</span>
          </div>
          <span className="text-[10px] text-ivory/30">↗</span>
        </Link>
      </div>
    </nav>
  );
}
