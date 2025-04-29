// app/pricing/page.tsx
import PricingClient from "@/components/PricingClient";

export default function PricingPage({
  searchParams,
}: {
  searchParams: { packId?: string; extraPacks?: string };
}) {
  const { packId = "", extraPacks = "" } = searchParams;
  return <PricingClient packId={packId} extraPacks={extraPacks} />;
}
