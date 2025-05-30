// app/login/components/Login.tsx
"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm, SubmitHandler } from "react-hook-form";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FaApple, FaFacebookF, FaLock } from "react-icons/fa";
import { FcGoogle } from "react-icons/fc";
import { HiShieldCheck } from "react-icons/hi";
import { MdEmail } from "react-icons/md";
import OR from "@/components/OR";
import WaitingForMagicLink from "./WaitingForMagicLink";
import { useToast } from "@/components/ui/use-toast";

type Inputs = { email: string };

export default function Login() {
  const router = useRouter();
  const params = useSearchParams();
  const supabase = createClientComponentClient();
  const { toast } = useToast();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isMagicLinkSent, setIsMagicLinkSent] = useState(false);

  // 1) Read the post-login target from ?redirectTo=...
  const redirectTo = params?.get("redirectTo") || "/overview";

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitted },
  } = useForm<Inputs>();

  // 2) After sign‐in, send them to redirectTo
  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "SIGNED_IN" && session) {
        router.replace(redirectTo);
      }
    });
    return () => subscription.unsubscribe();
  }, [redirectTo, router, supabase]);

  // 3) Send magic link to /login?redirectTo=<redirectTo>
  const onSubmit: SubmitHandler<Inputs> = async ({ email }) => {
    setIsSubmitting(true);
    const callbackUrl = `${window.location.origin}/login?redirectTo=${encodeURIComponent(
      redirectTo
    )}`;
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: callbackUrl },
    });
    setIsSubmitting(false);

    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      setIsMagicLinkSent(true);
    }
  };

  const socialSignIn = (provider: "google" | "facebook" | "apple") =>
    supabase.auth.signInWithOAuth({
      provider,
      options: {
        // OAuth uses a different callback; keep as is
        redirectTo: `${window.location.origin}/auth/v1/callback`,
      },
    });

  if (isMagicLinkSent) {
    return <WaitingForMagicLink toggleState={() => setIsMagicLinkSent(false)} />;
  }

  return (
    <div className="flex flex-col items-center gap-4 w-full max-w-md">
      {/* Logo + Title */}
      <div className="flex items-center gap-1 mb-4">
        <img src="/glogo.png" alt="AI Maven Logo" className="w-10 h-10 rounded-full" />
        <span className="text-xl font-bold">AI Maven</span>
      </div>

      {/* Social Buttons */}
      <Button onClick={() => socialSignIn("apple")} className="w-full flex items-center justify-center gap-2 rounded-md bg-black hover:bg-muted-gold text-white py-4 font-semibold transition border-warm-gray">
        <FaApple size={20} /> Continue with Apple
      </Button>
      <Button onClick={() => socialSignIn("google")} className="w-full flex items-center justify-center gap-2 rounded-md bg-white hover:bg-muted-gold text-charcoal py-4 font-semibold transition border border-warm-gray">
        <FcGoogle size={20} /> Continue with Google
      </Button>
      <Button onClick={() => socialSignIn("facebook")} className="w-full flex items-center justify-center gap-2 rounded-md bg-white hover:bg-muted-gold text-charcoal py-4 font-semibold transition border border-warm-gray">
        <FaFacebookF size={20} className="text-[#1877F2]" /> Continue with Facebook
      </Button>

      <OR />

      {/* Email Input */}
      <form onSubmit={handleSubmit(onSubmit)} className="w-full space-y-4">
        <div className="relative">
          <Input
            type="email"
            placeholder="Type your email address"
            {...register("email", { required: "Email is required" })}
            className="pr-10"
          />
          <MdEmail className="absolute right-3 top-3 text-muted-gold" size={20} />
        </div>
        {isSubmitted && errors.email && (
          <span className="text-xs text-white">{errors.email.message}</span>
        )}
        <Button
          type="submit"
          isLoading={isSubmitting}
          className="w-full bg-white text-charcoal font-semibold border border-warm-gray rounded px-4 py-2 hover:bg-muted-gold"
        >
          Continue with Email
        </Button>
      </form>

      {/* Legal & Trust */}
      <div className="text-center text-sm text-muted-foreground space-y-2 mt-6 px-4">
        <p>
          New accounts are subject to our{" "}
          <span className="underline cursor-pointer">Terms</span> and{" "}
          <span className="underline cursor-pointer">Privacy Policy</span>.
        </p>
        <p className="flex items-center justify-center font-semibold gap-2">
          <FaLock className="text-green-600" />
          Security built for Fortune 500 companies
        </p>
        <p className="flex items-center justify-center font-semibold gap-2">
          <HiShieldCheck className="text-green-600" />
          100% Money Back Guarantee
        </p>
      </div>
    </div>
  );
}
