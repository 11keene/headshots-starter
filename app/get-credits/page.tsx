// File: app/get-credits/page.tsx
"use client";

import { useEffect, useState } from "react";
import { createPagesBrowserClient } from "@supabase/auth-helpers-nextjs";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle, ClockIcon, PaletteIcon, BadgeCheckIcon, StarIcon } from "lucide-react";

export default function PricingPage() {
  const supabase = createPagesBrowserClient();
  const router = useRouter();
  const [userId, setUserId] = useState<string | null>(null);

  // Proxy endpoint to avoid CORS: /api/intake-start
  const sendIntakeStarted = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user?.email) return;

      await fetch('/api/intake-start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: user.email,
          firstName: user.user_metadata?.full_name?.split(' ')[0] || '',
          lastName: user.user_metadata?.full_name?.split(' ')[1] || '',
        }),
      });
    } catch (error) {
      console.error('Failed to send intake_started proxy request', error);
    }
  };

  // on mount, get user and redirect unauthenticated
  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (data.user) setUserId(data.user.id);
      else router.push('/login?redirectTo=/get-credits');
    });
  }, [supabase, router]);

  // Modified handler for Choose Pack
  const handleChoosePack = async () => {
    await sendIntakeStarted(); // trigger proxy API before navigation
    router.push('/custom-intake?packType=professional');
  };

  return (
    <div className="min-h-screen bg-charcoal text-white py-16">
      <div className="container mx-auto px-4 space-y-12">
        {/* Heading */}
        <h1 className="text-4xl md:text-5xl font-extrabold text-center">
          Why AI Maven? <br className="md:hidden" /> See the Difference.
        </h1>

        {/* Professional Pack Card */}
        <div className="flex justify-center">
          <Card className="max-w-md w-full bg-muted/30 p-8 border border-gray-700">
            <h2 className="text-2xl text-white font-bold mb-2">The Professional Pack</h2>
            <p className="text-gray-300 mb-6">
              45 fully customized AI-generated headshots crafted from your selfies.
              Perfect for LinkedIn, speaker bios, press kits, and more.
            </p>

            <div className="flex items-baseline gap-2 mb-6">
              <span className="text-5xl font-extrabold text-muted-gold">$49.99</span>
              <span className="text-gray-400 line-through">$79.99</span>
            </div>

            <ul className="space-y-4 mb-8">
              {[
                { label: 'Under 60-minute delivery', Icon: ClockIcon },
                { label: 'Tailored to your industry & vibe', Icon: PaletteIcon },
                { label: 'Full commercial rights', Icon: BadgeCheckIcon },
                { label: 'Consistent, editorial-quality styling', Icon: StarIcon },
              ].map(({ label, Icon }, i) => (
                <li key={i} className="flex items-center gap-2">
                  <Icon size={20} className="text-muted-gold" />
                  <span className="text-sm text-ivory leading-snug">{label}</span>
                </li>
              ))}
            </ul>

            <Button
              onClick={handleChoosePack}
              className="w-full bg-muted-gold text-charcoal font-semibold"
            >
              Choose Pack
            </Button>
          </Card>
        </div>

        {/* Comparison Table */}
        <div className="overflow-x-auto">
          <table className="w-full table-fixed text-sm">
            <colgroup>
              <col className="w-1/3" />
              <col className="w-1/3" />
              <col className="w-1/3" />
            </colgroup>
            <thead className="bg-muted-gold">
              <tr>
                <th className="px-4 py-2 text-left text-charcoal uppercase tracking-wide">Feature</th>
                <th className="px-4 py-2 text-center text-charcoal uppercase tracking-wide">Traditional Shoot</th>
                <th className="px-4 py-2 text-center text-charcoal uppercase tracking-wide">AI Maven Studio</th>
              </tr>
            </thead>
            <tbody>
              {[
                ['Time to Receive', '1–3 weeks (plus scheduling)', 'Under 60 minutes — no waiting'],
                ['Cost', '$250–$500+ for one look', '$49.99 for 45 images'],
                ['Personalization', 'One outfit, one location', 'Fully customized via intake form'],
                ['Convenience', 'Travel, setup, retouching', 'Done anywhere — no camera needed'],
                ['Creative Control', 'Photographer decides vibe', 'You direct shoot via intake'],
                ['Styling Options', 'Often one backdrop/look', 'Multiple outfits, scenes, moods'],
                ['Image Variety', '5–10 similar shots', '15 unique, prompt-based looks'],
                ['Commercial Rights', 'May cost extra', 'Always included — use freely'],
              ].map(([feat, trad, ai], i) => (
                <tr
                  key={i}
                  className={i % 2 === 0 ? 'bg-charcoal text-ivory' : 'bg-ivory text-charcoal'}
                >
                  <td className="px-4 py-3 whitespace-normal hyphens-none">{feat}</td>
                  <td className="px-4 py-3 whitespace-normal hyphens-none text-center">{trad}</td>
                  <td className="px-4 py-3 whitespace-normal hyphens-none text-center">{ai}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
