// app/login/page.tsx

// 1. Force dynamic so Next.js doesn’t try to static-generate this route
export const dynamic = "force-dynamic";

import React from "react";
import LoginClient from "@/components/LoginClient";
// import LoginForm from "@/components/LoginForm";   // ← your real form
export default function LoginPage() {
  return (
    // 2. All client-only logic lives inside LoginClient
    <LoginClient>
      {/* 3. Your existing login UI/form */}
      {/* Replace with your actual login form component */}
      <div>Login Form Placeholder</div>
    </LoginClient>
  );
}
