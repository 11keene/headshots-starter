"use client";

import { useEffect, useState } from "react";
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
  const [showPopup, setShowPopup] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowPopup(true);

      const script = document.createElement("script");
      script.src = "https://go.aimavenstudio.com/js/form_embed.js";
      script.async = true;
      document.body.appendChild(script);
    }, 5000); // Show after 5 seconds

    return () => clearTimeout(timer);
  }, []);

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

      {showPopup && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-charcoal/90 backdrop-blur-sm p-4">
          <div className="relative bg-white rounded-lg shadow-xl w-full max-w-xl max-h-[95vh] overflow-hidden">
            {/* Close Button */}
            <button
              onClick={() => setShowPopup(false)}
              className="absolute top-2 right-2 text-gray-500 hover:text-black text-2xl font-bold z-10"
              aria-label="Close"
            >
              ×
            </button>

            {/* Embedded GHL Form */}
            <iframe
              src="https://go.aimavenstudio.com/widget/form/NJOVobvUsi6JnHXbwdYY"
              style={{
                width: "100%",
                height: "800px",
                border: "none",
                borderRadius: "8px",
              }}
              id="inline-NJOVobvUsi6JnHXbwdYY"
              data-layout='{"id":"INLINE"}'
              data-trigger-type="alwaysShow"
              data-trigger-value=""
              data-activation-type="alwaysActivated"
              data-activation-value=""
              data-deactivation-type="neverDeactivate"
              data-deactivation-value=""
              data-form-name="Studio Pop Up"
              data-height="797"
              data-layout-iframe-id="inline-NJOVobvUsi6JnHXbwdYY"
              data-form-id="NJOVobvUsi6JnHXbwdYY"
              title="Studio Pop Up"
            />
          </div>
        </div>
      )}
    </div>
  );
}
