// File: components/PromoModal.tsx
"use client";

import {
  Dialog,
  DialogContent,
} from "@/components/ui/dialog";

interface PromoModalProps {
  open: boolean;
  onClaim: () => void;
  onClose: () => void;
}

export function PromoModal({ open, onClaim, onClose }: PromoModalProps) {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-xs mx-auto p-6 bg-white rounded-2xl shadow-lg space-y-6">
        
        {/* Header + Description */}
        <div className="text-center space-y-2">
          <h2 className="text-xl font-bold text-charcoal">
            Welcome to Your Dashboard!
          </h2>
          <p className="text-sm text-gray-700">
            Here’s your special code for 10% off:
          </p>
        </div>

        {/* Code input */}
        <input
          readOnly
          value="WELCOME10"
          className="w-full px-3 py-2 border border-gray-300 rounded-md text-center font-mono"
        />

        {/* Buttons */}
        <div className="flex flex-col space-y-2">
          <button
            onClick={onClaim}
            className="w-full px-4 py-2 bg-charcoal text-white rounded-md"
          >
            Claim Code
          </button>
          <button
            onClick={onClose}
            className="w-full px-4 py-2 border border-charcoal text-charcoal rounded-md"
          >
            Close
          </button>
        </div>

      </DialogContent>
    </Dialog>
  );
}
