import { Badge } from "@/components/ui/badge"
import TestimonialCard from "@/components/homepage/testimonial-card"

const testimonials = [
  {
    quote: "The quality of these AI headshots is incredible. I've updated all my professional profiles and received so many compliments.",
    author: "Sarah Johnson",
    role: "Marketing Director",
    avatarUrl: "/homepage/example0001.png"
  },
  {
    quote: "As a freelancer, having professional headshots was a game-changer for my personal brand. The process was so quick and easy!",
    author: "Michael Chen",
    role: "UX Designer",
    avatarUrl: "/homepage/example0002.png"
  },
  {
    quote: "I was skeptical at first, but the results blew me away. These look better than the professional photos I paid hundreds for.",
    author: "Mark Williams",
    role: "Software Engineer",
    avatarUrl: "/homepage/example0003.png"
  }
]

export default function TestimonialsSection() {
  return (
    <section className="py-20 md:py-32">
      <div className="container px-4 md:px-6">
        <div className="flex flex-col items-center justify-center gap-4 text-center md:gap-8">
          <Badge variant="outline" className="mb-2">
            Testimonials
          </Badge>
          <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">Words That Reflect the Transformation</h2>
          <p className="max-w-[700px] text-muted-foreground text-lg">
          Thousands of professionals have experienced what it feels like to finally see themselves in their photos — polished, powerful, and brand-ready. Here's what they’re saying:
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