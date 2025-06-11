"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";

export function DashboardDropdownToggle() {
  const supabase = createClientComponentClient(); // 👈 No types needed here now
  const router = useRouter();
  const pathname = usePathname();
  const [hasTeam, setHasTeam] = useState(false);
  const [selected, setSelected] = useState<"personal" | "team">(
    pathname.includes("/teams") ? "team" : "personal"
  );

useEffect(() => {
  async function checkForTeam() {
    const { data: { user } } = await supabase.auth.getUser();

    if (user) {
      const { data } = await supabase
        .from("teams")
        .select("id")
        .eq("owner_id", user.id)
        .maybeSingle();

        if (data) {
          setHasTeam(true);
        }
      }
    }

    checkForTeam();
  }, []);

  const handleSwitch = (value: "personal" | "team") => {
    setSelected(value);
    localStorage.setItem("lastDashboard", value);
    router.push(value === "personal" ? "/dashboard/overview" : "/teams/dashboard");
  };
const SHOW_TEAMS = false; // 👈 Turn this to true later when ready

  if (!hasTeam) return null;

  return (
    <div className="w-full flex justify-end px-4 pt-4">
      <select
        value={selected}
        onChange={(e) => handleSwitch(e.target.value as "personal" | "team")}
        className="border border-gray-300 rounded px-3 py-1 text-sm"
      >
        <option value="personal">My Headshots</option>
        <option value="team">Team Headshots</option>
      </select>
    </div>
  );
}
