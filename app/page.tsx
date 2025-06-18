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
import Image from "next/image";

export const dynamic = "force-dynamic";

function PopupOverlay({ onClose }: { onClose: () => void }) {
  const [visible, setVisible] = useState(false);
  const [firstName, setFirstName] = useState("");
  const [email, setEmail] = useState("");
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    requestAnimationFrame(() => setVisible(true));
  }, []);

const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  setLoading(true);

  try {
    const res = await fetch("/api/create-discount-code", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ firstName, email }),
    });

    const json = await res.json();

    if (res.ok) {
      console.log("✅ Promo code received:", json.promoCode);
      setSuccess(true);
    } else {
      console.error("❌ Server error:", json.error);
      alert("Error: " + json.error);
    }
  } catch (err) {
    console.error("❌ Network error:", err);
    alert("An unexpected error occurred. Please try again.");
  } finally {
    setLoading(false);
  }
};


  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 transition-opacity duration-500 ease-out ${
        visible ? "opacity-100" : "opacity-0"
      }`}
    >
      <div className="relative w-full max-w-[90vw] sm:max-w-[400px] bg-[#F0EEE4] rounded-2xl p-6 text-center shadow-xl">
        <button
          onClick={onClose}
          className="absolute top-2 right-3 text-gray-400 hover:text-black text-xl font-bold z-10"
          aria-label="Close"
        >
          ×
        </button>

        {success ? (
          <div className="text-black">
            <h2 className="text-lg font-bold mb-2">🎉 You're In!</h2>
            <p className="text-sm">
              Your 50% off code is on its way to your inbox. Be sure to check your spam folder!
            </p>
          </div>
        ) : (
          <>
            <Image
              src="/newlogo.png"
              alt="AI Maven Logo"
              width={48}
              height={48}
              className="mx-auto mb-3 rounded"
            />
            <h2 className="text-lg sm:text-xl font-bold text-black mb-2">
              Get 50% Off — Limited Time!
            </h2>
            <p className="text-sm text-black mb-4">
              Your code will be emailed after sign up.
              <br />
              Check spam if you don't see it.
              <br />
              <span className="font-semibold">Valid for 24 hours.</span>
            </p>

            <form onSubmit={handleSubmit} className="space-y-3">
              <input
                type="text"
                placeholder="First Name"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                className="w-full px-3 py-2 rounded border border-[#333] text-sm text-black"
                required
              />
              <input
                type="email"
                placeholder="Email*"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3 py-2 rounded border border-[#333] text-sm text-black"
                required
              />
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-black text-white py-2 font-semibold rounded hover:opacity-90 transition"
              >
                {loading ? "Sending..." : "REDEEM NOW"}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}

export default function Index() {
  const [showPopup, setShowPopup] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowPopup(true);
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
    </div>
  );
}
