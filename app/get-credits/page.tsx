// Updated Team Dashboard Page
// File: app/teams/dashboard/page.tsx

"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { DashboardDropdownToggle } from "@/components/DashboardDropdownToggle";
import { ChevronDownIcon, CheckIcon } from "@heroicons/react/20/solid";
import { createPagesBrowserClient } from "@supabase/auth-helpers-nextjs";

export default function TeamDashboardPage() {
  const router = useRouter();
  const supabase = createPagesBrowserClient();

  // State
  const [teamInfo, setTeamInfo] = useState<any>(null);
  const [inviteEmails, setInviteEmails] = useState("");
  const [inviteLink, setInviteLink] = useState("");
  const [loading, setLoading] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const dropdownRef = useRef<null | HTMLDivElement>(null);

  // Load teamInfo from localStorage
  useEffect(() => {
    const stored = localStorage.getItem("teamInfo");
    if (!stored) return router.push("/teams/intake");
    setTeamInfo(JSON.parse(stored));
    // generate invite link
    const tid = JSON.parse(stored).teamId;
    setInviteLink(`${window.location.origin}/teams/join/${tid}`);
  }, [router]);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  // Invite via email
  const sendInvites = async () => {
    if (!inviteEmails.trim()) return;
    setLoading(true);
    const emails = inviteEmails.split(',').map(e=>e.trim()).filter(Boolean);
    // call your API to send invites
    await fetch('/api/teams/invite', {
      method: 'POST',
      headers: { 'Content-Type':'application/json' },
      body: JSON.stringify({ teamId: teamInfo.teamId, emails })
    });
    setLoading(false);
    setInviteEmails("");
    alert('Invites sent');
  };

  // Copy link
  const copyLink = () => {
    navigator.clipboard.writeText(inviteLink);
    alert('Link copied!');
  };

  if (!teamInfo) return null;

  return (
    <div className="min-h-screen bg-muted/10 p-8">
      <DashboardDropdownToggle />
      <div className="max-w-3xl mx-auto space-y-6">
        <h1 className="text-3xl font-bold">{teamInfo.teamName} Dashboard</h1>

        {/* Invite Section */}
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">Invite Team Members</h2>
          <textarea
            rows={2}
            className="w-full border p-2 mb-2"
            placeholder="Enter emails, comma-separated"
            value={inviteEmails}
            onChange={e => setInviteEmails(e.target.value)}
          />
          <Button onClick={sendInvites} disabled={loading} className="mr-2">
            {loading ? 'Sending…' : 'Send Invites'}
          </Button>
          <Button onClick={copyLink} variant="outline">
            Copy Invite Link
          </Button>
        </Card>

        {/* Quick Actions */}
        <div className="flex gap-4">
          <Button className="flex-1" onClick={() => router.push('/teams/credits')}>Purchase Credits</Button>
          <Button className="flex-1" onClick={() => router.push(`/teams/join/${teamInfo.teamId}`)}>
            Team Member Portal
          </Button>
        </div>
      </div>
    </div>
  );
}
