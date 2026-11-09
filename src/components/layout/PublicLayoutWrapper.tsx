"use client";

import React from "react";
import { usePathname } from "next/navigation";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";

export default function PublicLayoutWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isPrivate = pathname?.startsWith("/private");
  const isProposalViewer = pathname?.startsWith("/proposal");
  const isClientPortal = pathname?.startsWith("/client");

  if (isClientPortal) {
    return <div className="min-h-screen w-full bg-[#F0EDE5] text-[#171717]">{children}</div>;
  }

  if (isPrivate || isProposalViewer) {
    return <div className="min-h-screen w-full bg-obsidian text-ivory">{children}</div>;
  }

  return (
    <>
      <Navbar />
      <main className="flex-1 w-full">{children}</main>
      <Footer />
    </>
  );
}
