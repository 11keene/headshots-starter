"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "motion/react"
import { ChevronDown } from "lucide-react"

interface FAQItemProps {
  question: string
  answer: string
  isOpen: boolean
  onClick: () => void
  index: number
}

function FAQItem({ question, answer, isOpen, onClick, index }: FAQItemProps) {
  return (
    <motion.div
      className="border-b last:border-b-0"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.1 }}
    >
      <button
        onClick={onClick}
        className="flex w-full items-center justify-between py-4 text-left font-medium transition-all hover:text-primary"
      >
        <span>{question}</span>
        <ChevronDown className={`h-5 w-5 transition-transform ${isOpen ? "rotate-180" : ""}`} />
      </button>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            <div className="pb-4 text-muted-foreground">{answer}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

export default function FAQSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(0)

  const faqs = [
    {
      question: "How does AI headshot generation work?",
      answer:
        "Once you upload your selfies and complete the intake form, our AI gets to work — analyzing your features, style preferences, and professional goals. We then create 45 hyper-realistic, high-quality headshots all tailored to your wardrobe, setting, industry, and brand vision. The entire process takes under 60 minutes from start to finish.",
    },
    {
      question: "What kind of photos should I upload?",
      answer:
        "We recommend 4+ clear, front-facing selfies with good lighting. Photos should be front-facing with only one person in the frame. Avoid wearing glasses or hats. Images with no filters work best. Try to capture different expressions and angles for more variety in your results. The better quality your images are, the better your features and results will be.",
    },
    {
      question: "Can I use these headshots professionally?",
      answer:
        "Absolutely. Every headshot comes with full commercial rights — so you can use your images on LinkedIn, websites, resumes, speaker decks, social media, and beyond. No extra licensing fees, ever.",
    },
    {
      question: "How many different styles can I get?",
      answer:
        "You’ll receive a curated set of 15 distinct image styles based on your intake responses. These vary by setting, wardrobe, lighting, and emotional tone — all crafted to reflect different facets of your professional identity. It’s one shoot, designed to tell your full story.",
    },
    {
      question: "What if I'm not satisfied with the results?",
      answer:
        "We strive for excellence in every image. If you’re not satisfied, we offer one complimentary re-render — where you can update or refine your intake answers. Our goal is to make sure you feel proud of how you show up. Please email us at support@aimavenstudio.com within 7 days of delivery to request a re-render. We do NOT offer refunds.",
    },
    {
      question: "How quickly will I receive my headshots?",
      answer:
        "Your final headshots are delivered in under an hour — after payment. It’s fast, efficient, and built for modern professionals who don’t have time to wait weeks for transformation.",
    },
  ]

  return (
    <div className="w-full max-w-3xl mx-auto">
      {faqs.map((faq, index) => (
        <FAQItem
          key={index}
          question={faq.question}
          answer={faq.answer}
          isOpen={openIndex === index}
          onClick={() => setOpenIndex(openIndex === index ? null : index)}
          index={index}
        />
      ))}
    </div>
  )
}

