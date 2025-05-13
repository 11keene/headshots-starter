// components/IntakeForm.tsx
"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";

type Option = { label: string; value: string; img: string };
type Question = {
  key: string;
  type: "images" | "multi" | "select";
  title: string;
  multi?: boolean;
  options: Option[];
  optional?: boolean;
};

const GENDER_QUESTION: Question = {
  key: "gender",
  type: "images",
  title: "Who are we styling today?",
  options: [
    { label: "Woman", value: "female", img: "https://via.placeholder.com/300x200?text=Woman" },
    { label: "Man", value: "male", img: "https://via.placeholder.com/300x200?text=Man" }
  ]
};

const WOMEN_QUESTIONS: Question[] = [
  {
    key: "hairLength",
    type: "images",
    title: "What is your hair length?",
    options: [
      { label: "Pixie Cut", value: "pixie", img: "https://via.placeholder.com/300x200?text=Pixie+Cut" },
      { label: "Bob Cut", value: "bob", img: "https://via.placeholder.com/300x200?text=Bob+Cut" },
      { label: "Shoulder", value: "shoulder", img: "https://via.placeholder.com/300x200?text=Shoulder" },
      { label: "Past Shoulder", value: "past-shoulder", img: "https://via.placeholder.com/300x200?text=Past+Shoulder" },
      { label: "Midback", value: "midback", img: "https://via.placeholder.com/300x200?text=Midback" },
      { label: "Long", value: "long", img: "https://via.placeholder.com/300x200?text=Long" }
    ]
  },
  {
    key: "hairTexture",
    type: "images",
    title: "What is your hair texture?",
    options: [
      { label: "Straight", value: "straight", img: "https://via.placeholder.com/300x200?text=Straight" },
      { label: "Wavy", value: "wavy", img: "https://via.placeholder.com/300x200?text=Wavy" },
      { label: "Curly", value: "curly", img: "https://via.placeholder.com/300x200?text=Curly" },
      { label: "Coily", value: "coily", img: "https://via.placeholder.com/300x200?text=Coily" }
    ]
  },
  {
    key: "attire",
    type: "images",
    title: "What will you wear?",
    options: [
      { label: "Business Professional", value: "business professional", img: "" },
      { label: "Business Casual", value: "business casual", img: "" },
      { label: "Smart Casual", value: "smart casual", img: "" },
      { label: "Creative/Trendy", value: "creative", img: "" },
      { label: "Formal", value: "formal", img: "" }
    ]
  },
  {
    key: "bodyType",
    type: "images",
    title: "What is your body type?",
    options: [
      { label: "Slim", value: "slim", img: "" },
      { label: "Regular", value: "regular", img: "" },
      { label: "Curvy", value: "curvy", img: "" },
      { label: "Plus Size", value: "plus size", img: "" },
      { label: "Athletic", value: "athletic", img: "" }
    ]
  },
  {
    key: "setting",
    type: "images",
    title: "Choose a setting",
    options: [
      { label: "Studio", value: "studio", img: "" },
      { label: "Office", value: "office", img: "" },
      { label: "City", value: "city", img: "" },
      { label: "Nature", value: "nature", img: "" },
      { label: "Minimalist Indoors", value: "minimalist", img: "" }
    ]
  },
  {
    key: "mood",
    type: "multi",
    title: "Select your mood or vibe",
    options: [
      { label: "Confident", value: "confident", img: "" },
      { label: "Relaxed", value: "relaxed", img: "" },
      { label: "Bold", value: "bold", img: "" },
      { label: "Approachable", value: "approachable", img: "" },
      { label: "Empowered", value: "empowered", img: "" },
      { label: "Creative", value: "creative", img: "" }
    ]
  },
  {
    key: "brandColors",
    type: "multi",
    title: "Do you want us to subtly include your brand colors?",
    optional: true,
    options: [
      { label: "Black", value: "black", img: "" },
      { label: "White", value: "white", img: "" },
      { label: "Beige", value: "beige", img: "" },
      { label: "Blush Pink", value: "blush pink", img: "" },
      { label: "Forest Green", value: "forest green", img: "" },
      { label: "Cobalt Blue", value: "cobalt blue", img: "" },
      { label: "Gold", value: "gold", img: "" },
      { label: "Silver", value: "silver", img: "" }
    ]
  },
  {
    key: "industry",
    type: "select",
    title: "What industry or profession are you in?",
    options: [
      { label: "Marketing", value: "marketing", img: "" },
      { label: "Education", value: "education", img: "" },
      { label: "Finance", value: "finance", img: "" },
      { label: "Healthcare", value: "healthcare", img: "" },
      { label: "Technology", value: "technology", img: "" },
      { label: "Other", value: "other", img: "" }
    ]
  },
  {
    key: "photoUsage",
    type: "multi",
    title: "What will you use these for?",
    options: [
      { label: "LinkedIn", value: "linkedin", img: "" },
      { label: "Website", value: "website", img: "" },
      { label: "Speaking Profile", value: "speaking", img: "" },
      { label: "Podcast Cover", value: "podcast", img: "" },
      { label: "Press Kit", value: "press", img: "" },
      { label: "Social Media", value: "social", img: "" }
    ]
  },
  {
    key: "creativeFlair",
    type: "select",
    title: "Would you like us to include a few creative, artsy prompts in your set?",
    options: [
      { label: "Yes", value: "yes", img: "" },
      { label: "No", value: "no", img: "" }
    ]
  }
];


