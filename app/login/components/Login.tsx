"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useForm, SubmitHandler } from "react-hook-form";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FaApple } from "react-icons/fa";
import { FcGoogle } from "react-icons/fc";
import { FaFacebookF, FaLock } from "react-icons/fa";
import { HiShieldCheck } from "react-icons/hi";
import { MdEmail } from "react-icons/md";
import OR from "@/components/OR";
import WaitingForMagicLink from "./WaitingForMagicLink";
import { useToast } from "@/components/ui/use-toast";

type Inputs = { email: string };

export default function Login({ redirectTo }: { redirectTo: string }) {
  const router = useRouter();
  const supabase = createClientComponentClient();

  // Removed invalid supabase.auth.update call

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isMagicLinkSent, setIsMagicLinkSent] = useState(false);
  const { toast } = useToast();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitted },
  } = useForm<Inputs>();

  // — as soon as this component mounts, if there's already a session, send them to /overview
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) router.replace("/overview");
    });

    // — listen for any new sign-in and redirect right away
    const { data: listener } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "SIGNED_IN" && session) {
        router.replace("/overview");
      }
    });
    return () => {
      listener.subscription.unsubscribe();
    };
  }, [supabase, router]);

  // magic-link handler
  const onSubmit: SubmitHandler<Inputs> = async ({ email }) => {
    setIsSubmitting(true);
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: redirectTo },
    });
    setIsSubmitting(false);

    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      setIsMagicLinkSent(true);
    }
  };

  // OAuth handler for Google/Facebook
  const socialSignIn = (provider: "google" | "facebook" | "apple") =>
      supabase.auth.signInWithOAuth({ provider });

  if (isMagicLinkSent) {
    return <WaitingForMagicLink toggleState={() => setIsMagicLinkSent(false)} />;
  }

  return (
    <div className="flex flex-col items-center gap-4 w-full max-w-md">
      {/* Logo */}
      <div className="flex items-center gap-2 mb-4">
        <img src="/logo.png" alt="AI Maven Logo" className="w-8 h-8 rounded-full" />
        <span className="text-xl font-bold">AI Maven</span>
      </div>
{/* Apple OAuth button */}
<Button
  onClick={() => socialSignIn("apple")}
  className="w-full flex items-center justify-center gap-2 rounded-md bg-black hover:opacity-90 text-white py-4 font-semibold transition"
>
  <FaApple size={20} />
  Continue with Apple
</Button>
      {/* Google */}
      <Button
        onClick={() => socialSignIn("google")}
        className="w-full flex items-center justify-center gap-2 rounded-md bg-red-600 hover:bg-red-700 text-white py-4 font-semibold transition"
      >
        <div className="bg-white rounded-full p-1">
          <FcGoogle size={20} />
        </div>
        Continue with Google
      </Button>

      {/* Facebook */}
      <Button
        onClick={() => socialSignIn("facebook")}
        className="w-full flex items-center justify-center gap-2 rounded-md bg-[#1877F2] hover:bg-blue-700 text-white py-4 font-semibold transition"
      >
        <FaFacebookF size={20} />
        Continue with Facebook
      </Button>

      {/* Divider */}
      <OR />

      {/* Magic link form */}
      <form onSubmit={handleSubmit(onSubmit)} className="w-full space-y-4">
        <div className="relative">
          <Input
            type="email"
            placeholder="Type your email address"
            {...register("email", { required: "Email is required" })}
            className="pr-10"
          />
          <MdEmail className="absolute right-3 top-3 text-red-500" size={20} />
        </div>
        {isSubmitted && errors.email && (
          <span className="text-xs text-red-400">{errors.email.message}</span>
        )}
      <Button
  type="submit"
  isLoading={isSubmitting}
   className="w-full bg-white text-black font-semibold border border-gray-300 rounded px-4 py-2 hover:bg-gray-100"
>
  Continue with Email
</Button>
      </form>

      {/* Terms & guarantees */}
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
