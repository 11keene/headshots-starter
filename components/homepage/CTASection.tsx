"use client"

import { useState, useRef, useEffect } from "react"
import Image from "next/image"
import Link from "next/link"
import { motion, AnimatePresence } from "motion/react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"

interface Person {
  before: string
  after: string[]
}

export default function CTASection() {
  // 1️⃣ Define as many people as you like here:
  const people: Person[] = [
    {
      before: "/ken1.png",
      after: [
        "/ken2.png",
        "/ken3.png",
        "/ken4.png",
      ],
    },
    {
      before: "/lily1.png",
      after: [
        "/lily2.png",
        "/lily3.png",
        "/lily4.png",
      ],
    },
  ]

  // 2️⃣ State for which person and which after-image
  const [personIndex, setPersonIndex] = useState(0)
  const [afterIndex, setAfterIndex] = useState(0)
  const [isFlipping, setIsFlipping] = useState(false)
  const [direction, setDirection] = useState(0)
  const containerRef = useRef<HTMLDivElement>(null)
  const autoplayRef = useRef<NodeJS.Timeout | null>(null)

  // Helper:
  const current = people[personIndex]

  // 3️⃣ Next / Prev handlers that roll over both indices
  const nextSlide = () => {
    if (isFlipping) return
    setDirection(1)
    setIsFlipping(true)
    setTimeout(() => {
      if (afterIndex < current.after.length - 1) {
        setAfterIndex(i => i + 1)
      } else {
        setAfterIndex(0)
        setPersonIndex(p => (p + 1) % people.length)
      }
      setIsFlipping(false)
    }, 600)
  }
  const prevSlide = () => {
    if (isFlipping) return
    setDirection(-1)
    setIsFlipping(true)
    setTimeout(() => {
      if (afterIndex > 0) {
        setAfterIndex(i => i - 1)
      } else {
        // go back to last after-image of previous person
        setPersonIndex(p => {
          const prev = (p - 1 + people.length) % people.length
          setAfterIndex(people[prev].after.length - 1)
          return prev
        })
      }
      setIsFlipping(false)
    }, 600)
  }

  // 4️⃣ Optional: 3D hover-tilt, same as before
  useEffect(() => {
    const el = containerRef.current
    if (!el) return
    const mm = (e: MouseEvent) => {
      if (isFlipping) return
      const { left, top, width, height } = el.getBoundingClientRect()
      const x = (e.clientX - left) / width - 0.5
      const y = (e.clientY - top) / height - 0.5
      el.style.transform = `
        perspective(1000px)
        rotateY(${x * 5}deg)
        rotateX(${-y * 5}deg)
      `
    }
    const ml = () => {
      el.style.transform = "perspective(1000px) rotateY(0deg) rotateX(0deg)"
    }
    el.addEventListener("mousemove", mm)
    el.addEventListener("mouseleave", ml)
    return () => {
      el.removeEventListener("mousemove", mm)
      el.removeEventListener("mouseleave", ml)
    }
  }, [isFlipping])

  // 5️⃣ Autoplay
  useEffect(() => {
    autoplayRef.current = setInterval(() => {
      if (!isFlipping) nextSlide()
    }, 5000)
    return () => {
      if (autoplayRef.current) clearInterval(autoplayRef.current)
    }
  }, [isFlipping])

  return (
    <section className="py-20 md:py-32 bg-charcoal text-white">
      <div className="container px-4 md:px-6">
        {/* — Your existing headline & CTA */}
        <div className="flex flex-col items-center text-center gap-4 md:gap-8">
          <h2 className="text-3xl font-bold text-muted-gold sm:text-4xl md:text-5xl">
            Get your AI headshots today
          </h2>
          <p className="max-w-[700px] text-gray-300">
            Join thousands of professionals who have elevated their online presence with our AI-generated headshots.
          </p>
          <Link href="/login">
            <Button size="lg" className="bg-muted-gold hover:bg-muted-gold text-white">
              Create My Headshots Now
            </Button>
          </Link>
        </div>

        {/* — Carousel */}
        <div className="mt-16 flex justify-center">
         <div
  ref={containerRef}
  className="
    relative
    w-full
    max-w-3xl

    /* On small screens: use a 7/5 aspect ratio (700 × 500 ⇒ 7/5) so both halves fit */
    aspect-[7/5]

    /* On md (and larger): revert to your original fixed height */
    md:aspect-auto
    md:h-[550px]

    rounded-xl
    overflow-hidden
    bg-muted/30
    backdrop-blur-sm
    shadow-xl
    transition-transform
    duration-300
    ease-out
  "
  style={{ transformStyle: "preserve-3d" }}
>
            <div className="flex h-full">
              {/* BEFORE (static) */}
              <div className="w-1/2 relative">
                <div className="absolute top-2 left-2 z-10 bg-background/80 backdrop-blur-sm px-2 py-1 text-xs rounded-full">
                  Before
                </div>
                <Image
                  src={current.before}
                  alt="Before"
                  fill
                  className="object-cover"
                />
              </div>

              {/* AFTER (animated) */}
              <div className="w-1/2 relative overflow-hidden">
                <div className="absolute top-2 right-2 z-10 bg-muted-gold/70 backdrop-blur-sm px-2 py-1 text-xs rounded-full">
                  After
                </div>
                <AnimatePresence mode="wait">
                  <motion.div
                    key={`p${personIndex}-a${afterIndex}`}
                    className="h-full w-full"
                    initial={{ rotateY: direction * 90, opacity: 0 }}
                    animate={{ rotateY: 0, opacity: 1 }}
                    exit={{ rotateY: direction * -90, opacity: 0 }}
                    transition={{
                      type: "spring",
                      stiffness: 300,
                      damping: 30,
                      opacity: { duration: 0.2 },
                    }}
                    style={{ transformStyle: "preserve-3d" }}
                  >
                    <motion.div
                      initial={{ scale: 0.9 }}
                      animate={{ scale: 1 }}
                      transition={{ duration: 0.5 }}
                      className="h-full w-full"
                    >
                      <Image
                        src={current.after[afterIndex]}
                        alt="After"
                        fill
                        className="object-cover"
                      />
                    </motion.div>
                    <div className="absolute bottom-2 right-2 bg-muted-gold/70 px-3 py-1 text-xs text-white rounded-full">
                      <span className="flex items-center gap-1">
                        <span className="h-2 w-2 bg-ivory rounded-full" />
                        AI Generated
                      </span>
                    </div>
                  </motion.div>
                </AnimatePresence>
              </div>
            </div>

            {/* ◀ Prev */}
            <button
              onClick={prevSlide}
              disabled={isFlipping}
              className="absolute left-4 top-1/2 -translate-y-1/2 bg-ivory/80 p-3 rounded-full shadow-md hover:bg-white transition-all disabled:opacity-50"
            >
              <ChevronLeft className="h-6 w-6 text-charcoal" />
            </button>
            {/* Next ▶ */}
            <button
              onClick={nextSlide}
              disabled={isFlipping}
              className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/80 p-3 rounded-full shadow-md hover:bg-white transition-all disabled:opacity-50"
            >
              <ChevronRight className="h-6 w-6 text-charcoal" />
            </button>
          </div>
        </div>

        {/* — Indicators (now below) */}
        <div className="mt-4 flex justify-center gap-2">
          {current.after.map((_, idx) => (
            <button
              key={idx}
              onClick={() => {
                if (isFlipping) return
                setDirection(idx > afterIndex ? 1 : -1)
                setIsFlipping(true)
                setTimeout(() => {
                  setAfterIndex(idx)
                  setIsFlipping(false)
                }, 600)
              }}
              className={cn(
                "h-2 rounded-full transition-all",
                idx === afterIndex ? "w-8 bg-muted-gold" : "w-2 bg-gray-300"
              )}
              disabled={isFlipping}
              aria-label={`Go to slide ${idx + 1}`}
            />
          ))}
        </div>
      </div>
    </section>
  )
}
