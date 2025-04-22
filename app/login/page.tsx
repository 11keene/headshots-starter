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

type Inputs = {
  email: string;
};

export default function LoginPage({ host, searchParams }: {
  host: string | null;
  searchParams?: { [key: string]: string | string[] | undefined };
}) {
  // — all your hooks & handlers here —
  const supabase = createClientComponentClient<Database>();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isMagicLinkSent, setIsMagicLinkSent] = useState(false);
  const { toast } = useToast();
  const { register, handleSubmit, formState: { errors, isSubmitted } } = useForm<Inputs>();

  const onSubmit: SubmitHandler<Inputs> = async (data) => { /* … */ };
  const signInWithGoogle = async () => { /* … */ };
  const signInWithFacebook = async () => { /* … */ };
  const signInWithMagicLink = async (email: string) => { /* … */ };

  if (isMagicLinkSent) {
    return <WaitingForMagicLink toggleState={() => setIsMagicLinkSent(false)} />;
  }

  return (
    <div className="flex min-h-screen">
      {/* Left panel (hidden on mobile) */}
      <div className="hidden lg:flex flex-col justify-center items-center w-1/2 bg-neutral-100 p-10">
        {/* … your branding … */}
      </div>

      {/* Right panel (login form) */}
      <div className="flex justify-center lg:justify-end items-center w-full lg:w-1/2 px-6 lg:px-12 -translate-y-36">
        <div className="w-full max-w-md px-6 lg:ml-16 lg:mr-8">
          {/* Logo */}
          <div className="flex items-center gap-2 mb-4">
            <img src="/logo.png" alt="AI Maven Logo" className="w-8 h-8 rounded-full" />
            <span className="text-xl font-bold">AI Maven</span>
          </div>

          {/* Social Buttons */}
          <Button onClick={signInWithGoogle} className="…">Continue with Google</Button>
          <Button onClick={signInWithFacebook} className="… mt-2">Continue with Facebook</Button>

          {/* Divider */}
          <OR />

          {/* Email Magic-Link Form */}
          <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
            <div className="relative">
              <Input
                type="email"
                placeholder="Type your email address"
                {...register("email", { required: true })}
                className="pr-10"
              />
              <MdEmail className="absolute right-3 top-3 text-red-500" size={20} />
            </div>
            {isSubmitted && errors.email && (
              <span className="text-xs text-red-400">
                {errors.email?.message || "Email is required to sign in"}
              </span>
            )}
            <Button isLoading={isSubmitting} disabled={isSubmitting} variant="outline" className="w-full" type="submit">
              Continue with Email
            </Button>
          </form>

          {/* Terms & Guarantees */}
          <div className="flex flex-col items-start text-sm text-muted-foreground mt-6 px-1">
            <p className="text-[13px] mt-2 px-1">
              New accounts are subject to our{" "}
              <span className="underline cursor-pointer">Terms</span> and{" "}
              <span className="underline cursor-pointer">Privacy Policy</span>.
            </p>
            <div className="h-4" />
            <p className="text-sm font-semibold text-gray-800 flex items-center gap-2">
              <FaLock className="text-green-600 w-5 h-5" />
              Security built for Fortune 500 companies
            </p>
            <p className="text-sm font-semibold text-gray-800 flex items-center gap-2">
              <HiShieldCheck className="text-green-600 w-5 h-5" />
              100% Money Back Guarantee
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
