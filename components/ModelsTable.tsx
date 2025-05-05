// File: components/ModelsTable.tsx

import React from "react";
import { useRouter } from "next/navigation";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "./ui/table";

export interface modelRowWithSamples {
  id: number;
  name: string;
  pack: string;
  status: string;
  fine_tuned_face_id: string;
  trained_at: string;
  samples: { uri: string }[];
}

interface ModelsTableProps {
  models?: modelRowWithSamples[];
}

export default function ModelsTable({ models }: ModelsTableProps) {
  const router = useRouter();

  const handleRedirect = (modelId: number) => {
    router.push(`/overview/models/${modelId}`);
  };

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Name</TableHead>
          <TableHead>Pack</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Trained At</TableHead>
          <TableHead className="text-right">Example</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {models?.map((model) => (
          <TableRow
            key={model.id}                 // ← changed from model.modelId
            onClick={() => handleRedirect(model.id)}
            className="cursor-pointer h-16"
          >
            <TableCell>{model.name}</TableCell>
            <TableCell>{model.pack}</TableCell>
            <TableCell>{model.status}</TableCell>
            <TableCell>{new Date(model.trained_at).toLocaleString()}</TableCell>
            <TableCell className="text-right">
              {model.samples[0]?.uri ? (
                <img
                  src={model.samples[0].uri}
                  alt="Sample"
                  className="h-8 w-8 rounded"
                />
              ) : (
                "—"
              )}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
