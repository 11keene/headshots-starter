// app/login/components/login.tsx
"use client";

import OR from "@/components/OR";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import { Database } from "@/types/supabase";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import disposableDomains from "disposable-email-domains";
import { useState } from "react";
import { SubmitHandler, useForm } from "react-hook-form";
import { FcGoogle } from "react-icons/fc";
import { FaFacebookF, FaLock } from "react-icons/fa";
import { HiShieldCheck } from "react-icons/hi";
import { MdEmail } from "react-icons/md";
import { WaitingForMagicLink } from "./WaitingForMagicLink";

type Inputs = { email: string };

export const Login = ({
  host,
  searchParams,
}: {
  host: string | null;
  searchParams?: Record<string, string | string[] | undefined>;
}) => {
  const supabase = createClientComponentClient<Database>();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isMagicLinkSent, setIsMagicLinkSent] = useState(false);
  const { toast } = useToast();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitted },
  } = useForm<Inputs>();

  // Build redirect URL for all flows
  const protocol = host?.includes("localhost") ? "http" : "https";
  const redirectUrl = `${protocol}://${host}/auth/callback`;

  // Magic‑link email flow
  const onSubmit: SubmitHandler<Inputs> = async ({ email }) => {
    setIsSubmitting(true);
    try {
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: { emailRedirectTo: redirectUrl },
      });
      if (error) throw error;
      setTimeout(() => {
        setIsSubmitting(false);
        toast({
          title: "Email sent",
          description: "Check your inbox for a magic link to sign in.",
          duration: 5000,
        });
        setIsMagicLinkSent(true);
      }, 1000);
    } catch (error: any) {
      setIsSubmitting(false);
      toast({
        title: "Something went wrong",
        variant: "destructive",
        description:
          error.message ||
          "Please try again, if the problem persists, contact us at support@aimavenstudio.com",
        duration: 5000,
      });
    }
  };

  // OAuth flows
  const signInWithGoogle = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: redirectUrl },
    });
    if (error) console.error("Google login error:", error.message);
  };
  const signInWithFacebook = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "facebook",
      options: { redirectTo: redirectUrl },
    });
    if (error) console.error("Facebook login error:", error.message);
  };

  if (isMagicLinkSent) {
    return <WaitingForMagicLink toggleState={() => setIsMagicLinkSent(false)} />;
  }

  return (
    <div className="flex min-h-screen">
      {/* Left side - branding (hidden on mobile) */}
      <div className="hidden lg:flex w-1/2 bg-neutral-100 p-10 flex-col items-center justify-center">
        <img
          src="/logo.png"
          alt="AI Maven Logo"
          className="w-20 h-20 mb-6 rounded-full"
        />
        <h1 className="text-3xl font-bold mb-4 text-center">
          Welcome to AI Maven
        </h1>
        <p className="text-center text-gray-600 max-w-md">
          Elevate your brand with stunning AI-generated headshots. Trusted by
          professionals worldwide.
        </p>
      </div>

      {/* Right side - login */}
      <div className="flex w-full lg:w-1/2 items-center justify-end pr-[12%] -translate-y-36">
        <div className="w-full max-w-md px-6 lg:ml-16 lg:mr-8">
          {/* Logo & title */}
          <div className="flex items-center gap-2 mb-4">
            <img
              src="/logo.png"
              alt="AI Maven Logo"
              className="w-8 h-8 rounded-full"
            />
            <span className="text-xl font-bold">AI Maven</span>
          </div>

          {/* Google */}
          <Button
            onClick={signInWithGoogle}
            className="w-full flex items-center justify-center gap-2 bg-red-600 hover:bg-red-700 text-white py-6 rounded-md font-semibold transition"
          >
            <div className="bg-white rounded-full p-1">
              <FcGoogle size={20} />
            </div>
            Continue with Google
          </Button>

          {/* Facebook */}
          <Button
            onClick={signInWithFacebook}
            className="w-full flex items-center justify-center gap-3 mt-2 py-6 bg-white text-black border border-neutral-200 shadow-sm hover:bg-neutral-100 transition"
          >
            <div className="bg-[#1877F2] rounded-full w-6 h-6 flex items-center justify-center">
              <FaFacebookF className="text-white text-sm" />
            </div>
            Continue with Facebook
          </Button>

          {/* OR divider */}
          <OR />

          {/* Email form */}
          <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
            <div className="relative">
              <Input
                type="email"
                placeholder="Type your email address"
                {...register("email", {
                  required: "Email is required to sign in",
                  validate: (value: string) =>
                    /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(value) ||
                    "Please enter a valid email",
                })}
                className="pr-10"
              />
              <MdEmail
                className="absolute right-3 top-3 text-red-500"
                size={20}
              />
            </div>
            {isSubmitted && errors.email && (
              <span className="text-xs text-red-400">
                {errors.email.message}
              </span>
            )}
            <Button
              isLoading={isSubmitting}
              disabled={isSubmitting}
              variant="outline"
              className="w-full"
              type="submit"
            >
              Continue with Email
            </Button>
          </form>

          {/* Terms & guarantees */}
          <div className="mt-6 space-y-4 text-sm text-muted-foreground px-1">
            <p className="text-[13px]">
              New accounts are subject to our{" "}
              <span className="underline cursor-pointer">Terms</span> and{" "}
              <span className="underline cursor-pointer">Privacy Policy</span>.
            </p>
            <p className="flex items-center gap-2 font-semibold text-gray-800">
              <FaLock className="text-green-600 w-5 h-4" /> Security built for
              Fortune 500 companies
            </p>
            <p className="flex items-center gap-2 font-semibold text-gray-800">
              <HiShieldCheck className="text-green-600 w=5 h-4" /> 100% Money Back
              Guarantee
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
