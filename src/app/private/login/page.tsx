"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Lock, ArrowRight, ShieldCheck, AlertCircle, Loader2 } from "lucide-react";

export default function PrivateLoginPage() {
  const router = useRouter();
  const [adminId, setAdminId] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      const res = await fetch("/api/private/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ adminId, password }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || "Authentication failed. Access denied.");
      }

      router.push(data.redirect || "/private");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Authentication error");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-4 bg-obsidian text-ivory relative overflow-hidden">
      {/* Background architectural grid */}
      <div
        className="absolute inset-0 opacity-[0.03] pointer-events-none"
        style={{
          backgroundImage: `linear-gradient(#F0EDE5 1px, transparent 1px), linear-gradient(90deg, #F0EDE5 1px, transparent 1px)`,
          backgroundSize: "48px 48px",
        }}
      />

      <div className="w-full max-w-md relative z-10">
        {/* Header Branding */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-ivory/10 bg-ivory/[0.02] text-xs font-mono uppercase tracking-widest text-acid mb-4">
            <span className="w-1.5 h-1.5 rounded-full bg-acid animate-pulse" />
            Internal Portal
          </div>
          <h1 className="font-display text-3xl font-bold tracking-tight text-ivory">
            OFFSCRIPT <span className="text-ivory/40 font-normal">OPERATIONS</span>
          </h1>
          <p className="text-xs text-ivory/50 mt-2 font-mono">
            Restricted access. Authorized studio personnel only.
          </p>
        </div>

        {/* Login Box */}
        <div className="border border-ivory/10 bg-obsidian/80 backdrop-blur-md p-8 rounded-sm shadow-2xl relative">
          <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-acid to-transparent opacity-50" />

          {error && (
            <div className="mb-6 p-3.5 bg-red-500/10 border border-red-500/20 text-red-400 text-xs rounded-sm flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <div className="leading-relaxed">{error}</div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label
                htmlFor="adminId"
                className="block text-xs font-mono uppercase tracking-wider text-ivory/70 mb-2"
              >
                Admin Identifier
              </label>
              <input
                id="adminId"
                type="text"
                required
                autoComplete="username"
                value={adminId}
                onChange={(e) => setAdminId(e.target.value)}
                placeholder="paramjit.offical34@gmail.com"
                className="w-full bg-ivory/[0.03] border border-ivory/15 px-3.5 py-2.5 text-sm text-ivory placeholder-ivory/20 focus:outline-none focus:border-acid transition-colors rounded-sm font-sans"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <label
                  htmlFor="password"
                  className="block text-xs font-mono uppercase tracking-wider text-ivory/70"
                >
                  Password
                </label>
                <span className="text-[10px] font-mono text-ivory/30">Direct ID/Pass</span>
              </div>
              <input
                id="password"
                type="password"
                required
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full bg-ivory/[0.03] border border-ivory/15 px-3.5 py-2.5 text-sm text-ivory placeholder-ivory/20 focus:outline-none focus:border-acid transition-colors rounded-sm font-mono tracking-widest"
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full mt-2 bg-acid text-obsidian font-mono uppercase text-xs font-semibold py-3 px-4 rounded-sm flex items-center justify-center gap-2 hover:bg-[#cbf52b] transition-all disabled:opacity-50 disabled:cursor-not-allowed group cursor-pointer"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Verifying Credentials...</span>
                </>
              ) : (
                <>
                  <Lock className="w-3.5 h-3.5" />
                  <span>Authenticate Session</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                </>
              )}
            </button>
          </form>

          <div className="mt-6 pt-6 border-t border-ivory/10 flex items-center justify-between text-[11px] font-mono text-ivory/40">
            <span className="flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-acid" />
              HMAC SHA-256
            </span>
            <Link href="/" className="hover:text-ivory transition-colors">
              ← Public Site
            </Link>
          </div>
        </div>

        <p className="text-center text-[11px] text-ivory/30 mt-6 font-mono">
          OFFSCRIPT Studio Operations Portal · v2.0
        </p>
      </div>
    </div>
  );
}
