// File: app/teams/page.tsx
"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button"; // Replace with a plain <button> if you don’t have a custom Button component.

export default function TeamsIntakePage() {
  const router = useRouter();
// If teamInfo is already in localStorage, skip intake and go straight to dashboard:
  useEffect(() => {
    const stored = localStorage.getItem("teamInfo");
    if (stored) {
      router.push("/teams/dashboard");
    }
  }, [router]);
const SHOW_TEAMS = false; // 👈 Turn this to true later when ready

  // ─────────────────────────────────────────────────────────────────
  // Local state for each field in the form
  // ─────────────────────────────────────────────────────────────────
  const [teamName, setTeamName] = useState("");
  const [teamSize, setTeamSize] = useState("");
  const [department, setDepartment] = useState("");
  const [useCase, setUseCase] = useState("");
  const [phone, setPhone] = useState("");
  const [website, setWebsite] = useState("");

  // ─────────────────────────────────────────────────────────────────
  // Handler when the user clicks “Create Team”
  //  • Save all fields to localStorage as JSON
  //  • Then navigate to /teams/dashboard
  // ─────────────────────────────────────────────────────────────────
  const onCreateTeam = () => {
    const info = {
      teamName: teamName.trim(),
      teamSize,
      department,
      useCase,
      phone: phone.trim(),
      website: website.trim(),
    };

    try {
      localStorage.setItem("teamInfo", JSON.stringify(info));
    } catch (e) {
      console.error("Failed to save teamInfo to localStorage:", e);
    }

    // Redirect to the team dashboard
    router.push("/teams/dashboard");
  };

  // ─────────────────────────────────────────────────────────────────
  // Disable the “Create Team” button until required fields are filled
  // ─────────────────────────────────────────────────────────────────
  const isCreateDisabled =
    teamName.trim() === "" ||
    teamSize === "" ||
    department === "" ||
    useCase === "";

  return (
    <div className="flex min-h-screen bg-muted/30 p-8 justify-center items-start">
      <div className="mx-auto w-full max-w-md space-y-6">
        {/* Page Title */}
        <h1 className="text-3xl text-charcoal font-bold">Create your team</h1>
        <p className="mt-2 mb-6 text-charcoal">
  Team discounts: up to 25% off depending on team size.
</p>

        {/* 1) Team or Company Name (required) */}
        <div>
          <label htmlFor="teamName" className="block text-charcoal font-medium mb-1">
            Team or Company Name *
          </label>
          <input
            id="teamName"
            type="text"
            value={teamName}
            onChange={(e) => setTeamName(e.target.value)}
            placeholder="Acme Inc."
            className="
              w-full
              rounded-md
              border border-gray-300
              px-3 py-2
              bg-white text-black
              focus:outline-none focus:ring-2 focus:ring-muted-gold
            "
          />
        </div>

        {/* 2) Team Size (required dropdown) */}
        <div>
          <label htmlFor="teamSize" className="block text-charcoal font-medium mb-1">
            Team Size *
          </label>
          <select
            id="teamSize"
            value={teamSize}
            onChange={(e) => setTeamSize(e.target.value)}
            className="
              w-full
              rounded-md
              border border-gray-300
              px-3 py-2
              bg-white text-black
              focus:outline-none focus:ring-2 focus:ring-muted-gold
            "
          >
            <option value="" disabled>
              Select…
            </option>
            <option value="1-5">1 – 5</option>
            <option value="6-10">6 – 10</option>
            <option value="11-20">11 – 20</option>
            <option value="21+">21 +</option>
          </select>
        </div>

        {/* 3) Department (required dropdown) */}
        <div>
          <label htmlFor="department" className="block text-charcoal font-medium mb-1">
            Department *
          </label>
          <select
            id="department"
            value={department}
            onChange={(e) => setDepartment(e.target.value)}
            className="
              w-full
              rounded-md
              border border-gray-300
              px-3 py-2
              bg-white text-black
              focus:outline-none focus:ring-2 focus:ring-muted-gold
            "
          >
            <option value="" disabled>
              Select…
            </option>
            <option value="Marketing">Marketing</option>
            <option value="Engineering">Engineering</option>
            <option value="Sales">Sales</option>
            <option value="Operations">Operations</option>
            <option value="HR">HR</option>
          </select>
        </div>

        {/* 4) Use Case (required dropdown) */}
        <div>
          <label htmlFor="useCase" className="block text-charcoal font-medium mb-1">
            Use Case *
          </label>
          <select
            id="useCase"
            value={useCase}
            onChange={(e) => setUseCase(e.target.value)}
            className="
              w-full
              rounded-md
              border border-gray-300
              px-3 py-2
              bg-white text-black
              focus:outline-none focus:ring-2 focus:ring-muted-gold
            "
          >
            <option value="" disabled>
              Select…
            </option>
            <option value="Internal website">Internal website</option>
            <option value="Marketing collateral">Marketing collateral</option>
            <option value="Annual report">Annual report</option>
            <option value="Press kit">Press kit</option>
          </select>
        </div>

        {/* 5) Phone Number (optional) */}
        <div>
          <label htmlFor="phone" className="block text-charcoal font-medium mb-1">
            Phone Number (Optional)
          </label>
          <input
            id="phone"
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="+1 (123) 456-7890"
            className="
              w-full
              rounded-md
              border border-gray-300
              px-3 py-2
              bg-white text-black
              focus:outline-none focus:ring-2 focus:ring-muted-gold
            "
          />
        </div>

        {/* 6) Website (optional) */}
        <div>
          <label htmlFor="website" className="block text-charcoal font-medium mb-1">
            Website (Optional)
          </label>
          <input
            id="website"
            type="url"
            value={website}
            onChange={(e) => setWebsite(e.target.value)}
            placeholder="https://www.acme.com"
            className="
              w-full
              rounded-md
              border border-gray-300
              px-3 py-2
              bg-white text-black
              focus:outline-none focus:ring-2 focus:ring-muted-gold
            "
          />
        </div>

        {/* 7) Create Team Button */}
        <div className="pt-4">
          {/**
            If you do NOT have a custom Button component, replace the
            <Button> below with a plain <button> element like this:

            <button
              onClick={onCreateTeam}
              disabled={isCreateDisabled}
              className={`w-full py-2 px-4 rounded-md font-semibold
                ${isCreateDisabled
                  ? "bg-gray-300 text-charcoal cursor-not-allowed"
                  : "bg-muted-gold text-white hover:bg-sage-green"
                }`}
            >
              Create Team
            </button>
          **/}
          <Button
            onClick={onCreateTeam}
            disabled={isCreateDisabled}
            className={`
              w-full py-3 rounded-md font-semibold
              ${isCreateDisabled
                ? "bg-gray-300 text-charcoal cursor-not-allowed"
                : "bg-muted-gold text-white hover:bg-sage-green"
              }
            `}
          >
            Create Team
          </Button>
        </div>
      </div>
    </div>
  );
}
