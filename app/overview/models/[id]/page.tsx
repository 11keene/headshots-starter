// app/overview/models/[id]/page.tsx
import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import Link from "next/link";
import ClientSideModel from "@/components/realtime/ClientSideModel";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Icons } from "@/components/icons";
import { FaArrowLeft } from "react-icons/fa";

export const dynamic = "force-dynamic";

export default async function ModelPage({
  params,
}: {
  params: { id: string };
}) {
  const supabase = createServerComponentClient({ cookies });
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: model } = await supabase
    .from("models")
    .select("*")
    .eq("id", Number(params.id))
    .eq("user_id", user.id)
    .single();

  if (!model) redirect("/overview");

  return (
    <div id="train-model-container" className="w-full h-full p-4">
      <div className="flex items-center gap-4 pb-4">
        <Link href="/overview">
          <Button variant="outline" size="sm" className="flex items-center gap-2">
            <FaArrowLeft />
            Go Back
          </Button>
        </Link>
        <h1 className="text-xl font-semibold">{model.name}</h1>
        <Badge
          variant={model.status === "finished" ? "default" : "secondary"}
          className="text-xs font-medium ml-2 flex items-center gap-1"
        >
          {model.status === "processing" ? "training" : model.status}
          {model.status === "processing" && (
            <Icons.spinner className="h-4 w-4 animate-spin" />
          )}
        </Badge>
      </div>

      {/* Only pass the model’s ID */}
      <ClientSideModel modelId={model.id} />
    </div>
  );
}
