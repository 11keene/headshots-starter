// File: components/MultiPurposeIntakeForm.tsx
"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { useSearchParams } from "next/navigation";
import { ArrowLeftIcon } from "lucide-react";
import { FaMars, FaVenus } from "react-icons/fa";
import Image from "next/image";

type Option = { label: string; value: string; img?: string; color?: string };

type Question = {
  key: string;
  type: "images" | "multi" | "select" | "text" | "roles" | "moods";
  title: string;
  subtitle?: string;
  multi?: boolean;
  options?: Option[];
  optional?: boolean;
};

// ── Copy/paste your existing WOMEN_QUESTIONS and MEN_QUESTIONS exactly:
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
      { label: "Man", value: "man" },
      { label: "Woman", value: "woman" },
    ],
  },
  {
    key: "age",
    type: "multi",
    multi: true,
    title: "What is your age range?",
    subtitle: "Our service is intended for adults only. We do not provide services to individuals under the age of 18.",
    optional: true,
    options: [
      { label: "18-24", value: "18-24" },
      { label: "25-34", value: "25-34" },
      { label: "35-44", value: "35-44" },
      { label: "45-54", value: "45-54" },
      { label: "55+", value: "55+" },
    ],
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
    ],
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
    ],
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
      { label: "Professional Uniform", value: "professional uniform", img: "/professionalnurselady.png" },
    ],
  },
  {
    key: "setting",
    type: "images",
    multi: true,
    title: "What is your preferred setting? ",
    subtitle: "You can select more than one option.",
    options: [
      { label: "Cozy Indoor Space", value: "cozy indoor space", img: "/Cozyindoor.png" },
      { label: "Natural Outdoor", value: "natural outdoor", img: "/naturaloutdoor.png" },
      { label: "Office", value: "office", img: "/Womanoffice.png" },
      { label: "Studio", value: "studio", img: "/Womanstudio.png" },
      { label: "Urban", value: "urban", img: "/Womanurban.png" },
      { label: "Conceptual", value: "conceptual", img: "/Conceptualwoman.png" },
    ],
  },
  {
    key: "mood",
    type: "multi",
    multi: true,
    title: "Select your mood or vibe",
    subtitle: "You can select more than one option.",
    options: [
      { label: "Approachable", value: "approachable" },
      { label: "Bold", value: "bold" },
      { label: "Warm", value: "warm" },
      { label: "Creative", value: "creative" },
      { label: "Peaceful", value: "peaceful" },
      { label: "Joyful", value: "joyful" },
      { label: "Mysterious", value: "mysterious" },
      { label: "Focused", value: "focused" },
      { label: "Fun", value: "fun" },
    ],
  },
  {
    key: "brandColors",
    type: "multi",
    multi: true,
    title: "Do you have brand colors you'd like subtly included in your shoot?",
    subtitle: "You can select more than one option. (Optional)",
    optional: true,
    options: [
      { label: "Black", value: "black" },
      { label: "White", value: "white", img: "/swatches/white.png" },
      { label: "Beige", value: "beige" },
      { label: "Blush Pink", value: "blush pink" },
      { label: "Forest Green", value: "forest green" },
      { label: "Red", value: "red" },
      { label: "Cobalt Blue", value: "cobalt blue" },
      { label: "Orange", value: "orange" },
      { label: "Gold", value: "gold" },
      { label: "Silver", value: "silver" },
      { label: "Other", value: "other" },
    ],
  },
  {
    key: "avoid",
    type: "text",
    title: "Anything to avoid?",
    subtitle:
      "Let us know any colors, styles, or props you’d like us to steer clear of. (Optional)",
    optional: true,
  },
  {
    key: "industry",
    type: "multi",
    multi: true,
    title: "What industry or profession are you in?",
    options: [
      { label: "Marketing", value: "marketing" },
      { label: "Education", value: "education" },
      { label: "Finance", value: "finance" },
      { label: "Healthcare", value: "healthcare" },
      { label: "Technology", value: "technology" },
      { label: "Other", value: "other" },
    ],
  },
  {
    key: "photoUsage",
    type: "multi",
    multi: true,
    title: "What will you use these for?",
    subtitle: "You can select more than one option.",
    options: [
      { label: "LinkedIn", value: "linkedin" },
      { label: "Website", value: "website" },
      { label: "Speaking Profile", value: "speaking" },
      { label: "Podcast Cover", value: "podcast" },
      { label: "Press Kit", value: "press" },
      { label: "Social Media", value: "social" },
    ],
  },
  {
    key: "personalized",
    type: "text",
    title: "Is there anything else you'd like us to know to help personalize your images? ",
    subtitle: "(Optional)",
    optional: true,
  },
];

