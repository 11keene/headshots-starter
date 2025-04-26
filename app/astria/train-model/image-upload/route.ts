import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";
// 1) Import the Body type
import { handleUpload, type HandleUploadBody } from "@vercel/blob/client";
import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function POST(request: Request): Promise<NextResponse> {
  const supabase = createServerComponentClient({ cookies });
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // 2) Parse the JSON once into the correct type
  const body = (await request.json()) as HandleUploadBody;
  if (!body) {
    return NextResponse.json(
      { error: "Missing request body" },
      { status: 400 }
    );
  }

  try {
    // 3) Pass that parsed `body` into handleUpload
    const jsonResponse = await handleUpload({
      request,      // still pass the Request so it can handle form-data parts
      body,         // ← now correct type

      onBeforeGenerateToken: async (_pathname: string) => {
        if (!user) throw new Error("Unauthorized");
        return {
          allowedContentTypes: ["image/jpeg", "image/png", "image/gif"],
          tokenPayload: JSON.stringify({ userId: user.id }),
        };
      },

      onUploadCompleted: async ({ blob, tokenPayload }) => {
        console.log("blob upload completed", blob, tokenPayload);
        // …your post‐upload logic…
      },
    });

    return NextResponse.json(jsonResponse);
  } catch (error) {
    return NextResponse.json(
      { error: (error as Error).message },
      { status: 400 }
    );
  }
}
