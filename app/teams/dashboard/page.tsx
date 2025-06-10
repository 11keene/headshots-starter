// File: app/teams/dashboard/page.tsx
"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ChevronDownIcon, CheckIcon } from "@heroicons/react/20/solid";
import { toast } from "sonner";

export default function TeamDashboardPage() {
  const router   = useRouter();
  const supabase = createClientComponentClient();

  // ─── Loading & Team State ─────────────────────────────────
  const [loading, setLoading]   = useState(true);
  const [teamInfo, setTeamInfo] = useState<{
    teamId:     string;
    teamName:   string;
    teamSize:   string;
    department: string;
    useCase:    string;
    phone:      string;
    website:    string;
  } | null>(null);

  useEffect(() => {
    (async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        router.push("/login?redirectTo=/teams");
        return;
      }
      // Fetch the single team row where owner_id == user.id
      const { data: team, error } = await supabase
        .from("teams")
        .select("*")
        .eq("owner_id", user.id)
        .single();

      if (error || !team) {
        // No team yet? Send to intake
        router.push("/teams");
      } else {
        setTeamInfo(team);
      }
      setLoading(false);
    })();
  }, [router, supabase]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        Loading…
      </div>
    );
  }

  // ─── Purchase Panel ───────────────────────────────────────
  const BASE_PRICE = parseFloat(process.env.NEXT_PUBLIC_PRICE_PER_SEAT || "49.99");
  const sizeNum    = parseInt(teamInfo!.teamSize, 10);


