// File: app/page.tsx
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

// A small component that, on mount, flips from hidden→visible to trigger CSS transitions
function PopupOverlay({ onClose }: { onClose: () => void }) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // Next tick ensures initial render has hidden styles
    requestAnimationFrame(() => setVisible(true));
  }, []);

  return (
    <div
      className={
        `fixed inset-0 z-50 flex items-center justify-center ` +
        `bg-black/60 backdrop-blur-sm p-4 ` +
        `transition-opacity duration-500 ease-out ` +
        (visible ? "opacity-100" : "opacity-0")
      }
    >
      <div
        className={
          `relative w-full max-w-xl max-h-[95vh] overflow-hidden ` +
          `transition-transform duration-500 ease-out ` +
          (visible ? "scale-100" : "scale-95")
        }
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-2 right-2 text-gray-200 hover:text-white text-2xl font-bold z-10"
          aria-label="Close"
        >
          ×
        </button>

        {/* Embedded GHL Form */}
        <iframe
          src="https://go.aimavenstudio.com/widget/form/vrVvmyJfPevU4d1J5513"
          style={{
            width: "100%",
            height: "100%",
            border: "none",
            borderRadius: "4px",
            background: "transparent",
          }}
          id="inline-vrVvmyJfPevU4d1J5513"
          data-layout='{"id":"INLINE"}'
          data-trigger-type="alwaysShow"
          data-activation-type="alwaysActivated"
          data-deactivation-type="neverDeactivate"
          data-form-name="Contact Us"
          data-height="456"
          data-layout-iframe-id="inline-vrVvmyJfPevU4d1J5513"
          data-form-id="vrVvmyJfPevU4d1J5513"
          data-success-type="message"
          data-success="🎉 Thanks! Your code’s on its way."
          title="Contact Us"
        />
      </div>
    </div>
  );
}

export default function Index() {
  const [showPopup, setShowPopup] = useState(false);

  useEffect(() => {
    // After 15s, show the popup and inject the GHL script
    const timer = setTimeout(() => {
      setShowPopup(true);
      const script = document.createElement("script");
      script.src = "https://go.aimavenstudio.com/js/form_embed.js";
      script.async = true;
      document.body.appendChild(script);
    }, 15000);
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

      {showPopup && <PopupOverlay onClose={() => setShowPopup(false)} />}

      {/* ─── Override GHL’s default modal shell ─────────────────────────── */}
      <style jsx global>{`
        /* hide their white box and backdrop */
        #gf_frame,
        .ghl-modal,
        .ghl-modal .modal-dialog {
          background: transparent !important;
          box-shadow: none !important;
        }
        .ghl-modal-backdrop {
          background: transparent !important;
        }
        /* keep the form itself transparent */
        .ghl-form-container {
          background: transparent !important;
        }
      `}</style>
    </div>
  );
}
