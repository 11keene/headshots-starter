// lib/useTranslations.ts
import { usePathname } from "next/navigation";

import en from "../locales/en.json";
import de from "../locales/de.json";
import fr from "../locales/fr.json";
import pt from "../locales/pt.json";
import es from "../locales/es.json";

const DICT: Record<string, Record<string,string>> = {
  en, de, fr, pt, es
};

export function useTranslations() {
  const pathname = usePathname();
  const locale = pathname ? pathname.split('/')[1] : 'en'; // Assumes locale is the first path segment, fallback to 'en'
  // fallback to 'en' if missing
  return DICT[locale] || DICT.en;
}
