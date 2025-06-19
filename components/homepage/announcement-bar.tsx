// File: components/AnnouncementBar.tsx
"use client";

import { useState } from "react";
import { X } from "lucide-react";
import { motion } from "motion/react";

const isEnabled = process.env.NEXT_PUBLIC_ANNOUNCEMENT_ENABLED === "true";

export default function AnnouncementBar() {
  const [isVisible, setIsVisible] = useState(true);

  if (!isEnabled || !isVisible) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative bg-charcoal text-white py-3 px-4 text-center text-sm sm:text-base"
    >
      <div className="container mx-auto flex items-center justify-center space-x-2">
        <span className="text-muted-gold font-medium">
          🎉 Limited Time: Get <strong>50% off</strong> your first order!
        </span>
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
