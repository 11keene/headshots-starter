"use client";

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

export default async function Login({
  host,
  searchParams,
}: {
  host: string | null;
  searchParams?: { [key: string]: string | string[] | undefined };
}) {
  const supabase = createClientComponentClient<Database>();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isMagicLinkSent, setIsMagicLinkSent] = useState(false);
  const { toast } = useToast();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitted },
  } = useForm<Inputs>();

  const onSubmit: SubmitHandler<Inputs> = async (data) => {
    setIsSubmitting(true);
    try {
      await signInWithMagicLink(data.email);
      setTimeout(() => {
        setIsSubmitting(false);
        toast({
          title: "Email sent",
          description: "Check your inbox for a magic link to sign in.",
          duration: 5000,
        });
        setIsMagicLinkSent(true);
      }, 1000);
    } catch (error) {
      setIsSubmitting(false);
      toast({
        title: "Something went wrong",
        variant: "destructive",
        description:
          "Please try again, if the problem persists, contact us at support@aimavenstudio.com",
        duration: 5000,
      });
    }
  };

  const signInWithGoogle = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${host}/auth/callback` },
    });
    if (error) console.error("Google login error:", error.message);
  };

  const signInWithFacebook = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "facebook",
      options: { redirectTo: `${host}/auth/callback` },
    });
    if (error) console.error("Facebook login error:", error.message);
  };

  const signInWithMagicLink = async (email: string) => {
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: `${host}/auth/callback` },
    });
    if (error) console.log(`Error: ${error.message}`);
  };

  if (isMagicLinkSent) {
    return <WaitingForMagicLink toggleState={() => setIsMagicLinkSent(false)} />;
  }

  return (
    <div className="flex min-h-screen">
      {/* Left side - branding (will be hidden on mobile) */}
      <div className="hidden lg:flex flex-col justify-center items-center w-1/2 bg-neutral-100 p-10">
        <img src="/logo.png" alt="AI Maven Logo" className="w-20 h-20 mb-6 rounded-full" />
        <h1 className="text-3xl font-bold text-gray-800 mb-4 text-center">Welcome to AI Maven</h1>
        <p className="text-md text-gray-600 text-center max-w-md">
          Elevate your brand with stunning AI-generated headshots. Trusted by professionals worldwide.
        </p>
      </div>

      {/* Right side - login */}
      <div className="flex justify-end items-center w-full lg:w-1/2 pr-[12%] -translate-y-36">
        <div className="w-full max-w-md px-6 lg:ml-16 lg:mr-8">
          <div className="flex items-center gap-2 mb-4">
            <img src="/logo.png" alt="AI Maven Logo" className="w-8 h-8 rounded-full" />
            <span className="text-xl font-bold">AI Maven</span>
          </div>

          {/* Google login */}
          <Button
            onClick={signInWithGoogle}
            className="w-full flex items-center justify-center gap-2 rounded-md bg-red-600 hover:bg-red-700 text-white py-6 text-base font-semibold transition"
          >
            <div className="bg-white rounded-full p-1">
              <FcGoogle size={20} />
            </div>
            Continue with Google
          </Button>

          {/* Facebook login */}
          <Button
            onClick={signInWithFacebook}
            className="w-full flex items-center gap-3 justify-center bg-white text-black border border-neutral-200 shadow-sm hover:bg-neutral-100 transition-colors mt-2 py-6"
          >
            <div className="bg-[#1877F2] rounded-full w-6 h-6 flex items-center justify-center">
              <FaFacebookF className="text-white text-sm" />
            </div>
            <span className="text-sm font-medium">Continue with Facebook</span>
          </Button>

          <OR />

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

          {/* Terms and policies */}
          <div className="flex flex-col items-start text-sm text-muted-foreground mt-6 px-1">
            <p className="text-[13px] mt-2 text-muted-foreground px-1">
              New accounts are subject to our{" "}
              <span className="underline cursor-pointer">Terms</span> and{" "}
              <span className="underline cursor-pointer">Privacy Policy</span>.
            </p>
            <div className="h-4" />
            <p className="text-sm font-semibold text-gray-800 flex items-center justify-center gap-2">
              <FaLock className="text-green-600 w-5 h-3.5" /> Security built for Fortune 500 companies
            </p>
            <p className="text-sm font-semibold text-gray-800 flex items-center justify-center gap-2">
              <HiShieldCheck className="text-green-600 w-5 h-4" /> 100% Money Back Guarantee
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export const OR = () => {
  return (
    <div className="flex items-center my-1">
      <div className="border-b flex-grow mr-2 opacity-50" />
      <span className="text-sm opacity-50">OR</span>
      <div className="border-b flex-grow ml-2 opacity-50" />
    </div>
  );
};