const MEN_QUESTIONS: Question[] = [
  {
    key: "hairLength",
    type: "images",
    title: "What is your hair length?",
    options: [
      { label: "Buzz Cut", value: "buzz", img: "" },
      { label: "Short", value: "short", img: "" },
      { label: "Medium", value: "medium", img: "" },
      { label: "Long", value: "long", img: "" }
    ]
  },
  {
    key: "attire",
    type: "images",
    title: "What will you wear?",
    multi: true,
    options: [
      { label: "Business Professional", value: "business professional", img: "" },
      { label: "Business Casual", value: "business casual", img: "" },
      { label: "Smart Casual", value: "smart casual", img: "" },
      { label: "Creative/Modern", value: "creative", img: "" },
      { label: "Formal", value: "formal", img: "" }
    ]
  },
  {
    key: "bodyType",
    type: "images",
    title: "What is your body type?",
    options: [
      { label: "Slim", value: "slim", img: "" },
      { label: "Average", value: "average", img: "" },
      { label: "Muscular", value: "muscular", img: "" },
      { label: "Stocky", value: "stocky", img: "" }
    ]
  },
  {
    key: "setting",
    type: "images",
    title: "Choose a setting",
    multi: true,
    options: [
      { label: "Studio", value: "studio", img: "" },
      { label: "Office", value: "office", img: "" },
      { label: "City", value: "city", img: "" },
      { label: "Nature", value: "nature", img: "" },
      { label: "Minimalist Indoors", value: "minimalist", img: "" }
    ]
  },
  {
    key: "mood",
    type: "multi",
    title: "Select your mood or vibe",
    multi: true,
    options: [
      { label: "Confident", value: "confident", img: "" },
      { label: "Relaxed", value: "relaxed", img: "" },
      { label: "Bold", value: "bold", img: "" },
      { label: "Approachable", value: "approachable", img: "" },
      { label: "Empowered", value: "empowered", img: "" },
      { label: "Creative", value: "creative", img: "" }
    ]
  },
  {
    key: "brandColors",
    type: "multi",
    title: "Do you want us to subtly include your brand colors?",
    multi: true,
    optional: true,
    options: [
      { label: "Black", value: "black", img: "" },
      { label: "White", value: "white", img: "" },
      { label: "Beige", value: "beige", img: "" },
      { label: "Forest Green", value: "forest green", img: "" },
      { label: "Navy Blue", value: "navy blue", img: "" },
      { label: "Charcoal Gray", value: "charcoal", img: "" },
      { label: "Silver", value: "silver", img: "" }
    ]
  },
  {
    key: "industry",
    type: "select",
    title: "What industry or profession are you in?",
    options: [
      { label: "Marketing", value: "marketing", img: "" },
      { label: "Education", value: "education", img: "" },
      { label: "Finance", value: "finance", img: "" },
      { label: "Healthcare", value: "healthcare", img: "" },
      { label: "Technology", value: "technology", img: "" },
      { label: "Other", value: "other", img: "" }
    ]
  },
  {
    key: "photoUsage",
    type: "multi",
    multi: true,
    title: "What will you use these for?",
    options: [
      { label: "LinkedIn", value: "linkedin", img: "" },
      { label: "Website", value: "website", img: "" },
      { label: "Speaking Profile", value: "speaking", img: "" },
      { label: "Podcast Cover", value: "podcast", img: "" },
      { label: "Press Kit", value: "press", img: "" },
      { label: "Social Media", value: "social", img: "" }
    ]
  },
  {
    key: "creativeFlair",
    type: "select",
    title: "Would you like us to include a few creative, artsy prompts in your set?",
    options: [
      { label: "Yes", value: "yes", img: "" },
      { label: "No", value: "no", img: "" }
    ]
  }
];


