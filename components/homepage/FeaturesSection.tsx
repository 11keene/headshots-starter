import { Camera, Clock, Shield, Star } from "lucide-react"
import { Badge } from "@/components/ui/badge"

const features = [
  {
    title: "Signature Styles (Pre-Made Packs)",
    description: "Our themed packs are professionally curated to give you a strong visual identity with ease. Choose a look that fits your industry or personality — from Modern Business to Bold Creative, each pack is designed for maximum impact.",
    icon: <Camera className="h-6 w-6" />
  },
  {
    title: "Custom Styles (Build Your Own)",
    description: "Prefer more control? Choose your own direction by selecting the key elements of your shoot — like background, outfit tone, and overall vibe. Custom styles offer a flexible, elevated experience tailored just for you.",
    icon: <Camera className="h-6 w-6" />
  },
  {
    title: "Crystal-Clear Quality",
    description: "All images are delivered in high-resolution 4K, ensuring they’re crisp, clean, and print-ready.",
    icon: <Clock className="h-6 w-6" />
  },
  {
    title: "Lightning-Fast Delivery",
    description: "Get your polished headshots in as little as 20 minutes. No retouch delays. No back-and-forth.",
    icon: <Clock className="h-6 w-6" />
  },
  {
    title: "Full Commercial Rights",
    description: "Your headshots are yours to use freely — for business cards, billboards, social media, or speaking engagements.",
    icon: <Shield className="h-6 w-6" />
  },
  {
    title: "AI, Perfected",
    description: "Our advanced system produces natural, photorealistic results that feel as real as they look — always aligned with your best self.",
    icon: <Star className="h-6 w-6" />
  },
]

export default function FeaturesSection() {
  return (
    <section className="py-20 md:py-32 bg-muted/30">
      <div className="container px-4 md:px-6">
        <div className="text-center mb-12">
          <Badge variant="outline" className="mb-4">Features</Badge>
          <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
          Everything You Need to Look the Part — and Feel It Too

          </h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div key={index} className="p-6 rounded-lg bg-background border">
              <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                {feature.icon}
              </div>
              <h3 className="font-semibold mb-2">{feature.title}</h3>
              <p className="text-muted-foreground">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}