"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { LogOut, Loader2 } from "lucide-react";
import { createClient } from "@/utils/supabase/client";

interface SignOutButtonProps {
  className?: string;
  label?: string;
}

const DEFAULT_CLASSNAME =
  "inline-flex items-center gap-1.5 text-sm font-medium text-slate-400 transition-colors hover:text-rose-400 disabled:cursor-not-allowed disabled:opacity-60";

/** The one place session termination happens — every signed-in shell
 * (student header, admin sidebar/mobile header) and the suspended/
 * unauthorized dead-ends all render this instead of duplicating the
 * signOut + redirect logic. */
export function SignOutButton({ className, label = "Sign out" }: SignOutButtonProps) {
  const router = useRouter();
  const [isSigningOut, setIsSigningOut] = useState(false);

  const handleSignOut = async () => {
    setIsSigningOut(true);
    try {
      const supabase = createClient();
      await supabase.auth.signOut();
    } finally {
      router.push("/auth/login");
      router.refresh();
    }
  };

  return (
    <button
      type="button"
      onClick={handleSignOut}
      disabled={isSigningOut}
      className={className ?? DEFAULT_CLASSNAME}
    >
      {isSigningOut ? (
        <Loader2 className="h-3.5 w-3.5 animate-spin" />
      ) : (
        <LogOut className="h-3.5 w-3.5" />
      )}
      {label}
    </button>
  );
}
