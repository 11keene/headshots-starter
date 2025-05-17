"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { FaArrowLeft } from "react-icons/fa";

interface BackButtonProps {
  children?: React.ReactNode;
  className?: string;
}

export default function BackButton({ children, className }: BackButtonProps) {
  const router = useRouter();
  return (
    <Button
      variant="outline"
      size="sm"
      className={className}
      onClick={() => router.back()}
    >
      <FaArrowLeft className="mr-2" />
      {children || "Back"}
    </Button>
  );
}