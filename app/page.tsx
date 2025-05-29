// File: app/page.tsx
import HeroSection from "@/components/homepage/HeroSection";
import BrandsSection from "@/components/homepage/BrandsSection";
import ProcessSection from "@/components/homepage/ProcessSection";
import FeaturesSection from "@/components/homepage/FeaturesSection";
import ExamplesSection from "@/components/homepage/ExamplesSection";
import TestimonialsSection from "@/components/homepage/TestimonialsSection";
import PricingSection from "@/components/homepage/PricingSection";
import FAQSection from "@/components/homepage/FAQSection";
import CTASection from "@/components/homepage/CTASection";
import ScrollCTA from "@/components/homepage/ScrollCTA";

export const dynamic = "force-dynamic";

export default function Index() {
  return (
    <div className="flex min-h-screen flex-col">
      <div className="flex-1">
        <HeroSection />
        <BrandsSection />
        <ProcessSection />
        <FeaturesSection />
        <ExamplesSection />
        <TestimonialsSection />
        <PricingSection />
        <FAQSection />
        <CTASection />
      </div>
      <ScrollCTA />
    </div>
  );
}
