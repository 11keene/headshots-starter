// File: components/homepage/HeroSection.tsx
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import ThreeDBeforeAfterGallery from "@/components/homepage/3d-before-after-gallery";

export default function HeroSection() {
  return (
    <section className="relative overflow-hidden py-16 md:py-24">
      <div className="container px-4 md:px-6">
        <div className="mx-auto max-w-3xl text-center mb-8">
          <Badge
            className="mb-4 bg-muted-gold/30 text-muted-gold border-transparent"
            variant="default"
          >
            #1 AI Headshot Generator for Bold Brands and Big Goals
          </Badge>

          <h1 className="text-4xl font-bold tracking-tighter text-charcoal sm:text-5xl md:text-6xl mb-6">
            The AI Headshot Experience Built for Ambitious{" "}
            <span className="text-muted-gold">Professionals</span>
          </h1>

          <p className="text-charcoal text-lg md:text-xl max-w-[800px] mx-auto mb-8">
            Welcome to AI Maven Studio — where your transformation begins. No
            camera crew. No overpriced photo shoots. Just effortless excellence
            — powered by AI, styled by purpose.
          </p>

          <div className="mt-8 flex flex-col sm:flex-row justify-center gap-4">
            <Link href="/login" className="w-full sm:w-auto">
              <Button
                size="lg"
                className="
                  bg-muted-gold text-ivory
                  hover:bg-muted-gold/90
                  transition
                  group
                "
              >
                Create My Headshots Now
                <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Button>
            </Link>
          </div>
        </div>

        <div className="mt-12">
          <ThreeDBeforeAfterGallery />
        </div>
      </div>
    </section>
  );
}
