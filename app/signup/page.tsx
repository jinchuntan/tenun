"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Loader2 } from "lucide-react";
import { AuthForm } from "@/components/auth-form";

function SignupInner() {
  const next = useSearchParams().get("next");
  return <AuthForm mode="signup" next={next} />;
}

export default function SignupPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-white flex items-center justify-center">
          <Loader2 className="w-6 h-6 animate-spin text-navy-400" />
        </div>
      }
    >
      <SignupInner />
    </Suspense>
  );
}
