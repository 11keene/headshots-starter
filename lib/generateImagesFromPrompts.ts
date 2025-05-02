import OpenAI from "openai";

// Initialize the Astria/OpenAI client
const openai = new OpenAI({ apiKey: process.env.ASTRIA_API_KEY });

/**
 * Options for generating images from prompts.
 */
interface GenerateImagesOptions {
  /** A list of text prompts for image generation */
  prompts: string[];
  /** Unique identifier for grouping generated images */
  fineTunedFaceId: string;
  /** Astria model (tune) ID to use for rendering */
  modelId: string;
}

/**
 * Generates one image per prompt using the specified Astria tune.
 * 
 * @param prompts - Array of prompt strings
 * @param fineTunedFaceId - Identifier for this batch of images
 * @param modelId - Astria tune/model ID to invoke
 * @returns Array of generated image URLs
 */
export async function generateImagesFromPrompts({
  prompts,
  fineTunedFaceId,
  modelId,
}: GenerateImagesOptions): Promise<string[]> {
  const urls: string[] = [];

  for (const prompt of prompts) {
    // Call the image generation endpoint with the dynamic modelId
    const response = await openai.images.generate({
      model: modelId,
      prompt,
      // Removed 'num_images' as it is not a valid property in 'ImageGenerateParams'
      // You can customize additional parameters here
      // e.g., steps, cfg_scale, seed, etc.
    });

    const url = response.data?.[0]?.url;
    if (url) {
      urls.push(url);
    } else {
      console.warn(`No URL returned for prompt: ${prompt}`);
    }
  }

  return urls;
}
