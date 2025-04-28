"use client";
import React, { useState } from "react";

export default function CustomNext() {
  const [gender, setGender] = useState<"male"|"female"|"other">("other");

  return (
    <div className="p-8 max-w-xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Almost Done!</h1>
      <label className="block mb-2">Select Your Gender:</label>
      <select
        value={gender}
        onChange={(e) => setGender(e.target.value as any)}
        className="mb-6 p-2 border rounded w-full"
      >
        <option value="female">Female</option>
        <option value="male">Male</option>
        <option value="other">Prefer Not to Say</option>
      </select>

      <label className="block mb-2">Upload Your Photos:</label>
      <input
        type="file"
        accept="image/*"
        multiple
        className="block mb-6"
      />

      <button className="px-6 py-2 bg-blue-600 text-white rounded">
        Finish Order
      </button>
    </div>
  );
}
