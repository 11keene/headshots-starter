// File: app/license/page.tsx

import fs from "fs";
import path from "path";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "License – AI Maven",
};

export default function LicensePage() {
  // Read the LICENSE.md from the project root
  const filePath = path.join(process.cwd(), "LICENSE.md");
  const markdown = fs.readFileSync(filePath, "utf-8");

  return (
    <main className="prose prose-invert mx-auto py-16 px-4">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeRaw]}
      >
        {markdown}
      </ReactMarkdown>
    </main>
  );
}
