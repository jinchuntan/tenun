"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Loader2 } from "lucide-react";
import { AuthForm } from "@/components/auth-form";

function LoginInner() {
  const next = useSearchParams().get("next") ?? "/dashboard";
  return <AuthForm mode="login" next={next} />;
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-white flex items-center justify-center">
          <Loader2 className="w-6 h-6 animate-spin text-navy-400" />
        </div>
      }
    >
      <LoginInner />
    </Suspense>
  );
}
