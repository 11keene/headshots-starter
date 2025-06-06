import { NextRequest } from "next/server";
import JSZip from "jszip";
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { Readable } from "stream";

interface GeneratedImageRow {
  image_url: string;
}

export async function GET(req: NextRequest, { params }: { params: { packId: string } }) {
  const supabase = createRouteHandlerClient({ cookies });
  const packId = params.packId;

  // Step 1: Fetch all image URLs for this pack
  const { data: rows, error } = await supabase
    .from("generated_images")
    .select("image_url")
    .eq("pack_id", packId);

  if (error || !rows) {
    return new Response("Failed to fetch images", { status: 500 });
  }

  console.log(`📦 Found ${rows.length} images for pack ${packId}`);

  const zip = new JSZip();

  // Step 2: Download and add each image to the ZIP
  for (let i = 0; i < rows.length; i++) {
    const { image_url } = rows[i];
    const response = await fetch(image_url);

    if (!response.ok) {
      console.warn(`⚠️ Skipping image ${image_url}`);
      continue;
    }

    const arrayBuffer = await response.arrayBuffer();
    const fileName = `image-${i + 1}.jpg`;
    zip.file(fileName, arrayBuffer);
  }

  // Step 3: Generate ZIP
  const zipBuffer = await zip.generateAsync({ type: "nodebuffer" });

  console.log(`✅ Finished ZIP for ${packId}`);

  // Step 4: Stream the ZIP to the browser
  const nodeStream = Readable.from(zipBuffer);
  const webStream = new ReadableStream({
    start(controller) {
      nodeStream.on("data", (chunk) => controller.enqueue(chunk));
      nodeStream.on("end", () => controller.close());
      nodeStream.on("error", (err) => controller.error(err));
    },
  });

  return new Response(webStream, {
    headers: {
      "Content-Type": "application/zip",
      "Content-Disposition": `attachment; filename="${packId}-photos.zip"`,
    },
  });
}
