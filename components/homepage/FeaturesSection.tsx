import { Camera, Clock, Shield, Star } from "lucide-react"
import { Badge } from "@/components/ui/badge"

const features = [
  {
    title: " Professional Headshots",
    subtitle: "High-Quality, Hyper-Realistic Images in Under an Hour",
    description: `Skip the weeks-long wait and studio stress. With AI Maven Studio, you’ll receive 45 ultra-polished, professionally styled headshots — crafted to elevate your presence across LinkedIn, websites, speaking profiles, and more. Our AI delivers studio-level realism with natural lighting, sharp detail, and effortless ease — all at a fraction of the cost of a traditional photoshoot. It's your new professional image, transformed and ready in under 60 minutes.`,
    icon: <Camera className="h-6 w-6" />
  },
  {
    title: "Custom Intake Form",
        subtitle:"Your Vision, Your Shoot — Guided with Intention",
    description: "Before checkout, you'll walk through a thoughtfully designed intake form that invites you to shape every element of your shoot — from hair texture to clothing style, background setting to professional field. You become the creative director of your image, and we handle the rest. This is personalization with purpose — ensuring that what you receive reflects not just what you look like, but who you are and are becoming.",
    icon: <Camera className="h-6 w-6" />
  },
  {
    title: "Crystal-Clear Quality",
            subtitle:"4K Precision That Speaks for Itself",

    description: "Every image is delivered in high-resolution 4K, perfect for both print and digital use. Crisp, clean, and polished to perfection — so your presence is felt before you say a word.",
    icon: <Clock className="h-6 w-6" />
  },
  {
    title: "Lightning-Fast Delivery",
                subtitle:"Turnaround Measured in Minutes, Not Weeks",

    description: "Your headshots are delivered in as little as 60 minutes — with no back-and-forth or retouching delays. Because when you're ready to show up, we believe your image should be too.",
    icon: <Clock className="h-6 w-6" />
  },
  {
    title: "Full Commercial Rights",
                    subtitle:"Use Your Images Anywhere, Anytime",

    description: "Your headshots are yours to use freely — from business cards to billboards, conference decks to content creation. No extra fees. No fine print. Just freedom.",
    icon: <Shield className="h-6 w-6" />
  },
  {
    title: "Natural Results. Aligned with Your Best Self.",
    description: "Our advanced system is trained to deliver more than just photorealism — it’s designed to reflect the energy, confidence, and professionalism you bring to the table. No uncanny filters. No awkward edits. Just you, elevated.",
    icon: <Star className="h-6 w-6" />
  },
]

export default function FeaturesSection() {
  return (
    <section className="py-20 md:py-32 bg-muted/30">
      <div className="container px-4 md:px-6">
        <div className="text-center text-charcoal mb-12">
          <Badge variant="outline" className="mb-4 border-muted-gold text-charcoal">Features</Badge>
          <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl text-charcoal md:text-5xl">
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
              <p className="text-muted-foreground text-charcoal ">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}