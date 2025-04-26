// app/overview/modes/train/[pack]/page.tsx

import TrainModelFlow from "@/components/TrainModelFlow";

interface PageProps {
  params: { pack: string };
}

// We simply hand off to TrainModelFlow, giving it the pack name
export default function Page({ params }: PageProps) {
  return <TrainModelFlow packSlug={params.pack} />;
}
