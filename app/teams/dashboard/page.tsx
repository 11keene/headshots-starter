// File: app/teams/dashboard/page.tsx
"use client";
import { DashboardDropdownToggle } from "@/components/DashboardDropdownToggle";
import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ChevronDownIcon, CheckIcon } from "@heroicons/react/20/solid"; // or your icon library

export default function TeamDashboardPage() {
  const router = useRouter();

  // ─── Loading state for redirect ──────────────────────────────
  const [loading, setLoading] = useState(false);
const SHOW_TEAMS = false; // 👈 Turn this to true later when ready

  // ─── Credits purchase local state ─────────────────────────────
  const [creditsToBuy, setCreditsToBuy] = useState<number>(0);
  const incrementCredits = () => {
    setCreditsToBuy((prev) => prev + 1);
  };
  const decrementCredits = () => {
    setCreditsToBuy((prev) => Math.max(prev - 1, 0));
  };

  // ─── “Active Team” info from localStorage ──────────────────────
  const [teamInfo, setTeamInfo] = useState<{
    teamName: string;
    teamSize: string;
    department: string;
    useCase: string;
    phone: string;
    website: string;
  } | null>(null);

  useEffect(() => {
    try {
      const stored = localStorage.getItem("teamInfo");
      if (stored) {
        setTeamInfo(JSON.parse(stored));
      } else {
        // If no teamInfo, redirect to intake form:
        router.push("/teams/intake");
      }
    } catch (e) {
      console.error("Failed to parse teamInfo from localStorage", e);
      router.push("/teams/intake");
    }
  }, [router]);
useEffect(() => {
  localStorage.setItem("lastDashboard", "personal"); // Or "team"
}, []);
  // ─── “Personal ↕ Teams” DROPDOWN STATE ─────────────────────────
  const [menuOpen, setMenuOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
useEffect(() => {
  localStorage.setItem("lastDashboard", "team");
}, []);

  // Close dropdown if clicked outside:
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [dropdownRef]);

  // ─── Invite Link Logic ────────────────────────────────────────
  // (You already have this working — just kept it here for completeness.)
  const [inviteLink, setInviteLink] = useState(
    `https://dashboard.yoursite.com/invite/${Date.now()}`
  );
  const handleGenerateNewLink = () => {
    const newToken = Date.now();
    setInviteLink(`https://dashboard.yoursite.com/invite/${newToken}`);
  };
  const handleCopyLink = () => {
    navigator.clipboard.writeText(inviteLink).then(() => {
      alert("Link copied to clipboard!");
    });
  };

  // ─── Stripe/Create Headshot Logic ─────────────────────────────
  // (Assuming you still want teams to go through a checkout session.)
  // Replace `"CURRENT_USER_ID"` and `"CURRENT_USER_EMAIL"` with your auth logic:
  const userId = "CURRENT_USER_ID";
  const userEmail = "CURRENT_USER_EMAIL";
  const handleCreateHeadshot = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/create-checkout-session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user_id: userId,
          user_email: userEmail,
          packId: "teams",
          extras: [],
          teamId: inviteLink.split("/invite/")[1],
        }),
      });
      const data = await res.json();
      if (data.url) {
        window.location.assign(data.url);
      } else {
        console.error("Stripe checkout URL not returned:", data);
        setLoading(false);
      }
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  };

  // ─── Invite by Email Logic ────────────────────────────────────
  const [inviteEmails, setInviteEmails] = useState("");
  const handleSendInvites = () => {
    if (!inviteEmails.trim()) {
      alert("Please enter at least one email address.");
      return;
    }
    // TODO: Replace alert with a real backend call to send invites via your API
    alert(`Invites sent to: ${inviteEmails}`);
    setInviteEmails("");
  };

  return (
    <div className="min-h-screen bg-muted/30 py-8 text-charcoal">
      <div className="max-w-4xl mx-auto px-4 space-y-6">
        {/* ─── PERSONAL / TEAMS DROPDOWN ───────────────────────────── */}
        <div className="relative" ref={dropdownRef}>
          <button
            type="button"
            onClick={() => setMenuOpen((prev) => !prev)}
            className="inline-flex items-center gap-1 bg-white text-charcoal font-medium px-4 py-2 rounded-md shadow hover:bg-gray-100"
          >
            <span className="uppercase text-sm tracking-wide">Team</span>
            <ChevronDownIcon className="w-4 h-4 text-charcoal" />
          </button>

          {menuOpen && (
            <div className="absolute left-0 mt-2 w-56 bg-white border border-gray-200 rounded-md shadow-lg z-50">
              {/* ─── Personal Account Section ───────────────────────── */}
              <div className="px-4 py-2 text-gray-500 text-sm font-semibold">
                Personal Account
              </div>
              <button
                onClick={() => {
                  setMenuOpen(false);
                  router.push("/overview");
                }}
                className="w-full text-left px-4 py-2 hover:bg-gray-100"
              >
                {/* 
                  You can replace `"My Profile"` with dynamic user name if available, e.g.:
                  {session?.user?.name || "My Profile"}
                */}
                My Profile
              </button>

              <div className="my-1 border-t border-gray-200" />

              {/* ─── Teams Section ───────────────────────────────────── */}
              <div className="px-4 py-2 text-gray-500 text-sm font-semibold">
                Teams
              </div>
              {teamInfo && (
                <button
                  onClick={() => {
                    setMenuOpen(false);
                    // We’re already on this team’s dashboard,
                    // but if you had multiple teams, you’d switch here.
                  }}
                  className="w-full flex items-center justify-between px-4 py-2 hover:bg-gray-100"
                >
                  <span className="text-charcoal">{teamInfo.teamName}</span>
                  <CheckIcon className="w-4 h-4 text-muted-gold" />
                </button>
              )}
              {!teamInfo && (
                <div className="px-4 py-2 text-gray-400 italic text-sm">
                  No teams yet
                </div>
              )}

              <div className="my-1 border-t border-gray-200" />

              {/* ─── + Create Team Button ────────────────────────────── */}
              <button
                onClick={() => {
                  setMenuOpen(false);
                  router.push("/teams/intake");
                }}
                className="w-full text-left px-4 py-2 text-sm text-muted-gold font-semibold hover:bg-gray-100"
              >
                + Create Team
              </button>
            </div>
          )}
        </div>

        {/* ─── PAGE HEADER ──────────────────────────── */}
        <h1 className="text-3xl font-bold mb-2">
          {teamInfo ? `${teamInfo.teamName} Dashboard` : "Team Dashboard"}
        </h1>
        <p className="text-neutral-700 mb-8">
          {teamInfo
            ? `Welcome! You are the admin of ${teamInfo.teamName}. Purchase credits, invite team members, manage your team, and more.`
            : "Welcome! You are the admin of your team. Purchase credits, invite team members, manage your team, and more."}
        </p>

        {/* ─── TEAM DETAILS SECTION ───────────────────── */}
        {teamInfo && (
          <Card className="mb-8 p-6 bg-white text-charcoal">
            <h2 className="text-xl font-semibold mb-4 text-muted-gold">
              Team Details
            </h2>
            <div className="space-y-2">
              <div className="flex">
                <span className="w-32 font-medium">Team Name:</span>
                <span>{teamInfo.teamName}</span>
              </div>
              <div className="flex">
                <span className="w-32 font-medium">Team Size:</span>
                <span>{teamInfo.teamSize}</span>
              </div>
              <div className="flex">
                <span className="w-32 font-medium">Department:</span>
                <span>{teamInfo.department}</span>
              </div>
              <div className="flex">
                <span className="w-32 font-medium">Use Case:</span>
                <span>{teamInfo.useCase}</span>
              </div>
              <div className="flex">
                <span className="w-32 font-medium">Phone:</span>
                <span>{teamInfo.phone || "—"}</span>
              </div>
              <div className="flex">
                <span className="w-32 font-medium">Website:</span>
                <span>{teamInfo.website || "—"}</span>
              </div>
            </div>
          </Card>
        )}

        {/* ─── BUTTON ROW ───────────────────────────── */}
        <div className="flex flex-col sm:flex-row gap-4 mb-8">
          <Button
            className="flex-1 bg-muted-gold text-ivory"
            onClick={() => router.push("/teams/dashboard/customize")}
          >
            Customize headshots
          </Button>
          <Button
            className="flex-1 bg-muted-gold text-ivory"
            onClick={handleCreateHeadshot}
            disabled={loading}
          >
            {loading ? "Redirecting…" : "Create headshots"}
          </Button>
        </div>

        {/* ─── CREDITS PANEL ───────────────────────── */}
        <Card className="mb-8 p-6 bg-white text-charcoal">
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2 text-muted-gold">
            {/* Coin icon */}
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="w-6 h-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8c-3.866 0-7 1.79-7 4s3.134 4 7 4 7-1.79 7-4-3.134-4-7-4z"
              />
            </svg>
            Credits
          </h2>

          <div className="flex items-center justify-between">
            <div>
              <p className="text-neutral-500">Available credits: 0</p>
            </div>
            <div className="flex items-center gap-2">
              {/* Decrement */}
              <button
                onClick={decrementCredits}
                disabled={creditsToBuy <= 0}
                className="px-2 py-1 bg-slate-200 rounded disabled:opacity-50"
              >
                −
              </button>
              <span className="min-w-[1.5rem] text-center">
                {creditsToBuy}
              </span>
              {/* Increment */}
              <button
                onClick={incrementCredits}
                className="px-2 py-1 bg-slate-200 rounded hover:bg-slate-300"
              >
                +
              </button>
              <Button
                className="ml-4 bg-muted-gold text-ivory"
                onClick={() => {
                  console.log("Purchasing", creditsToBuy, "credits");
                  // Integrate your real purchase flow here
                }}
              >
                Purchase
              </Button>
            </div>
          </div>
        </Card>

        {/* ─── INVITE MEMBERS PANEL ──────────────────── */}
        <Card className="mb-8 p-6 bg-white text-charcoal">
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2 text-muted-gold">
            {/* User‐plus icon */}
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="w-6 h-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M16 11c1.38 0 2.5-1.12 2.5-2.5S17.38 6 16 6s-2.5 1.12-2.5 2.5S14.62 11 16 11zM8 11c1.38 0 2.5-1.12 2.5-2.5S9.38 6 8 6 5.5 7.12 5.5 8.5 6.62 11 8 11z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8 13a3.5 3.5 0 00-3.5 3.5V20h7v-3.5A3.5 3.5 0 008 13zM16 13a3.5 3.5 0 00-3.5 3.5V20h7v-3.5A3.5 3.5 0 0016 13z"
              />
            </svg>
            Invite Members
          </h2>

          {/* Invite by email */}
          <div className="mb-6">
            <label className="block text-neutral-700 mb-2">
              Invite by email (comma-separate multiple)
            </label>
            <textarea
              rows={2}
              placeholder="e.g. alice@example.com, bob@example.com"
              className="w-full border border-gray-300 rounded px-3 py-2 mb-2"
              value={inviteEmails}
              onChange={(e) => setInviteEmails(e.target.value)}
            />
            <Button
              onClick={handleSendInvites}
              className="bg-muted-gold text-ivory"
            >
              Send Invites
            </Button>
          </div>

          {/* Invite by link */}
          <div>
            <label className="block text-neutral-700 mb-2">Invite by link</label>
            <div className="flex gap-2">
              <input
                type="text"
                value={inviteLink}
                readOnly
                className="flex-1 border border-gray-300 rounded px-3 py-2 bg-gray-100"
              />
              <Button
                onClick={handleCopyLink}
                className="bg-muted-gold text-ivory"
              >
                Copy
              </Button>
            </div>
            <p className="text-sm text-neutral-500 mt-1">
              <button
                onClick={handleGenerateNewLink}
                className="text-muted-gold underline"
              >
                Generate new link
              </button>
            </p>
          </div>
        </Card>

        {/* ─── TEAM MANAGEMENT PANEL ─────────────────── */}
        <Card className="p-6 bg-white text-charcoal">
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2 text-muted-gold">
            {/* Team icon */}
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="w-6 h-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 6h16M4 10h16M4 14h16M4 18h16"
              />
            </svg>
            Team Management
          </h2>

          {/* Tabs: Team Members / Invites / Headshots */}
          <div className="flex gap-4 border-b mb-4">
            <button className="pb-2 border-b-2 border-muted-gold text-muted-gold">
              Team members (0)
            </button>
            <button className="pb-2 text-neutral-600">Invites (0)</button>
            <button className="pb-2 text-neutral-600">Headshots (0)</button>
          </div>

          {/* “No team members yet” placeholder */}
          <div className="text-center py-16">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="mx-auto w-12 h-12 text-neutral-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M16 11c1.38 0 2.5-1.12 2.5-2.5S17.38 6 16 6s-2.5 1.12-2.5 2.5S14.62 11 16 11zM8 11c1.38 0 2.5-1.12 2.5-2.5S9.38 6 8 6 5.5 7.12 5.5 8.5 6.62 11 8 11z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8 13a3.5 3.5 0 00-3.5 3.5V20h7v-3.5A3.5 3.5 0 008 13zM16 13a3.5 3.5 0 00-3.5 3.5V20h7v-3.5A3.5 3.5 0 0016 13z"
              />
            </svg>
            <h3 className="mt-4 text-lg font-medium text-neutral-700">
              No team members yet
            </h3>
            <p className="mt-2 text-neutral-500">
              Once team members start joining your team, you can view their
              status here.
            </p>
            <Button
              onClick={() => router.push("/teams/dashboard/invite")}
              className="mt-6 bg-muted-gold text-ivory"
            >
              Invite members
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
}
