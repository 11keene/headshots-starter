// components/IntakeForm.tsx
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";

type Option = { label: string; value: string; img: string };
type Question = {
  key: string;
  type: "images" | "multi" | "select";
  title: string;
  options: Option[];
  optional?: boolean;
};

const QUESTIONS: Question[] = [
  {
    key: "attire",
    type: "images",
    title: "What will you wear?",
    options: [
      { label: "Casual",   value: "casual",   img: "https://via.placeholder.com/300x200?text=Casual" },
      { label: "Business", value: "business", img: "https://via.placeholder.com/300x200?text=Business" },
      { label: "Creative", value: "creative", img: "https://via.placeholder.com/300x200?text=Creative" },
    ],
  },
  {
    key: "setting",
    type: "images",
    title: "Choose a setting",
    options: [
      { label: "Studio",   value: "studio",   img: "https://via.placeholder.com/300x200?text=Studio" },
      { label: "Outdoor",  value: "outdoor",  img: "https://via.placeholder.com/300x200?text=Outdoor" },
      { label: "Workspace",value: "workspace",img: "https://via.placeholder.com/300x200?text=Workspace" },
    ],
  },
  {
    key: "mood",
    type: "multi",
    title: "Select your mood",
    optional: true,
    options: [
      { label: "Friendly", value: "friendly", img: "https://via.placeholder.com/100?text=😊" },
      { label: "Serious",  value: "serious",  img: "https://via.placeholder.com/100?text=😐" },
      { label: "Playful",  value: "playful",  img: "https://via.placeholder.com/100?text=😜" },
    ],
  },
  {
    key: "useCase",
    type: "select",
    title: "What will you use these for?",
    options: [
      { label: "LinkedIn",    value: "linkedin",    img: "" },
      { label: "Website",     value: "website",     img: "" },
      { label: "Social Media",value: "social",      img: "" },
    ],
  },
];

type IntakeFormProps = {
  pack: string;
  onComplete?: () => void;
};

export default function IntakeForm({ pack, onComplete }: IntakeFormProps) {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, any>>({});

  // load
  useEffect(() => {
    const saved = localStorage.getItem(`intake-${pack}`);
        if (saved) setAnswers(JSON.parse(saved));
  }, [pack]);

  // save
  useEffect(() => {
    localStorage.setItem(`intake-${pack}`, JSON.stringify(answers));
    }, [answers, pack]);

  const question = QUESTIONS[step];

  const choose = (val: any) =>
    setAnswers((a) => ({ ...a, [question.key]: val }));

  const toggle = (val: any) => {
    const cur: any[] = answers[question.key] || [];
    const next = cur.includes(val)
      ? cur.filter((x) => x !== val)
      : [...cur, val];
    setAnswers((a) => ({ ...a, [question.key]: next }));
  };

  const next = () => {
    if (step < QUESTIONS.length - 1) {
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

  return (
    <div className="max-w-lg mx-auto p-6 space-y-6">
      {/* Progress bar */}
      <div className="w-full bg-warm-gray h-2 rounded-full overflow-hidden">
        <div
          className="h-2 bg-gradient-to-r from-sage-green to-sage-green transition-all"
          style={{ width: `${((step + 1) / QUESTIONS.length) * 100}%` }}
        />
      </div>

      {/* Question title */}
      <h2 className="text-2xl font-bold text-center">{question.title}</h2>

      {/* Options */}
      <div className="space-y-6">
        {question.type === "images" && (
          <div className="grid grid-cols-2 gap-4">
            {question.options.map((o) => (
              <motion.button
                key={o.value}
                onClick={() => choose(o.value)}
                whileHover={{ scale: 1.02 }}
                className={`border-2 rounded-lg overflow-hidden flex flex-col items-center transition-shadow ${
                  answers[question.key] === o.value
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

      {/* Navigation */}
      <div className="flex justify-between">
        <Button variant="outline" onClick={back} disabled={step === 0}>
          Back
        </Button>
        <Button onClick={next} disabled={!answers[question.key] && !question.optional}>
          {step === QUESTIONS.length - 1 ? "Submit" : "Next"}
        </Button>
      </div>
    </div>
  );
}