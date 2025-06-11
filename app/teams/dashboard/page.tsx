// File: app/teams/dashboard/page.tsx
"use client";

import React, { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { CheckIcon, ChevronDownIcon } from "@heroicons/react/20/solid";
import { toast } from "sonner";

export default function TeamDashboardPage() {
  const router = useRouter();
  const supabase = createClientComponentClient();
  const PUBLIC_URL = process.env.NEXT_PUBLIC_SITE_URL ?? window.location.origin;

  const [loading, setLoading] = useState(true);
  const [team, setTeam] = useState<any>(null);
  const [inviteEmails, setInviteEmails] = useState("");
  const [inviteLink, setInviteLink] = useState("loading...");
  const [menuOpen, setMenuOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<"members" | "invites" | "headshots">("members");
  const dropdownRef = useRef<HTMLDivElement>(null);

  const membersCount = 0;
  const invitesCount = 0;
  const headshotsCount = 0;

  // ─── Load team or redirect ──────────────────────────────
  useEffect(() => {
    (async () => {
      const res = await fetch("/api/teams");
      if (res.status === 200) {
        const data = await res.json();
        setTeam(data);
        setInviteLink(`${PUBLIC_URL}/teams/join/${data.id}`);
      } else {
        router.push("/teams"); // redirect to intake if no team
      }
      setLoading(false);
    })();
  }, [PUBLIC_URL, router]);

  // ─── Invite Members ─────────────────────────────────────
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
        body: JSON.stringify({ emails, teamId: team.id }),
      });

      if (!res.ok) throw new Error(await res.text());

      toast.success(`Invited ${emails.length} email(s).`);
      setInviteEmails("");
    } catch (err: any) {
      console.error("Invite error:", err);
      toast.error("Failed to send invites.");
    }
  }

  // ─── Generate & Copy Invite Link ────────────────────────
  const handleGenerateNewLink = () => {
    const newLink = `${PUBLIC_URL}/teams/join/${team.id}?t=${Date.now()}`;
    setInviteLink(newLink);
  };
  const handleCopyLink = () => {
    navigator.clipboard.writeText(inviteLink);
    toast.success("Invite link copied!");
  };

  // ─── Close dropdown when clicking outside ───────────────
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading…</div>;
  }

  return (
    <div className="min-h-screen bg-muted/30 py-8 text-charcoal">
      <div className="max-w-4xl mx-auto px-4 space-y-6">
        {/* Dropdown Menu */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setMenuOpen((o) => !o)}
            className="inline-flex items-center gap-1 bg-white px-4 py-2 rounded shadow"
          >
            TEAM <ChevronDownIcon className="w-4 h-4" />
          </button>
          {menuOpen && (
            <div className="absolute left-0 mt-2 w-56 bg-white border rounded shadow z-10">
              <div className="px-4 py-2 text-gray-500 text-sm font-semibold">Personal Account</div>
              <button
                onClick={() => { setMenuOpen(false); router.push("/overview"); }}
                className="w-full text-left px-4 py-2 hover:bg-gray-100"
              >
                My Profile
              </button>
              <div className="border-t my-1" />
              <div className="px-4 py-2 text-gray-500 text-sm font-semibold">Teams</div>
              <button
                onClick={() => { setMenuOpen(false); }}
                className="w-full flex items-center justify-between px-4 py-2 hover:bg-gray-100"
              >
                {team.team_name} <CheckIcon className="w-4 h-4 text-green-600" />
              </button>
            </div>
          )}
        </div>

        {/* Header */}
        <h1 className="text-3xl font-bold">{team.team_name} Dashboard</h1>
        <p className="text-gray-700 mb-6">Welcome! Manage your team, invite members, or generate headshots.</p>

        {/* Invite Members */}
        <Card className="p-6">
          <h2 className="text-xl font-semibold text-green-600 mb-4">Invite Members</h2>
          <textarea
            rows={2}
            className="w-full border p-2 mb-2 rounded"
            placeholder="alice@example.com, bob@example.com"
            value={inviteEmails}
            onChange={(e) => setInviteEmails(e.target.value)}
          />
          <Button onClick={handleSendInvites} className="mr-2">Send Invites</Button>

          <div className="mt-4">
            <div className="mb-2">Invite by link</div>
            <div className="flex gap-2">
              <input readOnly className="flex-1 border p-2 rounded bg-gray-100" value={inviteLink} />
              <Button onClick={handleCopyLink}>Copy</Button>
            </div>
            <button className="text-green-600 underline mt-1 block" onClick={handleGenerateNewLink}>
              Generate new link
            </button>
          </div>
        </Card>

        {/* Tabs */}
        <Card className="p-6">
          <h2 className="text-xl font-semibold text-green-600 mb-4">Team Management</h2>
          <div className="flex gap-4 border-b mb-4">
            {["members", "invites", "headshots"].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab as any)}
                className={`pb-2 ${activeTab === tab
                  ? "border-b-2 border-green-600 text-green-600"
                  : "text-gray-500"
                  }`}
              >
                {tab === "members"
                  ? `Team members (${membersCount})`
                  : tab === "invites"
                    ? `Invites (${invitesCount})`
                    : `Headshots (${headshotsCount})`}
              </button>
            ))}
          </div>

          {activeTab === "members" && <div className="py-16 text-center">No team members yet</div>}
          {activeTab === "invites" && <div className="py-16 text-center">No pending invites</div>}
          {activeTab === "headshots" && <div className="py-16 text-center">No headshots generated yet</div>}
        </Card>
      </div>
    </div>
  );
}
