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
  // …your same questions…
];

type IntakeFormProps = {
  pack: string;
  onComplete?: () => void;
};

export default function IntakeForm({
  pack,
  onComplete,
}: IntakeFormProps) {
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
      return setStep(step + 1);
    }
    // final:
    if (onComplete) {
      onComplete();
    } else {
      // default: back to upsell on custom tab
      router.push(`/overview/packs/${pack}/upsell?tab=custom`);
    }
  };

  const back = () => {
    if (step > 0) setStep(step - 1);
    else router.back();
  };

  return (
    <div className="max-w-xl mx-auto p-6 space-y-6">
      {/* progress bar */}
      <div className="w-full bg-gray-200 h-2 rounded-full overflow-hidden">
        <div
          className="h-2 bg-gradient-to-r from-orange-500 to-red-600 transition-width"
          style={{ width: `${((step + 1) / QUESTIONS.length) * 100}%` }}
        />
      </div>

      {/* question */}
      <h2 className="text-2xl font-bold text-center text-gray-800">
        {question.title}
      </h2>

      {/* options… same as you had with framer-motion buttons */}

      {/* nav */}
      <div className="flex justify-between">
        <Button variant="outline" onClick={back}>
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
