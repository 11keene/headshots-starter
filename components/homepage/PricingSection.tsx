import { Badge } from "@/components/ui/badge"
import ModernPricing from "@/components/homepage/modern-pricing"

export default function PricingSection() {
  return (
    <section id="pricing" className="border-t py-20 md:py-32 bg-muted/30">
      <div className="container px-4 md:px-6">
        <div className="flex flex-col items-center justify-center gap-4 text-center md:gap-8">
          <Badge variant="outline" className="mb-2 border-muted-gold text-charcoal">
            Pricing
          </Badge>
          <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl text-charcoal md:text-5xl">
            Studio-Quality Headshots, <span className="text-muted-gold"> Without</span>  the Studio Price
          </h2>
          <p className="max-w-[700px] text-charcoal text-muted-foreground text-lg">
            Skip the $300+ photoshoots. At AI Maven Studio, you’ll get 45 hyper-realistic, professional-grade headshots — custom-built from your vision — delivered in under an hour. All for a fraction of the cost. No cameras. No waiting. No compromises.
          </p>
        </div>

        {/* 20% Off Banner */}
        <div className="mt-8">
          <div className="bg-charcoal text-white text-center font-semibold py-2 rounded mb-6">
            20% off all packages limited time only!
          </div>
          <ModernPricing />
        </div>
      </div>
    </section>
  )
}
