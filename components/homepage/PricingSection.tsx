import { Badge } from "@/components/ui/badge"
import ModernPricing from "@/components/homepage/modern-pricing"

export default function PricingSection() {
  return (
    <section id="pricing" className="border-t py-20 md:py-32 bg-muted/30">
      <div className="container px-4 md:px-6">
        <div className="flex flex-col items-center justify-center gap-4 text-center md:gap-8">
          <Badge variant="outline" className="mb-2 border-dusty-coral text-dusty-coral">
            Pricing
          </Badge>
          <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl text-charcoal md:text-5xl">
            Premium Headshots<span className="text-primary"> Without</span> the Premium Price Tag
          </h2>
          <p className="max-w-[700px] text-charcoal text-muted-foreground text-lg">
            Why spend $200–$500 on a traditional photoshoot when you can get professional-quality results in minutes — for a fraction of the cost?
            At AI Maven Studio, we make transformation affordable, accessible, and completely aligned with your brand.
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
