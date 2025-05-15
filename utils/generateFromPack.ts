import { promptPacks } from "@/lib/promptPacks";
import { generateImages } from "./generateImages";

export async function generateImagesFromPack(tuneId: string, packName: string) {
  const prompts = promptPacks[packName as keyof typeof promptPacks];

  if (!prompts || prompts.length === 0) {
    throw new Error(`No prompts found for pack: ${packName}`);
  }

  return await generateImages(tuneId, prompts);
}
