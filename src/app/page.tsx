import React from "react";
import Hero from "@/components/sections/Hero";
import StudioStatement from "@/components/sections/StudioStatement";
import SelectedWork from "@/components/sections/SelectedWork";
import ServicesPreview from "@/components/sections/ServicesPreview";
import Process from "@/components/sections/Process";
import ContactCTA from "@/components/sections/ContactCTA";

export default function HomePage() {
  return (
    <div className="w-full">
      <Hero />
      <StudioStatement />
      <SelectedWork />
      <ServicesPreview />
      <Process />
      <ContactCTA />
    </div>
  );
}
