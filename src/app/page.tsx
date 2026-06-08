"use client";
import HeroSection from "@/components/HeroSection";
import AboutSection from "@/components/AboutSection";
import StatsSection from "@/components/StatsSection";
import GroundsCarousel from "@/components/GroundsCarousel";
import CTASection from "@/components/CTASection";
// import TermsSection from "@/components/TermsAndConditions";

export default function HomePage() {
  return (
    <main className="w-full overflow-x-hidden bg-[#020617] selection:bg-emerald-200 selection:text-emerald-900">
      {/* Hero Section */}
      <HeroSection />

      {/* About / Features - White background */}
      <AboutSection />

      {/* Stats / Numbers - Deep Slate background */}
      <StatsSection />

      {/* Auto-scrolling Grounds Carousel - White background */}
      <GroundsCarousel />

      {/* Call To Action - Deep Slate background */}
      <CTASection />
    </main>
  );
}
