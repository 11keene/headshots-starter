// components/IntakeForm.tsx
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

type Option = { label: string; value: string; img?: string };
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
      { label: "Casual", value: "casual", img: "/images/attire-casual.jpg" },
      { label: "Business", value: "business", img: "/images/attire-business.jpg" },
      { label: "Creative", value: "creative", img: "/images/attire-creative.jpg" },
    ],
  },
  {
    key: "setting",
    type: "images",
    title: "Choose a setting",
    options: [
      { label: "Studio", value: "studio", img: "/images/setting-studio.jpg" },
      { label: "Outdoor", value: "outdoor", img: "/images/setting-outdoor.jpg" },
      { label: "Workspace", value: "workspace", img: "/images/setting-workspace.jpg" },
    ],
  },
  {
    key: "mood",
    type: "multi",
    title: "Select your mood",
    options: [
      { label: "Friendly", value: "friendly" },
      { label: "Serious", value: "serious" },
      { label: "Playful", value: "playful" },
    ],
    optional: true,
  },
  {
    key: "useCase",
    type: "select",
    title: "What will you use these for?",
    options: [
      { label: "LinkedIn", value: "linkedin" },
      { label: "Website", value: "website" },
      { label: "Social Media", value: "social" },
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

  // Load saved answers if user reloads
  useEffect(() => {
    const saved = localStorage.getItem(`intake-${pack}`);
    if (saved) {
      setAnswers(JSON.parse(saved));
    }
  }, [pack]);

  // Save answers on every change
  useEffect(() => {
    localStorage.setItem(`intake-${pack}`, JSON.stringify(answers));
  }, [answers, pack]);

  const question = QUESTIONS[step];

  function choose(val: any) {
    setAnswers((a) => ({ ...a, [question.key]: val }));
  }

  function toggle(val: any) {
    const cur: any[] = answers[question.key] || [];
    const next = cur.includes(val)
      ? cur.filter((x) => x !== val)
      : [...cur, val];
    setAnswers((a) => ({ ...a, [question.key]: next }));
  }

  function next() {
    if (step < QUESTIONS.length - 1) {
      setStep(step + 1);
    } else {
      if (onComplete) {
        onComplete();
      } else {
 // after a pure "Custom Photoshoot" flow (no onComplete passed),
// send them into the headshot upsell, explicitly showing the headshot tab
router.push(`/overview/packs/${pack}/upsell?tab=headshot`);
      }
    }
  }

  function back() {
    if (step > 0) setStep(step - 1);
  }

  return (
    <div>
      <progress
        className="w-full mb-4"
        value={step + 1}
        max={QUESTIONS.length}
      />
      <h2 className="text-lg font-semibold mb-2">{question.title}</h2>

      <div className="mb-6">
        {question.type === "images" && (
          <div className="grid grid-cols-2 gap-4">
            {question.options.map((o) => (
              <button
                key={o.value}
                onClick={() => choose(o.value)}
                className={`p-2 border rounded ${
                  answers[question.key] === o.value
                    ? "border-red-600"
                    : "border-gray-300"
                }`}
              >
                <img
                  src={o.img}
                  alt={o.label}
                  className="w-full h-24 object-cover rounded mb-1"
                />
                {o.label}
              </button>
            ))}
          </div>
        )}

        {question.type === "multi" && (
          <div className="flex flex-col gap-2">
            {question.options.map((o) => (
              <label key={o.value} className="inline-flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={(answers[question.key] || []).includes(o.value)}
                  onChange={() => toggle(o.value)}
                />
                {o.label}
              </label>
            ))}
          </div>
        )}

        {question.type === "select" && (
          <select
            className="w-full border rounded p-2"
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
        )}
      </div>

      <div className="flex justify-between">
        <Button onClick={back} disabled={step === 0} variant="outline">
          Back
        </Button>
        <Button
          onClick={next}
          disabled={!answers[question.key] && !question.optional}
        >
          {step === QUESTIONS.length - 1 ? "Submit" : "Next"}
        </Button>
      </div>
    </div>
  );
}