const MEN_QUESTIONS: Question[] = [
  {
    key: "gender",
    type: "multi",
    multi: true,
    title: "What is your gender?",
    subtitle:
      "We want to learn more about you so we can deliver the perfect images that reflects exactly who you are!",
    optional: true,
    options: [
      { label: "Man", value: "man" },
      { label: "Woman", value: "woman" },
    ],
  },
  {
    key: "age",
    type: "multi",
    multi: true,
    title: "What is your age range?",
    subtitle:
      "Our service is intended for adults only. We do not provide services to individuals under the age of 18.",
    optional: true,
    options: [
      { label: "18-24", value: "18-24" },
      { label: "25-34", value: "25-34" },
      { label: "35-44", value: "35-44" },
      { label: "45-54", value: "45-54" },
      { label: "55+", value: "55+" },
    ],
  },
  {
    key: "hairLength",
    type: "images",
    title: "What is your hair length?",
    options: [
      { label: "Bald", value: "bald", img: "/Bald.png" },
      { label: "Buzz Cut", value: "buzz", img: "/BuzzCut.png" },
      { label: "Medium", value: "medium", img: "/MediumLength.png" },
      { label: "Curly", value: "curly", img: "/curlyman.png" },
      { label: "Dreads", value: "dreads", img: "/mandreads.png" },
      { label: "Long", value: "long", img: "/Longhair.png" },
    ],
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
    ],
  },
  {
    key: "attire",
    type: "images",
    title: "What will you wear in your photos?",
    subtitle: "You can select more than one option.",
    multi: true,
    options: [
      { label: "Blazer or Suit Jacket", value: "blazer or suit jacket", img: "/blazersuitman.png" },
      { label: "Casual Everyday Outfit", value: "casual everyday outfit", img: "/casualman.png" },
      { label: "Bold Fashion Statement", value: "bold fashion statement", img: "/boldfashionmen.png" },
      { label: "Athleisure or Fitness Wear", value: "athleisure or fitness wear", img: "/Athleisureman.png" },
      { label: "Professional Uniform", value: "professional uniform", img: "/professionalnurseman.png" },
    ],
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
      { label: "Conceptual", value: "conceptual", img: "/Conceptual man.png" },
    ],
  },
  {
    key: "mood",
    type: "multi",
    multi: true,
    title: "Select your mood or vibe",
    subtitle: "You can select more than one option.",
    options: [
      { label: "Approachable", value: "approachable" },
      { label: "Bold", value: "bold" },
      { label: "Warm", value: "warm" },
      { label: "Creative", value: "creative" },
      { label: "Peaceful", value: "peaceful" },
      { label: "Joyful", value: "joyful" },
      { label: "Mysterious", value: "mysterious" },
      { label: "Focused", value: "focused" },
      { label: "Fun", value: "fun" },
    ],
  },
  {
    key: "brandColors",
    type: "multi",
    title: "Do you have brand colors you'd like subtly included in your shoot?",
    subtitle: "You can select more than one option. (Optional)",
    multi: true,
    optional: true,
    options: [
      { label: "Black", value: "black" },
      { label: "White", value: "white" },
      { label: "Beige", value: "beige" },
      { label: "Forest Green", value: "forest green" },
      { label: "Navy Blue", value: "navy blue" },
      { label: "Cobalt Blue", value: "cobalt blue" },
      { label: "Gold", value: "gold" },
      { label: "Red", value: "red" },
      { label: "Silver", value: "silver" },
      { label: "Other", value: "other" },
    ],
  },
  {
    key: "avoid",
    type: "text",
    title: "Anything to avoid?",
    subtitle:
      "Let us know any colors, styles, or props you’d like us to steer clear of. (Optional)",
    optional: true,
  },
  {
    key: "industry",
    type: "multi",
    multi: true,
    title: "What industry or profession are you in?",
    options: [
      { label: "Marketing", value: "marketing" },
      { label: "Education", value: "education" },
      { label: "Finance", value: "finance" },
      { label: "Healthcare", value: "healthcare" },
      { label: "Technology", value: "technology" },
      { label: "Other", value: "other" },
    ],
  },
  {
    key: "photoUsage",
    type: "multi",
    multi: true,
    title: "What will you use these for?",
    subtitle: "You can select more than one option.",
    options: [
      { label: "LinkedIn", value: "linkedin" },
      { label: "Website", value: "website" },
      { label: "Speaking Profile", value: "speaking" },
      { label: "Podcast Cover", value: "podcast" },
      { label: "Press Kit", value: "press" },
      { label: "Social Media", value: "social" },
    ],
  },
  {
    key: "personalized",
    type: "text",
    title: "Is there anything else you'd like us to know to help personalize your images? ",
    subtitle: "(Optional)",
    optional: true,
  },
];

