// components/IntakeForm.tsx
"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { useSearchParams } from "next/navigation";
import { Cloud } from "lucide-react";

type Option = { label: string; value: string; img: string; color?: string };
type Question = {
  key: string;
  type: "images" | "multi" | "select";
  title: string;
  subtitle?: string; 
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
      { label: "Pixie Cut", value: "pixie", img: "/pixiecut.png" },
      { label: "Bob Cut", value: "bob", img: "/bobcut.png" },
      { label: "Shoulder", value: "shoulder", img: "/shoulder.png" },
      { label: "Past Shoulder", value: "past-shoulder", img: "/pastshoulder.png" },
      { label: "Midback", value: "midback", img: "/midback.png" },
      { label: "Long", value: "long", img: "/longg.png" }
    ]
  },
  {
    key: "hairTexture",
    type: "images",
    title: "What is your hair texture?",
    options: [
      { label: "Straight", value: "straight", img: "/straight.png" },
      { label: "Wavy", value: "wavy", img: "/wavy.png" },
      { label: "Curly", value: "curly", img: "/curly.png" },
      { label: "Coily", value: "coily", img: "/coily.png" },
      { label: "Dreadlocks", value: "dreadlocks", img: "https://via.placeholder.com/300x200?text=Curly" },

    ]
  },
  {
    key: "attire",
    type: "images",
    multi: true,
    title: "What will you wear?",
    subtitle: "You can select more than one option.",
    options: [
      { label: "Business Professional", value: "business professional", img: "/Businessprofessional.png" },
      { label: "Business Casual", value: "business casual", img: "/BusinessCasual.png" },
      { label: "Smart Casual", value: "smart casual", img: "/smartcasual.png" },
      { label: "Creative/Trendy", value: "creative", img: "/creativetrendy.png" },
      { label: "Formal", value: "formal", img: "/formal.png" }
    ]
  },
  {
    key: "bodyType",
    type: "images",
    title: "What is your body type?",
    options: [
      { label: "Slim", value: "slim", img: "" },
      { label: "Athletic", value: "athletic", img: "" },
      { label: "Curvy", value: "curvy", img: "" },
      { label: "Full-figured", value: "full figured", img: "" },
      { label: "Plus Size", value: "plus size", img: "" },
      
    ]
  },
  {
    key: "setting",
    type: "images",
    multi: true,
    title: "Choose a setting",
    subtitle: "You can select more than one option.",
    options: [
      { label: "Studio", value: "studio", img: "studio.png" },
      { label: "Office", value: "office", img: "office.png" },
      { label: "City", value: "city", img: "city.png" },
      { label: "Nature", value: "nature", img: "nature.png" },
      { label: "Minimalist Indoors", value: "minimalist", img: "minimalisticindoors.png" }
    ]
  },
  {
    key: "mood",
    type: "multi",
    multi: true,
    title: "Select your mood or vibe",
    subtitle: "You can select more than one option.",
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
    multi: true,
    title: "Do you want us to subtly include your brand colors?",
    subtitle: "You can select more than one option.",
    optional: true,
    options: [
      { label: "Black", value: "black", img: "" },
      { label: "White", value: "white", img: "" },
      { label: "Beige", value: "beige", img: "" },
      { label: "Blush Pink", value: "blush pink", img: "" },
      { label: "Forest Green", value: "forest green", img: "" },
      { label: "Red", value: "red", img: "" },
      { label: "Cobalt Blue", value: "cobalt blue", img: "" },
      { label: "Orange", value: "orange", img: "" },
      { label: "Gold", value: "gold", img: "" },
      { label: "Silver", value: "silver", img: "" },
      { label: "Other", value: "other", img: "" }
    ]
  },
  {
    key: "industry",
    type: "multi",
    multi: true, 
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
    subtitle: "You can select more than one option.",
    options: [
      { label: "LinkedIn", value: "linkedin", img: "" },
      { label: "Website", value: "website", img: "" },
      { label: "Speaking Profile", value: "speaking", img: "" },
      { label: "Podcast Cover", value: "podcast", img: "" },
      { label: "Press Kit", value: "press", img: "" },
      { label: "Social Media", value: "social", img: "" }
    ]
  },

];


