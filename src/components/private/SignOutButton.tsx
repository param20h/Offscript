"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { LogOut, Loader2 } from "lucide-react";

export default function SignOutButton() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleLogout = async () => {
    setLoading(true);
    try {
      await fetch("/api/private/auth/logout", { method: "POST" });
      router.push("/private/login");
      router.refresh();
    } catch {
      router.push("/private/login");
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleLogout}
      disabled={loading}
      className="w-full flex items-center justify-between px-3 py-2 text-xs font-mono text-ivory/60 hover:text-acid hover:bg-ivory/[0.04] rounded-sm transition-colors border border-transparent hover:border-ivory/10 cursor-pointer"
      title="End authenticated session"
    >
      <span className="flex items-center gap-2">
        {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <LogOut className="w-3.5 h-3.5" />}
        <span>Sign Out</span>
      </span>
      <span className="text-[10px] text-ivory/30">End Session</span>
    </button>
  );
}
