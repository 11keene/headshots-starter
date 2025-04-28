"use client";

import IntakeForm from "@/components/IntakeForm";

export default function CustomIntakePage() {
  return (
    <div className="flex justify-center items-center min-h-screen p-4">
      <div className="w-full max-w-2xl">
        <h1 className="text-3xl font-bold text-center mb-8">Custom Photoshoot Intake Form</h1>
        <IntakeForm 
          pack="defaultPack" 
          onComplete={() => console.log('Form completed')} 
        />
      </div>
    </div>
  );
}