type IntakeFormProps = {
  pack: string;
  onComplete?: () => void;
};

export default function IntakeForm({ pack, onComplete }: IntakeFormProps) {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, any>>({});

  useEffect(() => {
    const saved = localStorage.getItem(`intake-${pack}`);
    if (saved) setAnswers(JSON.parse(saved));
  }, [pack]);

  useEffect(() => {
    localStorage.setItem(`intake-${pack}`, JSON.stringify(answers));
  }, [answers, pack]);

  const questionSet = useMemo(() => {
    if (!answers.gender) return [GENDER_QUESTION];
    return [GENDER_QUESTION, ...(answers.gender === "female" ? WOMEN_QUESTIONS : MEN_QUESTIONS)];
  }, [answers.gender]);

  const question = questionSet[step];

  const choose = (val: any) => {
    if (question.multi || question.type === "multi") {
      const current = answers[question.key] || [];
      const updated = current.includes(val)
        ? current.filter((v: any) => v !== val)
        : [...current, val];
      setAnswers((a) => ({ ...a, [question.key]: updated }));
    } else {
      setAnswers((a) => ({ ...a, [question.key]: val }));
    }
  };

  const next = () => {
    if (step < questionSet.length - 1) {
      setStep(step + 1);
    } else {
      if (onComplete) onComplete();
      else router.push(`/overview/packs/${pack}/upsell?tab=custom`);
    }
  };

  const back = () => {
    if (step > 0) setStep(step - 1);
    else router.back();
  };

  useEffect(() => {
    if (step > 0 && !answers.gender) setStep(0);
  }, [answers.gender, step]);

  return (
    <div className="max-w-lg mx-auto p-6 space-y-6">
      <div className="w-full bg-warm-gray h-2 rounded-full overflow-hidden">
        <div
          className="h-2 bg-gradient-to-r from-sage-green to-sage-green transition-all"
          style={{ width: `${((step + 1) / questionSet.length) * 100}%` }}
        />
      </div>

      <h2 className="text-2xl font-bold text-center">{question.title}</h2>

      <div className="space-y-6">
        {question.type === "images" && (
          <div className="grid grid-cols-2 gap-4">
            {question.options.map((o) => (
              <motion.button
                key={o.value}
                onClick={() => choose(o.value)}
                whileHover={{ scale: 1.02 }}
                className={`border-2 rounded-lg overflow-hidden flex flex-col items-center transition-shadow ${
                  (question.multi || question.type === "multi")
                    ? (answers[question.key] || []).includes(o.value)
                      ? "border-dusty-coral shadow-lg"
                      : "border-warm-gray hover:shadow-md"
                    : answers[question.key] === o.value
                    ? "border-dusty-coral shadow-lg"
                    : "border-warm-gray hover:shadow-md"
                }`}
              >
                <img src={o.img} alt={o.label} className="w-full h-32 object-cover" />
                <span className="p-2">{o.label}</span>
              </motion.button>
            ))}
          </div>
        )}

        {question.type === "multi" && (
          <div className="grid grid-cols-1 gap-3">
            {question.options.map((o) => (
              <motion.label
                key={o.value}
                className={`flex items-center gap-3 p-3 border rounded-lg cursor-pointer transition-colors ${
                  (answers[question.key] || []).includes(o.value)
                    ? "bg-dusty-coral border-dusty-coral"
                    : "border-gray-300 hover:bg-warm-gray"
                }`}
              >
                <input
                  type="checkbox"
                  checked={(answers[question.key] || []).includes(o.value)}
                  readOnly
                  aria-label={`Select ${o.label}`}
                />
                <img src={o.img} alt={o.label} className="w-10 h-10 rounded" />
                <span>{o.label}</span>
              </motion.label>
            ))}
          </div>
        )}

        {question.type === "select" && (
          <div>
            <label htmlFor={`select-${question.key}`} className="sr-only">
              {question.title}
            </label>
            <select
              id={`select-${question.key}`}
              className="w-full p-3 border rounded-lg focus:border-dusty-coral"
              value={answers[question.key] || ""}
              onChange={(e) => choose(e.target.value)}
            >
              <option value="">Choose…</option>
              {question.options.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      <div className="flex justify-between">
        <Button variant="outline" onClick={back} disabled={step === 0}>
          Back
        </Button>
        <Button onClick={next} disabled={!answers[question.key] && !question.optional}>
          {step === questionSet.length - 1 ? "Submit" : "Next"}
        </Button>
      </div>
    </div>
  );
}
