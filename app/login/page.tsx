// app/login/page.tsx
"use client";

import React from "react";
import { Auth } from "@supabase/auth-ui-react";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { ThemeSupa } from "@supabase/auth-ui-shared";

export default function LoginPage() {
  const supabase = createClientComponentClient();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="w-full max-w-md bg-white p-6 rounded-lg shadow">
        <h1 className="text-2xl font-bold mb-4 text-center">Sign In</h1>
        <Auth
          supabaseClient={supabase}
          providers={["google", "facebook", "apple"]}
          socialLayout="horizontal"
          appearance={{ theme: ThemeSupa }}
          redirectTo="/overview"
        />
      </div>
    </div>
  );
}
