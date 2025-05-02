'use client';
import { useState } from "react";

export default function TestPromptPage() {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<any>(null);

  async function generatePrompts() {
    setLoading(true);
    const res = await fetch("/api/generate-prompts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        pack: "Professional Headshots",
        answers: {
          gender: "female",
          hair: { length: "shoulder", texture: "wavy" },
          bodyType: "curvy",
          attireStyles: ["business professional", "smart casual"],
          settings: ["studio", "office"],
          moods: ["confident", "approachable"],
          brandColors: ["beige", "blush pink"],
          industry: "marketing",
          photoUsage: ["LinkedIn", "website"],
          creativeFlair: true,
          avoidances: ["city", "bold lighting"]
        }
      })
    });

    const json = await res.json();
    setData(json);
    setLoading(false);
  }

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <button
        onClick={generatePrompts}
        className="bg-black text-white px-4 py-2 rounded hover:bg-gray-800"
      >
        {loading ? "Generating..." : "Test Generate Prompts"}
      </button>

      {data && (
        <div className="mt-6">
          <h2 className="font-bold text-lg mb-2">Generated Prompts:</h2>
          <ul className="text-sm whitespace-pre-wrap bg-gray-100 p-4 rounded space-y-2">
            {data.prompts.map((prompt: string, i: number) => (
              <li key={i}>
                <strong>{i + 1}.</strong> {prompt}
              </li>
            ))}
          </ul>

          <p className="mt-4 text-xs text-gray-500">
            Fine-tuned Face ID: <span className="font-mono">{data.fineTunedFaceId}</span>
          </p>
        </div>
      )}
    </div>
  );
}