// NEW flat bands:
let discount: number;
if (sizeNum <= 5) {
  discount = 10;
} else if (sizeNum <= 10) {
  discount = 15;
} else if (sizeNum <= 20) {
  discount = 20;
} else {
  discount = 25;
}
  const total      = (sizeNum * BASE_PRICE * (1 - discount / 100)).toFixed(2);

  async function handleTeamCheckout() {
    try {
      const res = await fetch("/api/create-checkout-session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          packType: "team",
          quantity: sizeNum,
          teamId:   teamInfo!.teamId,
        }),
      });
      const { url } = await res.json();
      window.location.assign(url);
    } catch (err) {
      console.error("Checkout error", err);
      toast.error("Could not start checkout. Please try again.");
    }
  }

  // ─── Invite Link Logic ────────────────────────────────────
  const PUBLIC_URL = process.env.NEXT_PUBLIC_SITE_URL ?? window.location.origin;
  const [inviteLink, setInviteLink] = useState(
    `${PUBLIC_URL}/teams/join/${Date.now()}`
  );
  const handleGenerateNewLink = () =>
    setInviteLink(`${PUBLIC_URL}/teams/join/${Date.now()}`);
  const handleCopyLink = () => {
    navigator.clipboard.writeText(inviteLink);
    toast.success("Invite link copied!");
  };

  // ─── Stripe Headshot Logic ───────────────────────────────
  const userId    = "CURRENT_USER_ID";    // replace with real user.id
  const userEmail = "CURRENT_USER_EMAIL"; // replace with real user.email
  const handleCreateHeadshot = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/create-checkout-session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user_id:    userId,
          user_email: userEmail,
          packId:     "teams",
          extras:     [],
          teamId:     teamInfo!.teamId,
        }),
      });
      const { url } = await res.json();
      window.location.assign(url);
    } catch (err) {
      console.error(err);
      toast.error("Could not start headshot checkout.");
      setLoading(false);
    }
  };

  // ─── Invite by Email Logic ───────────────────────────────
  const [inviteEmails, setInviteEmails] = useState("");
  async function handleSendInvites() {
    if (!inviteEmails.trim()) {
      toast.error("Enter at least one email.");
      return;
    }
    const emails = inviteEmails
      .split(",")
      .map((e) => e.trim())
      .filter(Boolean);
    try {
      const res = await fetch("/api/teams/invite", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ emails, teamId: teamInfo!.teamId }),
      });
      if (!res.ok) throw new Error(await res.text());
      toast.success(`Invited ${emails.length} email(s).`);
      setInviteEmails("");
    } catch (err: any) {
      console.error("Invite error:", err);
      toast.error("Failed to send invites.");
    }
  }

  // ─── Dropdown State ───────────────────────────────────────
  const [menuOpen, setMenuOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node))
        setMenuOpen(false);
    }
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  // ─── Team Management Tabs ─────────────────────────────────
  const [activeTab, setActiveTab] = useState<"members"|"invites"|"headshots">("members");
  const membersCount  = 0;
  const invitesCount  = 0;
  const headshotsCount = 0;

  return (
    <div className="min-h-screen bg-muted/30 py-8 text-charcoal">
      <div className="max-w-4xl mx-auto px-4 space-y-6">
        {/* ─── Dropdown ───────────────────────────────────────── */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setMenuOpen((o) => !o)}
            className="inline-flex items-center gap-1 bg-white px-4 py-2 rounded shadow"
          >
            TEAM <ChevronDownIcon className="w-4 h-4" />
          </button>
          {menuOpen && (
            <div className="absolute left-0 mt-2 w-56 bg-white border rounded shadow z-10">
              <div className="px-4 py-2 text-gray-500 text-sm font-semibold">
                Personal Account
              </div>
              <button
                onClick={() => { setMenuOpen(false); router.push("/overview"); }}
                className="w-full text-left px-4 py-2 hover:bg-gray-100"
              >
                My Profile
              </button>
              <div className="border-t my-1" />
              <div className="px-4 py-2 text-gray-500 text-sm font-semibold">
                Teams
              </div>
              <button
                onClick={() => { setMenuOpen(false); /* same team */ }}
                className="w-full flex items-center justify-between px-4 py-2 hover:bg-gray-100"
              >
                {teamInfo!.teamName} <CheckIcon className="w-4 h-4 text-green-600"/>
              </button>
              <div className="border-t my-1" />
              <button
                onClick={() => { setMenuOpen(false); router.push("/teams"); }}
                className="w-full px-4 py-2 text-sm text-green-600 hover:bg-gray-100"
              >
                + Create Team
              </button>
            </div>
          )}
        </div>

        {/* ─── Header ──────────────────────────────────────────── */}
        <h1 className="text-3xl font-bold">
          {teamInfo!.teamName} Dashboard
        </h1>
        <p className="text-gray-700 mb-6">
          Welcome! Manage your team, invite members, or generate headshots.
        </p>

        {/* ─── Team Details ────────────────────────────────────── */}
        <Card className="mb-8 p-6">
          <h2 className="text-xl font-semibold text-green-600 mb-4">
            Team Details
          </h2>
          <div className="space-y-2">
            {["teamName","teamSize","department","useCase","phone","website"].map((k) => (
              <div key={k} className="flex">
                <span className="w-32 font-medium">{{
                  teamName: "Team Name",
                  teamSize: "Team Size",
                  department:"Department",
                  useCase:   "Use Case",
                  phone:     "Phone",
                  website:   "Website",
                }[k]}</span>
                <span>{(teamInfo as any)[k] || "—"}</span>
              </div>
            ))}
          </div>
        </Card>

        {/* ─── Actions ─────────────────────────────────────────── */}
        <div className="flex gap-4 mb-4">
          <Button
            className="flex-1"
            onClick={() => router.push(`/custom-intake?packType=headshots&teamId=${teamInfo!.teamId}`)}
          >
            Create headshots
          </Button>
          <Button
            className="flex-1"
            onClick={handleTeamCheckout}
          >
            Buy {teamInfo!.teamSize} seats ({discount}% off): ${total}
          </Button>
        </div>
         <p className="mt-2 text-sm italic text-gray-600">
          Your team of <strong>{sizeNum}</strong> {sizeNum === 1 ? "member" : "members"} 
          receives a <strong>{discount}%</strong> discount.
        </p>

        {/* ─── Invite Members ─────────────────────────────────── */}
        <Card className="mb-8 p-6">
          <h2 className="text-xl font-semibold text-green-600 mb-4 flex items-center gap-2">
            {/* user-plus icon */}
            <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none"
                 viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M16 11c1.38 0 …" />
            </svg>
            Invite Members
          </h2>
          <textarea
            rows={2}
            className="w-full border p-2 mb-2 rounded"
            placeholder="alice@example.com, bob@example.com"
            value={inviteEmails}
            onChange={(e) => setInviteEmails(e.target.value)}
          />
          <Button onClick={handleSendInvites} className="mr-2">
            Send Invites
          </Button>
          <div className="mt-4">
            <div className="mb-2">Invite by link</div>
            <div className="flex gap-2">
              <input
                readOnly
                className="flex-1 border p-2 rounded bg-gray-100"
                value={inviteLink}
              />
              <Button onClick={handleCopyLink}>Copy</Button>
            </div>
            <button
              className="text-green-600 underline mt-1 block"
              onClick={handleGenerateNewLink}
            >
              Generate new link
            </button>
          </div>
        </Card>

        {/* ─── Team Management Tabs ─────────────────────────────── */}
        <Card className="p-6">
          <h2 className="text-xl font-semibold text-green-600 mb-4 flex items-center gap-2">
            {/* menu icon */}
            <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none"
                 viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M4 6h16…" />
            </svg>
            Team Management
          </h2>
          <div className="flex gap-4 border-b mb-4">
            {["members","invites","headshots"].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab as any)}
                className={`pb-2 ${
                  activeTab===tab
                    ? "border-b-2 border-green-600 text-green-600"
                    : "text-gray-500"
                }`}
              >
                {tab==="members"
                  ? `Team members (${membersCount})`
                  : tab==="invites"
                  ? `Invites (${invitesCount})`
                  : `Headshots (${headshotsCount})`}
              </button>
            ))}
          </div>
          {activeTab==="members" && (
            <div className="py-16 text-center">No team members yet</div>
          )}
          {activeTab==="invites" && (
            <div className="py-16 text-center">No pending invites</div>
          )}
          {activeTab==="headshots" && (
            <div className="py-16 text-center">No headshots generated yet</div>
          )}
        </Card>
      </div>
    </div>
  );
}