const MEN_QUESTIONS: Question[] = [
  {
    key: "hairLength",
    type: "images",
    title: "What is your hair length?",
    options: [
      { label: "Bald", value: "bald", img: "bald.png" },
      { label: "Buzz Cut", value: "buzz", img: "buzzcut.png" },
      { label: "Short", value: "short", img: "short.png" },
      { label: "Medium", value: "medium", img: "mediumlength.png" },
      { label: "Long", value: "long", img: "longhair.png" }
    ]
  },
  {
    key: "attire",
    type: "images",
    title: "What will you wear?",
    subtitle: "You can select more than one option.",
    multi: true,
    options: [
      { label: "Business Professional", value: "business professional", img: "businessprofessionalm.png" },
      { label: "Business Casual", value: "business casual", img: "businesscasualm.png" },
      { label: "Smart Casual", value: "smart casual", img: "smartcasualm.png" },
      { label: "Creative/Modern", value: "creative", img: "creativetrendym.png" },
      { label: "Formal", value: "formal", img: "formalm.png" }
    ]
  },
  {
    key: "bodyType",
    type: "images",
    title: "What is your body type?",
    options: [
      { label: "Slim", value: "slim", img: "" },
      { label: "Average", value: "average", img: "" },
      { label: "Athletic", value: "athletic", img: "" },
      { label: "Muscular", value: "muscular", img: "" },
      { label: "Medium Large", value: "muedium large", img: "" },
      { label: "Large", value: "large", img: "" },
      { label: "Plus Size", value: "plus size", img: "" }
    ]
  },
  {
    key: "setting",
    type: "images",
    title: "Choose a setting",
    subtitle: "You can select more than one option.",
    multi: true,
    options: [
      { label: "Studio", value: "studio", img: "studiom.png" },
      { label: "Office", value: "office", img: "officem.png" },
      { label: "City", value: "city", img: "citym.png" },
      { label: "Nature", value: "nature", img: "naturem.png" },
      { label: "Minimalist Indoors", value: "minimalist", img: "minimalisticindoorsm.png" }
    ]
  },
  {
    key: "mood",
    type: "multi",
    title: "Select your mood or vibe",
    subtitle: "You can select more than one option.",
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
    subtitle: "You can select more than one option.",
    multi: true,
    optional: true,
    options: [
      { label: "Black", value: "black", img: "" },
      { label: "White", value: "white", img: ""},
      { label: "Beige", value: "beige", img: ""},
      { label: "Forest Green", value: "forest green", img: ""},
      { label: "Navy Blue", value: "navy blue", img: ""},
      { label: "Cobalt Blue", value: "cobalt blue", img: ""},
      { label: "Gold", value: "gold", img: ""},
      { label: "Red", value: "red", img: ""},
      { label: "Silver", value: "silver", img: ""},
      { label: "Other", value: "other", img: "" }

      
    ]
  },
  {
    key: "industry",
    type: "multi",
    multi: true, 
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
    subtitle: "You can select more than one option.",
    options: [
      { label: "LinkedIn", value: "linkedin", img: "" },
      { label: "Website", value: "website", img: "" },
      { label: "Speaking Profile", value: "speaking", img: "" },
      { label: "Podcast Cover", value: "podcast", img: "" },
      { label: "Press Kit", value: "press", img: "" },
      { label: "Social Media", value: "social", img: "" }
    ]
  },

];


type IntakeFormProps = {
  pack: string;
  onComplete?: () => void;
};

