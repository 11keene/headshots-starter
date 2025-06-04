// components/AnnouncementBar.tsx
"use client";

import { useState } from "react";
import { X } from "lucide-react";
import { motion } from "motion/react";

const isEnabled = process.env.NEXT_PUBLIC_ANNOUNCEMENT_ENABLED === "true";

export default function AnnouncementBar() {
  const [isVisible, setIsVisible] = useState(true);

  // Hide entirely if the feature is turned off or the bar has been dismissed
  if (!isEnabled || !isVisible) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative bg-charcoal text-white py-2 px-4 text-center text-sm"
    >
      <div className="container mx-auto flex items-center justify-center">
        <p>
          👥 For Team Headshots, please&nbsp;
          <a
            href="mailto:support@aimavenstudio.com"
            className="underline hover:text-slate-300"
          >
            click here to email us
          </a>
          &nbsp;and let us know exactly what you need.
        </p>

        <button
          onClick={() => setIsVisible(false)}
          className="absolute right-4 top-1/2 -translate-y-1/2 text-white/80 hover:text-white"
          aria-label="Close announcement"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </motion.div>
  );
}