const MULTI_QUESTIONS: Question[] = [
  // SECTION 1: Basic Info
  {
    key: "gender",
    type: "multi",
    multi: true,
    title: "What is your gender?",
    subtitle:
      "We want to learn more about you so we can deliver the perfect images that reflect exactly who you are!",
    options: [
      { label: "Man", value: "man" },
      { label: "Woman", value: "woman" },
    ],
  },
  {
    key: "age",
    type: "multi",
    multi: true,
    title: "What is your age range?",
    options: [
      { label: "18–24", value: "18–24" },
      { label: "25–34", value: "25–34" },
      { label: "35–44", value: "35–44" },
      { label: "45–54", value: "45–54" },
      { label: "55+", value: "55+" },
    ],
  },

  // SECTION 2: Visual Foundation
  {
    key: "bodyType",
    type: "images",
    title: "What is your body type? (select one)",
    options: [
      { label: "Slim", value: "slim", img: "/Slimwoman.png" },
      { label: "Athletic", value: "athletic", img: "/athleticwoman.png" },
      { label: "Average", value: "average", img: "/averagewoman.png" },
      { label: "Curvy", value: "curvy", img: "/curvywoman.png" },
      { label: "Plus Size", value: "plus size", img: "/plussize.png" },
    ],
  },
  {
    key: "hairLength",
    type: "images",
    title: "What is your hair length? (optional)",
    optional: true,
    options: [
      { label: "Pixie Cut", value: "pixie", img: "/pixiecut.png" },
      { label: "Bob Cut", value: "bob", img: "/bobcut.png" },
      { label: "Shoulder", value: "shoulder", img: "/shoulder.png" },
      { label: "Past Shoulder", value: "past-shoulder", img: "/pastshoulder.png" },
      { label: "Midback", value: "midback", img: "/midback.png" },
      { label: "Long", value: "long", img: "/longg.png" },
      { label: "Dreads", value: "dreads", img: "/dreads.png" },
    ],
  },
  {
    key: "hairTexture",
    type: "images",
    title: "What is your hair texture? (optional)",
    optional: true,
    options: [
      { label: "Straight", value: "straight", img: "/Straight.png" },
      { label: "Wavy", value: "wavy", img: "/wavy.png" },
      { label: "Curly", value: "curly", img: "/curly.png" },
      { label: "Coily", value: "coily", img: "/coily.png" },
      { label: "Not Sure", value: "not sure", img: "" },
    ],
  },
  {
    key: "wardrobeCategories",
    type: "images",
    multi: true,
    title: "Wardrobe Categories You Want to Use in This Pack",
    subtitle: "Select all that apply. (Tap multiple choices.)",
    options: [
      { label: "Blazer or Suit Jacket", value: "blazer or suit jacket", img: "/blazer.png" },
      { label: "Dress or Skirt Set", value: "dress or skirt set", img: "/dressorskirt.png" },
      { label: "Bold Fashion Statement", value: "bold fashion statement", img: "/Boldfashionwoman.png" },
      { label: "Cultural Heritage Outfit", value: "cultural heritage outfit", img: "/cultural.png" },
      { label: "Athleisure or Fitness Wear", value: "athleisure or fitness wear", img: "/athleisurewoman.png" },
      { label: "Casual Everyday Look", value: "casual everyday look", img: "/casualwoman.png" },
      {
        label: "Other",
        value: "other-wardrobe",
        img: "",
      },
    ],
  },
  {
    key: "wardrobeOtherText",
    type: "text",
    title: "Other wardrobe (optional)",
    subtitle: "Feel free to be creative or specific.",
    optional: true,
  },
  {
    key: "uniform",
    type: "text",
    title: "Do you wear a specific uniform for any role? (optional)",
    subtitle: "Example: chef coat, medical scrubs, lab gear, clergy attire, etc.",
    optional: true,
  },

  // SECTION 3: Multi-Role Discovery
  {
    key: "roles",
    type: "roles",
    title: "What are the roles or identities you want represented?",
    subtitle:
      "List up to 3 roles (comma-separated). Order matters. Ex. “Founder, Yoga Instructor, Podcast Host.”",
  },
  {
    key: "moods",
    type: "moods",
    title: "What vibe or emotional tone for each role?",
    subtitle:
      "Pick one mood per role. We will create one dropdown for each role you entered.",
  },

  // SECTION 4: Styling + Visual Direction
  {
    key: "backgroundSettings",
    type: "multi",
    multi: true,
    title: "Preferred background settings (select all that apply)",
    options: [
      { label: "Studio Backdrop", value: "studio backdrop" },
      { label: "Office or Work Setting", value: "office or work setting" },
      { label: "Urban Outdoor", value: "urban outdoor" },
      { label: "Nature-Based", value: "nature-based" },
      {
        label: "Conceptual/Creative Spaces",
        value: "conceptual/creative spaces",
      },
      { label: "Other", value: "other-background" },
    ],
  },
  {
    key: "backgroundOtherText",
    type: "text",
    title: "Other background (optional)",
    subtitle: "",
    optional: true,
  },
  {
    key: "brandColors",
    type: "text",
    title: "Brand colors or color accents to include (optional)",
    subtitle:
      "We’ll use these for props, styling, or backgrounds if possible.",
    optional: true,
  },
  {
    key: "avoidStyles",
    type: "text",
    title: "Any colors, clothing items, or visual styles to avoid? (optional)",
    optional: true,
  },

  // SECTION 5: Personality & Creative Expression
  {
    key: "overallVibes",
    type: "multi",
    multi: true,
    title: "What overall vibes best describe you? (select all that apply)",
    options: [
      { label: "Bold", value: "bold" },
      { label: "Soft", value: "soft" },
      { label: "Creative", value: "creative" },
      { label: "Minimal", value: "minimal" },
      { label: "Luxurious", value: "luxurious" },
      { label: "Energetic", value: "energetic" },
      { label: "Calm", value: "calm" },
      { label: "Empowered", value: "empowered" },
      { label: "Fun", value: "fun" },
      { label: "Professional", value: "professional" },
      { label: "Other", value: "other-vibe" },
    ],
  },
  {
    key: "overallVibesOtherText",
    type: "text",
    title: "Other vibes (optional)",
    subtitle: "",
    optional: true,
  },
  {
    key: "usagePurposes",
    type: "multi",
    multi: true,
    title: "How do you plan to use these photos? (select all that apply)",
    options: [
      { label: "LinkedIn or Resume", value: "linkedin or resume" },
      { label: "Personal Website or About Page", value: "personal website" },
      { label: "Social Media", value: "social media" },
      { label: "Book Cover / Media Kit", value: "book cover / media kit" },
      { label: "Online Courses or Sales Pages", value: "online courses" },
      { label: "Dating Profile", value: "dating profile" },
      { label: "Other", value: "other-usage" },
    ],
  },
  {
    key: "usageOtherText",
    type: "text",
    title: "Other usage (optional)",
    subtitle: "",
    optional: true,
  },

  // SECTION 6: Optional Customization
  {
    key: "creativeFlair",
    type: "multi",
    multi: true,
    title: "Would you like to add a creative flair to any images?",
    options: [
      { label: "Yes", value: "yes" },
      { label: "No", value: "no" },
    ],
  },
  {
    key: "props",
    type: "multi",
    multi: true,
    title: "Any props, tools, or symbolic items you want included? (optional)",
    subtitle:
      "Example: mic, notebook, paintbrush, headphones, laptop, flowers, etc.",
    options: [
      { label: "None", value: "none" },
      { label: "Include Props", value: "include-props" },
      { label: "Other", value: "other-props" },
    ],
  },
  {
    key: "propsOtherText",
    type: "text",
    title: "Specify props (optional)",
    subtitle: "",
    optional: true,
  },
  {
    key: "anythingElse",
    type: "text",
    title: "Anything else you want us to know? (optional)",
    optional: true,
  },
];

