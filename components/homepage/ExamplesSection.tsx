import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

export default function ExamplesSection() {
  return (
    <section id="examples" className="border-t py-20 md:py-32 bg-muted/30">
      <div className="container px-4 md:px-6">
        <div className="flex flex-col items-center justify-center gap-4 text-center md:gap-8">
          <Badge variant="outline" className="mb-2 border-muted-gold text-charcoal">
            See the Results
          </Badge>
          <h2 className="text-3xl text-charcoal font-bold tracking-tighter sm:text-4xl md:text-5xl">Selfies In. Confidence Out.</h2>
          <p className="max-w-[700px] text-muted-foreground text-charcoal  text-lg">
        See how everyday selfies are transformed into purpose-driven brand images — clear, confident, and deeply aligned. This isn’t just enhancement. It’s visibility redefined, in minutes.
          </p>
        </div>
        <div className="mt-16 grid gap-4 sm:gap-6 md:gap-8 grid-cols-2 sm:grid-cols-3 lg:grid-cols-4">
          {[
   "/henry8.png",
   "/lisa7.png",
   "/adam.png",
   "/Ness4.png"
 ].map((src, i) => (
            <div
              key={i}
              className="group relative overflow-hidden rounded-lg border bg-background transition-all hover:shadow-lg"
            >
<div className="aspect-[3/4] w-full overflow-hidden">
                <div className="relative h-full w-full transition-all group-hover:scale-105">
                  <Image
                    src={src || "/placeholder.svg"}
                    alt="AI Generated Headshot"
                    fill
                    className="object-cover"
                  />
                  <div className="absolute bottom-2 right-2 rounded-full bg-muted-gold/70 px-2 py-1 text-xs text-white">
                    <span className="flex items-center gap-1">
                      <span className="h-1.5 w-1.5 rounded-full bg-ivory"></span>
                      AI Generated
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
        <div className="mt-12 flex justify-center">
          <Link href="/login">
            <Button variant="outline" size="lg">
              View More Examples
            </Button>
          </Link>
        </div>
      </div>
    </section>
  )
}