"use client"

import { useState, useRef, useEffect } from "react"
import Image from "next/image"
import { motion, AnimatePresence } from "motion/react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { cn } from "@/lib/utils"

interface Person {
  before: string
  after: string[]
  label: string
}

export default function ThreeDBeforeAfterGallery() {
  const [personIndex, setPersonIndex] = useState(0)
  const [afterIndex, setAfterIndex] = useState(0)
  const [isFlipping, setIsFlipping] = useState(false)
  const [direction, setDirection] = useState(0)
  const containerRef = useRef<HTMLDivElement>(null)
  const autoplayRef = useRef<NodeJS.Timeout | null>(null)

  const people: Person[] = [
    {
      before: "/henry4.png",
      after: ["/henry2.png", "/henry3.png", "/henry1.png"],
      label: "Dynamic",
    },
    {
      before: "/lisa1.png",
      after: ["/lisa2.png", "/lisa3.png", "/lisa4.png"],
      label: "Personalized",
    },
  ]

  const nextSlide = () => {
    if (isFlipping) return
    setDirection(1)
    setIsFlipping(true)
    setTimeout(() => {
      const cur = people[personIndex]
      if (afterIndex < cur.after.length - 1) {
        setAfterIndex((i) => i + 1)
      } else {
        setAfterIndex(0)
        setPersonIndex((p) => (p + 1) % people.length)
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
        setAfterIndex((i) => i - 1)
      } else {
        setPersonIndex((p) => {
          const prev = (p - 1 + people.length) % people.length
          setAfterIndex(people[prev].after.length - 1)
          return prev
        })
      }
      setIsFlipping(false)
    }, 600)
  }

  // 3D hover effect
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!containerRef.current || isFlipping) return
      const { left, top, width, height } = containerRef.current.getBoundingClientRect()
      const x = (e.clientX - left) / width - 0.5
      const y = (e.clientY - top) / height - 0.5
      containerRef.current.style.transform = `
        perspective(1000px)
        rotateY(${x * 5}deg)
        rotateX(${-y * 5}deg)
      `
    }
    const handleMouseLeave = () => {
      if (containerRef.current) {
        containerRef.current.style.transform = `
          perspective(1000px)
          rotateY(0deg)
          rotateX(0deg)
        `
      }
    }
    const el = containerRef.current
    el?.addEventListener("mousemove", handleMouseMove)
    el?.addEventListener("mouseleave", handleMouseLeave)
    return () => {
      el?.removeEventListener("mousemove", handleMouseMove)
      el?.removeEventListener("mouseleave", handleMouseLeave)
    }
  }, [isFlipping])

  // Autoplay
  useEffect(() => {
    autoplayRef.current = setInterval(() => {
      if (!isFlipping) nextSlide()
    }, 5000)
    return () => {
      if (autoplayRef.current) clearInterval(autoplayRef.current)
    }
  }, [isFlipping])

  const current = people[personIndex]

  return (
    <div className="relative mx-auto max-w-4xl py-10">
      <div
        ref={containerRef}
        className="
          relative
          w-full

          /* === MOBILE: shrink by aspect ratio 7/5 (700×500 ⇒ 7/5) === */
          aspect-[7/5]

          /* === DESKTOP (md+): go back to fixed height 550px === */
          md:aspect-auto
          md:h-[550px]

          transition-transform
          duration-300
          ease-out
        "
        style={{ transformStyle: "preserve-3d" }}
      >
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="relative w-full max-w-3xl">
            <div
              className="
                relative
                flex

                /* === MOBILE: inner gallery uses same 7/5 ratio to avoid clipping === */
                aspect-[7/5]

                /* === DESKTOP (md+): fixed 550px height === */
                md:aspect-auto
                md:h-[550px]

                rounded-xl
                bg-muted/30
                backdrop-blur-sm
                shadow-xl
                overflow-hidden
              "
            >
              {/* BEFORE (static!) */}
              <div className="w-1/2 relative">
                <div className="absolute top-2 left-2 z-10 bg-background/80 backdrop-blur-sm text-xs px-2 py-1 rounded-full">
                  Before
                </div>
                <div className="h-full w-full overflow-hidden">
                  <Image
                    src={current.before}
                    alt={`Before ${current.label}`}
                    fill
                    className="object-cover"
                  />
                </div>
              </div>

              {/* AFTER (animated only) */}
              <div className="w-1/2 relative overflow-hidden">
                <div className="absolute top-2 right-2 z-10 bg-muted-gold/70 text-primary-foreground backdrop-blur-sm text-xs px-2 py-1 rounded-full">
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
                        alt={`After ${current.label}`}
                        fill
                        className="object-cover"
                      />
                    </motion.div>
                    <div className="absolute bottom-2 right-2 rounded-full bg-muted-gold/70 px-3 py-1 text-xs text-white">
                      <span className="flex items-center gap-1">
                        <span className="h-2 w-2 rounded-full bg-ivory"></span>
                        AI Generated
                      </span>
                    </div>
                  </motion.div>
                </AnimatePresence>
              </div>
            </div>

          </div>
        </div>
      </div>

      {/* NAV BUTTONS */}
      <button
        onClick={prevSlide}
        className="absolute left-4 top-1/2 -translate-y-1/2 rounded-full bg-ivory/80 p-3 shadow-md hover:bg-white transition-all hover:scale-110"
        aria-label="Previous"
        disabled={isFlipping}
      >
        <ChevronLeft className={cn("h-6 w-6", isFlipping && "opacity-50")} />
      </button>
      <button
        onClick={nextSlide}
        className="absolute right-4 top-1/2 -translate-y-1/2 rounded-full bg-white/80 p-3 shadow-md hover:bg-white transition-all hover:scale-110"
        aria-label="Next"
        disabled={isFlipping}
      >
        <ChevronRight className={cn("h-6 w-6", isFlipping && "opacity-50")} />
      </button>

      {/* INDICATORS */}
      <div className="mt-8 flex justify-center gap-2">
        {people[personIndex].after.map((_, idx) => (
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
            className={`
              h-2
              transition-all
              ${idx === afterIndex ? "w-8 bg-muted-gold" : "w-2 bg-gray-300"}
              rounded-full
            `}
            disabled={isFlipping}
            aria-label={`Go to after frame ${idx + 1}`}
          />
        ))}
      </div>
    </div>
  )
}
