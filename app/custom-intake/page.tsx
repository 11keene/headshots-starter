// app/custom-intake/page.tsx
export const dynamic = "force-dynamic";  // no SSG
export const runtime = "edge";          // optional, but ensures dynamic runtime

import CustomIntakeClient from "./CustomIntakeClient";

export default function Page({
  searchParams,
}: {
  searchParams: { packId?: string };
}) {
  // server‐side read of the query
  const packId = searchParams.packId ?? "defaultPack";
  return <CustomIntakeClient packId={packId} />;
}