export default function IntakeForm({ pack, onComplete }: IntakeFormProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const rawGender = searchParams?.get("gender") || "woman";
  const gender = rawGender === "man" || rawGender === "male" ? "male" : "female";

  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, any>>({});

  useEffect(() => {
    const saved = localStorage.getItem(`intake-${pack}`);
    if (saved) setAnswers(JSON.parse(saved));
  }, [pack]);

  useEffect(() => {
    localStorage.setItem(`intake-${pack}`, JSON.stringify(answers));
  }, [answers, pack]);

  const questionSet = useMemo(
    () => (gender === "female" ? WOMEN_QUESTIONS : MEN_QUESTIONS),
    [gender]
  );
  const question = questionSet[step];

  const choose = (val: any) => {
    if (question.multi) {
      const current = answers[question.key] || [];
      const updated = current.includes(val)
        ? current.filter((v: any) => v !== val)
        : [...current, val];
      setAnswers((a) => ({ ...a, [question.key]: updated }));
    } else {
      setAnswers((a) => ({ ...a, [question.key]: val }));
      setTimeout(next, 300);
    }
  };

  const next = () => {
    if (step < questionSet.length - 1) {
      setStep(step + 1);
    } else {
      onComplete
        ? onComplete()
        : router.push(`/overview/packs/${pack}/next?gender=${gender}`);
    }
  };

  const back = () => {
    if (step > 0) setStep(step - 1);
    else router.back();
  };

  return (
    <div className="relative min-h-screen max-w-lg mx-auto pt-20 pb-24 px-6 text-white">
      {/* 1️⃣ BACK BUTTON fixed top-left */}
      <div className="absolute top-4 left-1">
      <Button
  onClick={back}
  className="bg-warm-gray text-white hover:bg-warm-gray"
>
  Back
</Button>

      </div>

      {/* 2️⃣ STEP CIRCLE */}
      <div className="flex justify-center mb-4">
        <div className="w-8 h-8 rounded-full bg-muted-gold flex text-white items-center justify-center text-sm font-medium">
          {step + 1}
        </div>
      </div>

      {/* 3️⃣ PROGRESS BAR */}
      <div className="w-full bg-white h-2 rounded-full overflow-hidden mb-6">
        <div
          className="h-2 bg-gradient-to-r from-sage-green to-sage-green transition-all"
          style={{ width: `${((step + 1) / questionSet.length) * 100}%` }}
        />
      </div>

      {/* 4️⃣ QUESTION TITLE & SUBTITLE */}
      <h2 className="text-2xl font-bold text-center mb-2">{question.title}</h2>
      {question.subtitle && (
        <p className="text-center text-sm mb-6">{question.subtitle}</p>
      )}

      {/* 5️⃣ OPTIONS */}
      <div className="mt-6 space-y-6">
        {question.type === "images" && (
          <div className="grid grid-cols-2 gap-4">
   {question.options.map((o) => (
  <motion.button
    key={o.value}
    onClick={() => choose(o.value)}
    whileHover={{ scale: 1.02 }}
    className={`border-2 bg-warm-gray rounded-lg overflow-hidden flex flex-col transition-shadow ${
      question.multi
        ? (answers[question.key] || []).includes(o.value)
          ? "border-muted-gold shadow-lg"
          : "border-warm-gray hover:shadow-md"
        : answers[question.key] === o.value
        ? "border-muted-gold shadow-lg"
        : "border-warm-gray hover:shadow-md"
    }`}
  >
    {/* IMAGE AREA */}
    <div className="relative w-full aspect-[3/4.5] bg-warm-gray">
      <img
        src={o.img}
        alt={o.label}
        className="absolute inset-0 w-full h-full object-cover object-center"
      />
    </div>

    {/* LABEL FOOTER */}
    <div className="bg-muted-gold py-2 text-center">
      <span className="font-semibold text-ivory">{o.label}</span>
    </div>
  </motion.button>
))}


          </div>
        )}

{question.type === "multi" && question.multi && (
  <div className="flex flex-col space-y-4">
    {question.options.map((o) => {
      const isSelected = (answers[question.key] || []).includes(o.value);

      // map each value to a real CSS colour
      const colorMap: Record<string,string> = {
        black:          "#000000",
        white:          "#FFFFFF",
        beige:          "#F5F5DC",
        "blush pink":   "#FFC0CB",
        "forest green": "#228B22",
        "navy blue":    "#000080",
        charcoal:       "#36454F",
        red:            "#FF0000",
        "cobalt blue":  "#0047AB",
        orange:         "#FFA500",
        gold:           "#FFD700",
        silver:         "#C0C0C0",
       
      };
      
      const circleColor = colorMap[o.value.toLowerCase()] || "transparent";

      // detect brandColors → other
      const isBrandColorsOther =
        question.key === "brandColors" &&
        o.value.toLowerCase() === "other";

      // conic-gradient for brandColors.other
      const gradient = `conic-gradient(
        #000000 0% 11%,
        #FFFFFF 11% 22%,
        #F5F5DC 22% 33%,
        #FFC0CB 33% 44%,
        #228B22 44% 55%,
        #0047AB 55% 66%,
        #FFA500 66% 77%,
        #FFD700 77% 88%,
        #C0C0C0 88% 100%
      )`;

      return (
        <motion.button
          key={o.value}
          onClick={() => {
            choose(o.value);
            // for the industry question (one-click advance)
            if (question.key === "industry") next();
          }}
          whileHover={{ scale: 1.02 }}
          className={`
            w-full
            border-2 bg-warm-gray text-white rounded-lg flex items-center justify-between p-4 transition-shadow
            ${isSelected
              ? "border-muted-gold shadow-lg"
              : "border-warm-gray hover:shadow-md"}
          `}
        >
          {/* left colour dot */}
          <span
            className="w-4 h-4 rounded-full flex-shrink-0"
            style={
              isBrandColorsOther
                ? { background: gradient }
                : { backgroundColor: circleColor }
            }
          />

          {/* label */}
          <span className="flex-1 text-center">{o.label}</span>

          {/* right selected indicator */}
          <span
            className={`
              w-4 h-4 rounded-full flex-shrink-0
              ${isSelected
                ? "bg-muted-gold"
                : "border-2 border-warm-gray"}
            `}
          />
        </motion.button>
      );
    })}
  </div>
)}

        {question.type === "select" && (
          <select
            id={`select-${question.key}`}
            className="w-full p-3 border rounded-lg focus:border-muted-gold"
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

      {/* 6️⃣ CONTINUE BUTTON fixed bottom */}
      {/* 6️⃣ CONTINUE BUTTON as a fixed footer bar */}
<div className="fixed bottom-0 left-0 w-full flex items-center bg-charcoal border-t py-4 px-6">
  <Button
    onClick={next}
    disabled={!answers[question.key] && !question.optional}
    className="w-full md:w-1/3 md:mx-auto bg-muted-gold text-white"
  >
    {step === questionSet.length - 1 ? "Submit" : "Next"}
  </Button>
</div>

    </div>
  );
}
