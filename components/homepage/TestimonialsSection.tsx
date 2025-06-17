import { Badge } from "@/components/ui/badge"
import TestimonialCard from "@/components/homepage/testimonial-card"

const testimonials = [
  {
    quote: "Wow—these are amazing. The level of detail and professionalism blew me away!",
    author: "Daniel Morgan",
    role: "Operations Manager",
    avatarUrl: "/Daniel1.png"
  },
  {
    quote: "The process was seamless and the results are absolutely stunning—I’ve never felt more confident sharing my headshot!",
    author: "Olivia Martinez",
    role: "Marketing Strategist",
    avatarUrl: "/Olivia2.png"
  },
  {
    quote: "The results gave me chills. Seeing myself in this light is so inspirational and motivating!",
    author: "Emily Wong",
    role: "Nurse Practitioner",
    avatarUrl: "/emily2.png"
  }
]

export default function TestimonialsSection() {
  return (
    <section className="py-20 md:py-32">
      <div className="container px-4 md:px-6">
        <div className="flex flex-col items-center justify-center gap-4 text-center md:gap-8">
          <Badge variant="outline" className="mb-2 border-muted-gold text-charcoal">
            Testimonials
          </Badge>
          <h2 className="text-3xl font-bold tracking-tighter text-charcoal sm:text-4xl md:text-5xl">Transformation You Can See — and Feel
</h2>
          <p className="max-w-[700px] text-muted-foreground text-charcoal text-lg">
         Thousands of professionals have discovered what it means to be truly seen. These aren’t just headshots — they’re identity-shaping images that reflect your growth, your confidence, and the clarity of who you’re becoming. Here’s how that transformation is showing up in real lives.
          </p>
        </div>
        <div className="mt-16 grid gap-8 md:grid-cols-3">
          {testimonials.map((testimonial, index) => (
            <TestimonialCard
              key={index}
              {...testimonial}
            />
          ))}
        </div>
      </div>
    </section>
  )
}
