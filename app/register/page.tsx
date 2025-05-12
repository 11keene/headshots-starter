// File: app/register/page.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";

export default function RegisterPage() {
  const supabase = createClientComponentClient();
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg(null);

    // 1️⃣ Create the Supabase auth user
    const { data: signUpData, error: signUpError } =
      await supabase.auth.signUp({ email, password });

    if (signUpError) {
      setErrorMsg(signUpError.message);
      setLoading(false);
      return;
    }

    // 2️⃣ If signup succeeded, insert into our own "public.users" table
    if (signUpData?.user) {
      const userId = signUpData.user.id;

      const { error: insertError } = await supabase
        .from("users")
        .insert({ id: userId, credits: 0 });

      if (insertError) {
        console.error("❌ Failed to insert into users table:", insertError);
        // (but we don't block navigation—still let them in)
      }

      // 3️⃣ Sync to GHL as you already do
      try {
        const res = await fetch("/api/ghlSync", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            event: "user.created",
            user: {
              id: userId,
              email: signUpData.user.email,
            },
          }),
        });
        if (!res.ok) {
          console.error("GHL sync failed:", await res.text());
        } else {
          console.log("✅ GHL contact created for", signUpData.user.email);
        }
      } catch (err) {
        console.error("Fetch to /api/ghlSync failed:", err);
      }
    }

    setLoading(false);
    router.push("/welcome");
  };

  return (
    <div className="max-w-md mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">Create an Account</h1>
      {errorMsg && (
        <div className="mb-4 text-red-600 bg-dusty-coral p-2 rounded">
          {errorMsg}
        </div>
      )}
      <form onSubmit={handleSignUp} className="space-y-4">
        <div>
          <label htmlFor="email" className="block font-medium">
            Email
          </label>
          <input
            id="email"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full border rounded p-2 mt-1"
          />
        </div>
        <div>
          <label htmlFor="password" className="block font-medium">
            Password
          </label>
          <input
            id="password"
            type="password"
            required
            minLength={6}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full border rounded p-2 mt-1"
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-dusty-coral/90 text-white py-2 rounded hover:bg-dusty-coral/90 transition"
        >
          {loading ? "Signing up..." : "Sign Up"}
        </button>
      </form>
    </div>
  );
}