type IntakeFormProps = {
  pack: string;
  onComplete?: () => void;
};

export default function MultiPurposeIntakeForm({
  pack,
  onComplete,
}: {
  pack: string;
  onComplete?: () => void;
}) {
const router = useRouter();
  const searchParams = useSearchParams();
  const rawGender = (searchParams?.get("gender") || "").toLowerCase();
  const gender = rawGender === "woman" ? "female" : "male";

  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, any>>({});
  const [rolesText, setRolesText] = useState("");
  const [otherTextMap, setOtherTextMap] = useState<Record<string, string>>({});
  const [brandColorOther, setBrandColorOther] = useState("");
  const [propsOther, setPropsOther] = useState("");

  useEffect(() => {
    setStep(0);
    localStorage.removeItem(`intake-${pack}`);
    setAnswers({});
  }, [pack]);

  useEffect(() => {
    const saved = localStorage.getItem(`intake-${pack}`);
    if (saved) setAnswers(JSON.parse(saved));
  }, [pack]);

  useEffect(() => {
    localStorage.setItem(`intake-${pack}`, JSON.stringify(answers));
  }, [answers, pack]);

  const questionSet = useMemo<Question[]>(() => {
    if (pack === "multi-purpose") {
      return MULTI_QUESTIONS;
    }
    return gender === "female" ? WOMEN_QUESTIONS : MEN_QUESTIONS;
  }, [gender, pack]);

  const question = questionSet[step];

  const next = () => {
    if (question.key === "roles") {
      const parsed = rolesText
        .split(",")
        .map((r) => r.trim())
        .filter((r) => r.length > 0)
        .slice(0, 3);
      setAnswers((a) => ({ ...a, roles: parsed }));
      setStep((s) => s + 1);
      return;
    }

    if (question.key === "moods") {
      const moodArr: string[] = [];
      const rolesArr: string[] = answers.roles || [];
      rolesArr.forEach((_, idx) => {
        const key = `mood_${idx}`;
        if (answers[key]) {
          moodArr.push(answers[key]);
        } else {
          moodArr.push("");
        }
      });
      setAnswers((a) => ({ ...a, moods: moodArr }));
      setStep((s) => s + 1);
      return;
    }

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

  const choose = (key: string, val: any) => {
    const curVal = answers[key] || [];
    const updated = curVal.includes(val)
      ? curVal.filter((v: any) => v !== val)
      : [...curVal, val];
    setAnswers((a) => ({ ...a, [key]: updated }));
  };

  return (
    <div className="relative min-h-screen max-w-lg mx-auto pt-20 pb-24 px-6 text-white">
      {/* BACK BUTTON */}
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

      {/* STEP CIRCLE */}
      <div className="flex justify-center mb-4">
        <div className="w-8 h-8 rounded-full bg-muted-gold flex items-center justify-center text-white text-sm font-medium">
          {step + 1}
        </div>
      </div>

      {/* PROGRESS BAR */}
      <div className="w-full bg-white h-2 rounded-full overflow-hidden mb-6">
        <div
          className="h-2 bg-gradient-to-r from-sage-green to-sage-green transition-all"
          style={{ width: `${((step + 1) / questionSet.length) * 100}%` }}
        />
      </div>

      {/* TITLE & SUBTITLE */}
      <h2 className="text-2xl font-bold text-muted-gold text-center mb-2">{question.title}</h2>
      {question.subtitle && (
        <p className="text-center text-sm mb-6">{question.subtitle}</p>
      )}

      <div className="mt-6 space-y-6">
        {/* IMAGES GRID */}
        {question.type === "images" && question.options && (
          <div className="grid grid-cols-2 gap-4">
            {question.options.map((o) => {
              const arr = answers[question.key] || [];
              const isSelected = Array.isArray(arr)
                ? arr.includes(o.value)
                : arr === o.value;
              return (
                <motion.button
                  key={o.value}
                  onClick={() => {
           if (question.multi) {
             choose(question.key, o.value);
           } else {
             // Single‐choice image: record answer then advance
             setAnswers((a) => ({ ...a, [question.key]: o.value }));
             setTimeout(next, 300);
           }
         }}
                  whileHover={{ scale: 1.02 }}
                  className={`
                    relative rounded-lg overflow-hidden transition-shadow
                    ${isSelected
                      ? "border-4 border-sage-green shadow-lg"
                      : "border-2 border-muted/30 hover:shadow-md"
                    }
                  `}
                  style={{ paddingBottom: "2rem" }}
                >
                  <div className="w-full aspect-[3/4] bg-muted/30">
                    {o.img && (
                      <Image
                        src={o.img}
                        alt={o.label}
                        fill
                        className="object-cover object-center"
                      />
                    )}
                  </div>
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
              );
            })}
          </div>
        )}

        {/* TEXTAREA FOR “text” TYPE */}
        {question.type === "text" && (
          <div className="mb-6 space-y-2">
            <textarea
              id={question.key}
              rows={3}
              value={answers[question.key] || ""}
              onChange={(e) =>
                setAnswers((a) => ({ ...a, [question.key]: e.target.value }))
              }
              placeholder="Type here..."
              className="w-full rounded-md border-gray-300 bg-white text-black p-2 shadow-sm focus:border-charcoal focus:ring-charcoal sm:text-sm"
            />
          </div>
        )}

        {/* SELECT DROPDOWN FOR “select” TYPE */}
        {question.type === "select" && question.options && (
          <select
            id={`select-${question.key}`}
            
            className="w-full p-3 border rounded-lg focus:border-muted-gold text-black"
            value={answers[question.key] || ""}
            onChange={(e) =>
              setAnswers((a) => ({ ...a, [question.key]: e.target.value }))
            }
          >
            <option value="">Choose…</option>
            {question.options.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        )}

        {/* MULTI‐SELECT */}
        {question.type === "multi" && question.multi && question.options && (
          <div className="flex flex-col space-y-4">
            {question.options.map((o) => {
              const arr = answers[question.key] || [];
              const isSelected = Array.isArray(arr) ? arr.includes(o.value) : false;

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
              const isOtherText =
                question.key === "wardrobeCategories" && o.value === "other-wardrobe";
              const isOtherVibe =
                question.key === "overallVibes" && o.value === "other-vibe";
              const isOtherUsage =
                question.key === "usagePurposes" && o.value === "other-usage";
              const isOtherBackground =
                question.key === "backgroundSettings" && o.value === "other-background";

              return (
                <React.Fragment key={o.value}>
                  <motion.button
                  onClick={() => {
             if (question.key === "gender") {
               // 1️⃣ Save gender as a one-element array
               setAnswers((a) => ({ ...a, [question.key]: [o.value] }));

               // 2️⃣ Update URL (so useSearchParams sees gender change)
               router.push(
                 `/multi-purpose-intake?gender=${encodeURIComponent(o.value)}`,
                 { scroll: false }
               );

               // 3️⃣ Move to next question immediately
               next();
               return;
             }+
             // For any other “multi” (e.g. age, industry, etc.), toggle selection:
             choose(question.key, o.value);

             // If age or industry, instantly advance after click:
             if (question.key === "age" || question.key === "industry") {
               next();
             }
          }}
                    whileHover={{ scale: 1.02 }}
                    className={`
                      relative w-full bg-muted/100 rounded-lg overflow-hidden
                      transition-shadow ${
                        isSelected
                          ? "border-4 border-sage-green shadow-lg"
                          : "border-2 border-muted/30 hover:shadow-md"
                      }
                      flex items-center px-4 py-3
                    `}
                  >
                    {(question.key === "brandColors" ||
                      question.key === "overallVibes" ||
                      question.key === "usagePurposes" ||
                      question.key === "backgroundSettings") && (
                      <span
                        className="absolute left-4 top-1/2 transform -translate-y-1/2 w-4 h-4 rounded-full"
                        style={{
                          backgroundColor: isOtherText
                            ? "transparent"
                            : circleColor,
                        }}
                      />
                    )}

                    <span className="flex-1 text-center">{o.label}</span>

                    <span
                      className={`
                        w-4 h-4 rounded-full flex-shrink-0
                        ${isSelected ? "bg-sage-green" : "border-2 border-white"}
                      `}
                    />
                  </motion.button>

                  {(isOtherText || isOtherVibe || isOtherUsage || isOtherBackground) &&
                    isSelected && (
                      <div className="mt-4 p-2 rounded ring-1 ring-muted-gold">
                        <label
                          htmlFor={`${question.key}OtherText`}
                          className="block text-sm font-medium text-white"
                        >
                          Please specify
                        </label>
                        <input
                          id={`${question.key}OtherText`}
                          type="text"
                          value={otherTextMap[question.key] || ""}
                          onChange={(e) =>
                            setOtherTextMap((prev) => ({
                              ...prev,
                              [question.key]: e.target.value,
                            }))
                          }
                          placeholder="Type here..."
                          className="mt-1 block w-full rounded-md border-gray-300 bg-white text-black shadow-sm focus:border-charcoal focus:ring-charcoal sm:text-sm"
                        />
                      </div>
                    )}
                </React.Fragment>
              );
            })}
          </div>
        )}

        {/* “roles” free‐text entry */}
        {question.type === "roles" && (
          <div className="mb-6">
            <textarea
              id="roles"
              rows={2}
              value={rolesText}
              onChange={(e) => setRolesText(e.target.value)}
              placeholder='e.g. "Founder, Yoga Instructor, Podcast Host"'
              className="w-full rounded-md border-gray-300 bg-white text-black p-2 shadow-sm focus:border-charcoal focus:ring-charcoal sm:text-sm"
            />
          </div>
        )}

        {/* “moods” dynamic dropdowns */}
        {question.type === "moods" && Array.isArray(answers.roles) && (
          <div className="space-y-6">
            {answers.roles.map((role: string, idx: number) => {
              const selectKey = `mood_${idx}`;
              return (
                <div key={idx} className="mb-4">
                  <label
                    htmlFor={selectKey}
                    className="block text-sm font-medium text-white mb-1"
                  >
                    Mood for “{role}”
                  </label>
                  <select
                    id={selectKey}
                    className="w-full p-3 border rounded-lg focus:border-muted-gold text-black"
                    value={answers[selectKey] || ""}
                    onChange={(e) =>
                      setAnswers((a) => ({
                        ...a,
                        [selectKey]: e.target.value,
                      }))
                    }
                  >
                    <option value="">Choose a mood…</option>
                    <option value="Bold & Confident">Bold & Confident</option>
                    <option value="Calm & Grounded">Calm & Grounded</option>
                    <option value="Creative & Expressive">Creative & Expressive</option>
                    <option value="Empowering">Empowering</option>
                    <option value="Energetic">Energetic</option>
                    <option value="Elegant">Elegant</option>
                    <option value="Soft & Reflective">Soft & Reflective</option>
                    <option value="Warm & Approachable">Warm & Approachable</option>
                    <option value="Playful">Playful</option>
                    <option value="Visionary">Visionary</option>
                    <option value="Other (text below) ">Other</option>
                  </select>
                  {answers[selectKey] === "Other (text below) " && (
                    <div className="mt-2">
                      <input
                        type="text"
                        value={otherTextMap[selectKey] || ""}
                        onChange={(e) =>
                          setOtherTextMap((prev) => ({
                            ...prev,
                            [selectKey]: e.target.value,
                          }))
                        }
                        placeholder="Describe your custom mood…"
                        className="w-full rounded-md border-gray-300 bg-white text-black p-2 shadow-sm focus:border-charcoal focus:ring-charcoal sm:text-sm"
                      />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* CONTINUE / SUBMIT BUTTON fixed bottom */}
      <div className="fixed bottom-0 left-0 w-full flex items-center bg-charcoal border-t py-4 px-6">
        <Button
          onClick={next}
          disabled={
     // ─── 1) “Roles” step must have non‐empty rolesText ───
      (question.type === "roles" && rolesText.trim() === "") ||

      // ─── 2) “Moods” step: disable if any mood_X is missing/empty ───
      (question.type === "moods" &&
        Array.isArray(answers.roles) && answers.roles.some((_, idx) => {
          const key = `mood_${idx}`;
          return !answers[key]; 
        })) ||

      // ─── 3) All other non‐optional questions just look at answers[question.key] ───
      (question.type !== "roles" &&
        question.type !== "moods" &&
        !answers[question.key] &&
        question.optional !== true)
    }
          className="w-full md:w-1/3 md:mx-auto bg-muted-gold text-white hover:bg-sage-green disabled:opacity-50"
        >
          {step === questionSet.length - 1 ? "Submit" : "Next"}
        </Button>
      </div>
    </div>
  );
}
