// File: app/generating/page.tsx
"use client";

import { useEffect, useState } from "react";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { useSession } from "@supabase/auth-helpers-react";
import { useRouter } from "next/navigation";
import Image from "next/image";

export default function GeneratingPage() {
  const supabase = createClientComponentClient();
  const session = useSession();
  const userId = session?.user?.id;
  const [images, setImages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  // Poll for generated images every 30 seconds
  useEffect(() => {
    if (!userId) return;

    const interval = setInterval(async () => {
      const { data, error } = await supabase
        .from("generated_images")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(100);

      if (error) {
        console.error("Error fetching images:", error);
        return;
      }

      if (data && data.length > 0) {
        setImages(data);
        setLoading(false);
      }
    }, 30000); // 30 seconds

    return () => clearInterval(interval);
  }, [userId, supabase]);

  return (
    <div className="min-h-screen p-8 text-center bg-ivory">
      <h1 className="text-2xl font-bold mb-4">Your Images Are Being Generated</h1>
      <p className="mb-6 text-gray-700">
        This may take 5–10 minutes. You’ll see your images appear below as soon as they’re ready.
      </p>

      {loading && <p className="text-muted-gold">Checking for updates...</p>}

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
        {images.map((img, i) => (
          <div key={i} className="relative w-full aspect-square bg-gray-100 rounded-lg shadow">
            <Image
              src={img.image_url || "/placeholder.jpg"}
              alt={`Generated ${i + 1}`}
              fill
              className="object-cover rounded-lg"
            />
          </div>
        ))}
      </div>
    </div>
  );
}
