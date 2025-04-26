// app/gallery/page.tsx
import Image from "next/image";
import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";

export const dynamic = "force-dynamic";

export default async function GalleryPage({ searchParams }: { searchParams: { session?: string } }) {
  const faceId = searchParams.session;
  const supabase = createServerComponentClient({ cookies });

  const { data } = await supabase
    .from("headshots")
    .select("images")
    .eq("face_id", faceId)
    .single();

  if (!data?.images?.length) {
    return <p className="p-4">No images found for this session.</p>;
  }

  return (
    <div className="max-w-4xl mx-auto p-4 grid grid-cols-2 md:grid-cols-4 gap-4">
      {data.images.map((url: string, i: number) => (
        <div key={i} className="aspect-square rounded overflow-hidden">
          <Image src={url} alt={`Headshot ${i+1}`} fill className="object-cover" />
        </div>
      ))}
    </div>
  );
}
