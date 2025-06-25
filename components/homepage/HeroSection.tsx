import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import ThreeDBeforeAfterGallery from "@/components/homepage/3d-before-after-gallery";

export default function HeroSection() {
  return (
    <section className="relative overflow-hidden pt-6 pb-8 md:pt-10 md:pb-12">
      <div className="container px-4 md:px-6">
        <div className="mx-auto max-w-3xl text-center mb-4">
          <Badge
            className="mb-4 bg-muted-gold/20 text-muted-gold border-transparent"
            variant="default"
          >
            #1 AI Headshots for Ambitious Professionals
          </Badge>

          <h1 className="text-4xl font-bold tracking-tighter text-charcoal sm:text-5xl md:text-6xl mb-6 leading-tight">
            Transform Your Profile.{'\u00A0'}
            <span className="whitespace-nowrap text-muted-gold">High-Quality</span>{" "}
            AI Headshots, Fast.
          </h1>

          <p className="text-charcoal text-base md:text-lg max-w-[800px] mx-auto mb-4">
            You don’t need a camera crew to look like a leader. Turn your smartphone selfies into professional headshots that build your personal brand.
          </p>
        </div>

        {/* 👇 Carousel moved up */}
        <div className="mt-2 -mb-2">
          <ThreeDBeforeAfterGallery />
        </div>

        {/* 👇 Button moved to bottom */}
        <div className="mt-6 text-center">
          <Link href="/login">
            <Button
              size="lg"
              className="
                bg-charcoal text-ivory
                hover:bg-muted-gold/90
                transition
                group
              "
            >
              Show Me What’s Possible
              <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}
