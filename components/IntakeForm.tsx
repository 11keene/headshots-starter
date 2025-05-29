// components/IntakeForm.tsx
"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { useSearchParams } from "next/navigation";
import { Cloud, ArrowLeftIcon } from "lucide-react";
import { FaMars, FaVenus, FaTransgender } from "react-icons/fa";
import Image from "next/image";

type Option = { label: string; value: string; img: string; color?: string };
type Question = {
  key: string;
  type: "images" | "multi" | "select" | "text";
  title: string;
  subtitle?: string;
  multi?: boolean;
  options: Option[];
  optional?: boolean;
};

const WOMEN_QUESTIONS: Question[] = [
  {
    key: "gender",
    type: "multi",
    multi: true,
    title: "What is your gender?",
    subtitle:
      "We want to learn more about you so we can deliver the perfect images that reflects exactly who you are!",
    optional: true,
    options: [
      { label: "Man", value: "man", img: "" },
      { label: "Woman", value: "woman", img: "" },
      { label: "Non Binary", value: "non binary", img: "" },
    ],
  },

  {
    key: "age",
    type: "multi",
    multi: true,
    title: "What is your age?",
    subtitle: "Our service is intended for adults only. We do not provide services to individuals under the age of 18.",
    optional: true,
    options: [
      { label: "18-20", value: "18-20", img: "" },
      { label: "21-24", value: "21-24", img: "" },
      { label: "25-29", value: "25-29", img: "" },
      { label: "30-40", value: "30-40", img: "" },
      { label: "41-50", value: "41-50", img: "" },
      { label: "51-65", value: "51-65", img: "" },
      { label: "65+", value: "65+", img: "" },
    
    ]
  },
  
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
      { label: "Long", value: "long", img: "/longg.png" },
      { label: "Dreads", value: "dreads", img: "/dreads.png" },

    ]
  },


  {
    key: "hairTexture",
    type: "images",
    title: "What is your hair texture?",
    options: [
      { label: "Straight", value: "straight", img: "/Straight.png" },
      { label: "Wavy", value: "wavy", img: "/wavy.png" },
      { label: "Curly", value: "curly", img: "/curly.png" },
      { label: "Coily", value: "coily", img: "/coily.png" },

    ]
  },
  {
    key: "bodyType",
    type: "images",
    title: "What is your body type?",
    options: [
      { label: "Slim", value: "slim", img: "/Slimwoman.png" },
      { label: "Athletic", value: "athletic", img: "/athleticwoman.png" },
      { label: "Average", value: "average", img: "/averagewoman.png" },
      { label: "Curvy", value: "curvy", img: "/curvywoman.png" },
      { label: "Plus Size", value: "plus size", img: "/plussize.png" },
      
    ]
  },
  {
    key: "attire",
    type: "images",
    multi: true,
    title: "What will you wear in your photos?",
    subtitle: "You can select more than one option.",
    options: [
      { label: "Blazer or Suit Jacket", value: "blazer or suit jacket", img: "/blazer.png" },
      { label: "Casual Everyday Outfit", value: "casual everyday outfit", img: "/casualwoman.png" },
      { label: "Bold Fashion Statement", value: "bold fashion statement", img: "/Boldfashionwoman.png" },
      { label: "Dress or Skirt", value: "dress or skirt", img: "/dressorskirt.png" },
      { label: "Athleisure or Fitness Wear", value: "athleisure or fitness wear", img: "/athleisurewoman.png" },
      { label: "Professional Uniform", value: "professional uniform", img: "/professionalnurselady.png" }



    ]
  },
  
  {
    key: "setting",
    type: "images",
    multi: true,
    title: "What is your preferred setting? ",
    subtitle: "You can select more than one option.",
    options: [
      { label: "Cozy Indoor Space", value: "cozy inddor space", img: "/Cozyindoor.png" },
      { label: "Natural Outdoor", value: "natural outdoor", img: "/naturaloutdoor.png" },
      { label: "Office", value: "office", img: "/Womanoffice.png" },
      { label: "Studio", value: "studio", img: "/Womanstudio.png" },
      { label: "Urban", value: "urban", img: "/Womanurban.png" },
      { label: "Conceptual", value: "conceptual", img: "/Conceptualwoman.png" }
      
    ]
  },
  {
    key: "mood",
    type: "multi",
    multi: true,
    title: "Select your mood or vibe",
    subtitle: "You can select more than one option.",
    options: [
      { label: "Approachable", value: "approachable", img: "" },
      { label: "Bold", value: "bold", img: "" },
      { label: "Warm", value: "warm", img: "" },
      { label: "Creative", value: "creative", img: "" },
      { label: "Peaceful", value: "peaceful", img: "" },
      { label: "Joyful", value: "joyful", img: "" },
      { label: "Mysterious", value: "mysterious", img: "" },
      { label: "Focused", value: "focused", img: "" },
      { label: "Fun", value: "fun", img: "" }

    ]
  },
  {
    key: "brandColors",
    type: "multi",
    multi: true,
    title: "Do you have brand colors you'd like subtly included in your shoot?",
    subtitle: "You can select more than one option. (Optional)",
    optional: true,
    options: [
      { label: "Black", value: "black", img: "" },
      { label: "White", value: "white", img: "/swatches/white.png" },
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
    key: "avoid",
    type: "text",           // new text-entry question
    title: "Anything to avoid?",
    subtitle:
      "Let us know any colors, styles, or props you’d like us to steer clear of. (Optional)",
    optional: true,
    options: [],            // ← satisfy the Question type
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

  {
    key: "personalized",
    type: "text",           // new text-entry question
    title: "Is there anything else you'd like us to know to help personalize your images? ",
    subtitle: "(Optional)",

    optional: true,
    options: [],            // ← satisfy the Question type
  },

];


const MEN_QUESTIONS: Question[] = [
  {
    key: "gender",
    type: "multi",
    multi: true,
    title: "What is your gender?",
    subtitle:
      "We want to learn more about you so we can deliver the perfect images that reflcets exactly who you are!.",
    optional: true,
    options: [
      { label: "Man", value: "man", img: "" },
      { label: "Woman", value: "woman", img: "" },
      { label: "Non Binary", value: "non binary", img: "" },
    ],
  },

  {
    key: "age",
    type: "multi",
    multi: true,
    title: "What is your age?",
    subtitle: "Our service is intended for adults only. We do not provide services to individuals under the age of 18.",
    optional: true,
    options: [
      { label: "18-20", value: "18-20", img: "" },
      { label: "21-24", value: "21-24", img: "" },
      { label: "25-29", value: "25-29", img: "" },
      { label: "30-40", value: "30-40", img: "" },
      { label: "41-50", value: "41-50", img: "" },
      { label: "51-65", value: "51-65", img: "" },
      { label: "65+", value: "65+", img: "" },
    
    ]
  },
  
  {
    key: "hairLength",
    type: "images",
    title: "What is your hair length?",
    options: [
      { label: "Bald", value: "bald", img: "/Bald.png" },
      { label: "Buzz Cut", value: "buzz", img: "/BuzzCut.png" },
      { label: "Short", value: "short", img: "/Short.png" },
      { label: "Medium", value: "medium", img: "/MediumLength.png" },
      { label: "Long", value: "long", img: "/Longhair.png" }
    ]
  },
  {
    key: "bodyType",
    type: "images",
    title: "What is your body type?",
    options: [
      { label: "Slim", value: "slim", img: "/Slimmale.png" },
      { label: "Average", value: "average", img: "/averageman.png" },
      { label: "Athletic", value: "athletic", img: "/Athleisureman.png" },
      { label: "Muscular", value: "muscular", img: "/muscularman.png" },
      { label: "Broad", value: "broad", img: "/broadman.png" },
   
    ]
  },

  {
    key: "attire",
    type: "images",
    title: "What will you wear in your photos?",
    subtitle: "You can select more than one option.",
    multi: true,
    options: [
      { label: "Blazer or Suit Jacket", value: "blazer or suit jacket", img: "/blazersuitman.png" },
      { label: "Casual Everyday Outfit", value: "Casual everyday outfit", img: "/casualman.png" },
      { label: "Bold Fashion Statement", value: "bold fashion statement", img: "/boldfashionmen.png" },
      { label: "Athleisure or Fitness Wear", value: "athleisure or fitness wear", img: "/Athleisureman.png" },
      { label: "Professional Uniform", value: "professional uniform", img: "/professionalnurseman.png" },
    ]
  },

  {
    key: "setting",
    type: "images",
    multi: true,
    title: "What is your preferred setting? ",
    subtitle: "You can select more than one option.",
    options: [
      { label: "Cozy Indoor Space", value: "cozy indoor space", img: "/cozy indoor man.png" },
      { label: "Natural Outdoor", value: "natural outdoor", img: "/man natural outdoor.png" },
      { label: "Office", value: "office", img: "/man office.png" },
      { label: "Studio", value: "studio", img: "/man studio.png" },
      { label: "Urban", value: "urban", img: "/men urban.png" },
      { label: "Conceptual", value: "conceptual", img: "/Conceptual man.png" }
      
    ]
  },
  {
    key: "mood",
    type: "multi",
    multi: true,
    title: "Select your mood or vibe",
    subtitle: "You can select more than one option.",
    options: [
      { label: "Approachable", value: "approachable", img: "" },
      { label: "Bold", value: "bold", img: "" },
      { label: "Warm", value: "warm", img: "" },
      { label: "Creative", value: "creative", img: "" },
      { label: "Peaceful", value: "peaceful", img: "" },
      { label: "Joyful", value: "joyful", img: "" },
      { label: "Mysterious", value: "mysterious", img: "" },
      { label: "Focused", value: "focused", img: "" },
      { label: "Fun", value: "fun", img: "" }

    ]
  },
  {
    key: "brandColors",
    type: "multi",
    title: "Do you have brand colors you'd like subtly included in your shoot?",
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
    key: "avoid",
    type: "text",           // new text-entry question
    title: "Anything to avoid?",
    subtitle:
      "Let us know any colors, styles, or props you’d like us to steer clear of. (Optional)",
    optional: true,
    options: [],            // ← satisfy the Question type
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
  {
    key: "personalized",
    type: "text",           // new text-entry question
    title: "Is there anything else you'd like us to know to help personalize your images? ",
    subtitle: "(Optional)",

    optional: true,
    options: [],            // ← satisfy the Question type
  },


];


type IntakeFormProps = {
  pack: string;
  onComplete?: () => void;
};

export default function IntakeForm({ pack, onComplete }: IntakeFormProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
const rawGender = (searchParams?.get("gender") || "").toLowerCase();
const gender = rawGender === "woman" ? "female" : "male";


  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, any>>({});
  const [uniformText, setUniformText] = useState("");
  const [otherText, setOtherText] = useState("");
  const otherRef = React.useRef<HTMLDivElement | null>(null);
  const uniformRef = React.useRef<HTMLDivElement | null>(null);
  const [brandColorOther, setBrandColorOther] = useState("");

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

  const next = () => {
    if (step < questionSet.length - 1) {
      setStep(step + 1);
    } else {
      if (onComplete) {
        onComplete();
      } else {
        router.push(`/overview/packs/${pack}/next?gender=${gender}`);
      }
    }
  };

  const back = () => {
    if (step > 0) setStep(step - 1);
    else router.back();
  };

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

  return (
    <div className="relative min-h-screen max-w-lg mx-auto pt-20 pb-24 px-6 text-white">
      {/* 1️⃣ BACK BUTTON */}
      <div className="absolute top-4 left-4">
        <Button
          onClick={back}
           className="
           inline-flex items-center gap-2
           bg-muted-gold text-ivory
           px-3 py-1 rounded-full
           shadow-sm
           hover:bg-muted/30 hover:shadow-md
           transition
        "
        >
          <ArrowLeftIcon className="w-4 h-4" />
          Back
        </Button>
      </div>

      {/* 2️⃣ STEP CIRCLE */}
      <div className="flex justify-center mb-4">
        <div className="w-8 h-8 rounded-full bg-muted-gold flex items-center justify-center text-white text-sm font-medium">
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

      {/* 4️⃣ TITLE & SUBTITLE */}
      <h2 className="text-2xl font-bold text-center mb-2">{question.title}</h2>
      {question.subtitle && (
        <p className="text-center text-sm mb-6">{question.subtitle}</p>
      )}

      {/* 5️⃣ OPTIONS */}
      <div className="mt-6 space-y-6">
        {/* — Images grid (unchanged) — */}
        {question.type === "images" && (
          <>
            <div className="grid grid-cols-2 gap-4">
              {question.options.filter((o) => o.img).map((o) => {
                const isSelected = question.multi
                  ? (answers[question.key] || []).includes(o.value)
                  : answers[question.key] === o.value;

                return (
                   <motion.button
                   onClick={() => {
                     choose(o.value);
                    
                   }}
                    whileHover={{ scale: 1.02 }}
                    className={`
                      relative
                      border-2
                      rounded-lg
                      overflow-hidden
                      transition-shadow
                      ${isSelected ? "border-muted-gold shadow-lg" : "border-muted/30 hover:shadow-md"}
                    `}
                    style={{ paddingBottom: "2rem" /* leave room for the label */ }}
                  >
                    {/* IMAGE */}
            <div className="w-full aspect-[3/4] bg-muted/30">
              <Image
                src={o.img}
                alt={o.label}
                fill
                className="object-cover object-center"
                priority={!question.multi}
              />
            </div>


                                {/* GOLD NAMEPLATE */}
            <div
              className="
                absolute
                bottom-0
                left-0
                w-full
                bg-muted-gold
                h-12
                flex items-center justify-center
                px-2
              "
            >
              <span className="text-ivory text-sm font-semibold text-center">
                {o.label}
              </span>
            </div>
          </motion.button>
        )
      })}
    </div>


            {/* ─── PROFESSIONAL UNIFORM TEXTBOX ─── */}
            {question.key === "attire" &&
              Array.isArray(answers.attire) &&
              answers.attire.includes("professional uniform") && (
                <div
                  ref={uniformRef}
                  className="mt-4 p-2 rounded ring-1 ring-muted-gold transition"
                >
                  <label
                    htmlFor="uniformText"
                    className="block text-sm font-medium text-white"
                  >
                    Please specify your exact uniform and industry
                  </label>
                  <input
                    type="text"
                    id="uniformText"
                    value={uniformText}
                    onChange={(e) => setUniformText(e.target.value)}
                    placeholder="e.g. firefighter, nurse, chef"
                    className="mt-1 block w-full rounded-md border-gray-300 bg-white text-black shadow-sm focus:border-charcoal focus:ring-charcoal sm:text-sm"
                  />
                </div>
              )}
          </>
        )}

        {/* — Textarea for “text” type (unchanged) — */}
        {question.type === "text" && (
          <div className="mb-6 space-y-2">
            <textarea
              id={question.key}
              rows={3}
              value={answers[question.key] || ""}
              onChange={(e) =>
                setAnswers((a) => ({ ...a, [question.key]: e.target.value }))
              }
              placeholder="e.g. no neon colors or busy patterns"
              className="w-full rounded-md border-gray-300 bg-white text-black p-2 shadow-sm focus:border-charcoal focus:ring-charcoal sm:text-sm"
            />
          </div>
        )}

        {/* — Select dropdown (unchanged) — */}
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

{/* — Fully expanded “multi” block — */}
{question.type === "multi" && question.multi && (
  <div className="flex flex-col space-y-4">
    {question.options.map((o) => {
      // isSelected: for gender we store an array of one, for others it's a normal includes()
      const isSelected =
        question.key === "gender"
          ? (answers[question.key] || [])[0] === o.value
          : (answers[question.key] || []).includes(o.value);

      // your existing brand-color gradient code (unchanged)
      const colorMap: Record<string, string> = {
        black: "#000000",
        white: "#FFFFFF",
        beige: "#F5F5DC",
        "blush pink": "#FFC0CB",
        "forest green": "#228B22",
        "navy blue": "#000080",
        "cobalt blue": "#0047AB",
        red: "#FF0000",
        orange: "#FFA500",
        gold: "#FFD700",
        silver: "#C0C0C0",
      };
      const circleColor = colorMap[o.value.toLowerCase()] || "transparent";
      const isBrandColorsOther =
        question.key === "brandColors" && o.value.toLowerCase() === "other";
      const gradient = `conic-gradient(
        #000000 0% 11%, #FFFFFF 11% 22%, #F5F5DC 22% 33%,
        #FFC0CB 33% 44%, #228B22 44% 55%, #000080 55% 66%,
        #0047AB 66% 77%, #FF0000 77% 88%, #FFD700 88% 100%
      )`;

      return (
        <React.Fragment key={o.value}>
          <motion.button
            onClick={() => {
              if (question.key === "gender") {
                // 1️⃣ replace the answer array with exactly one choice
                setAnswers((a) => ({ ...a, [question.key]: [o.value] }));
                // 2️⃣ route immediately
                const targetGender = o.value === "woman" ? "woman" : "man";
                router.push(
                  `/custom-intake?packType=${encodeURIComponent(
                    pack
                  )}&gender=${encodeURIComponent(targetGender)}`
                );
              } else {
                // the existing multi-select toggle helper
                choose(o.value);
                // still auto-advance for age/industry only
                if (question.key === "age" || question.key === "industry") {
                  next();
                }
              }
            }}
            whileHover={{ scale: 1.02 }}
            className={`
              relative w-full bg-muted/100 rounded-lg overflow-hidden
              transition-shadow ring-2 ring-white
              ${
                isSelected
                  ? "border-muted-gold shadow-lg"
                  : "border-muted/30 hover:shadow-md"
              }
              flex items-center px-4 py-3
            `}
          >
            {/* — Gender icons (only on the gender question) — */}
            {question.key === "gender" && (
              <div className="mr-4 flex-shrink-0 text-2xl text-charcoal">
                {o.value === "man" && <FaMars />}
                {o.value === "woman" && <FaVenus />}
                {o.value === "non binary" && <FaTransgender />}
              </div>
            )}

            {/* ● Color‐dot (unchanged) */}
            <span
              className="absolute left-4 top-1/2 transform -translate-y-1/2 w-4 h-4 rounded-full"
              style={
                isBrandColorsOther
                  ? { background: gradient }
                  : { backgroundColor: circleColor }
              }
            />

            {/* ◉ Label */}
            <span className="flex-1 text-center">{o.label}</span>

            {/* ✔︎ Indicator */}
            <span
              className={`
                w-4 h-4 rounded-full flex-shrink-0
                ${isSelected ? "bg-sage-green" : "border-2 border-white"}
              `}
            />
          </motion.button>

          {/* — “Other” textbox for brandColors (unchanged) — */}
          {question.key === "brandColors" &&
            o.value === "other" &&
            isSelected && (
              <div className="mt-4 p-2 rounded ring-1 ring-muted-gold">
                <label
                  htmlFor="brandColorOther"
                  className="block text-sm font-medium text-white"
                >
                  Describe your custom color
                </label>
                <input
                  id="brandColorOther"
                  type="text"
                  value={brandColorOther}
                  onChange={(e) => setBrandColorOther(e.target.value)}
                  placeholder="e.g. teal, coral"
                  className="mt-1 block w-full rounded-md border-gray-300 bg-white text-black shadow-sm focus:border-charcoal focus:ring-charcoal sm:text-sm"
                />
              </div>
            )}
        </React.Fragment>
      );
    })}
  </div>
)}

      </div>

      {/* 6️⃣ CONTINUE BUTTON fixed bottom */}
      <div className="fixed bottom-0 left-0 w-full flex items-center bg-charcoal border-t py-4 px-6">
        <Button
          onClick={next}
          disabled={!answers[question.key] && !question.optional}
           className="w-full md:w-1/3 md:mx-auto bg-muted-gold text-white hover:bg-sage-green disabled:opacity-50"
        >
          {step === questionSet.length - 1 ? "Submit" : "Next"}
        </Button>
      </div>
    </div>
  );
}