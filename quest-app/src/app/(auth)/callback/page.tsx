"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthState } from "@/lib/useAuth";

export default function AuthCallback() {
  const router = useRouter();
  const { isAuthenticated, isLoading, user, signin } = useAuthState();

  useEffect(() => {
    if (!isLoading) {
      if (isAuthenticated) {
        // Check if the user is in the Admin group
        const userGroups = user?.profile?.['cognito:groups'] || [];
        const isAdmin = Array.isArray(userGroups) && userGroups.includes('Admin');
        
        router.push(isAdmin ? "/admin" : "/client");
      } else {
        // Only sign in if we're on the callback page with a code parameter
        // This prevents auto sign-in after sign-out
        const url = new URL(window.location.href);
        if (url.pathname === "/callback" && url.searchParams.has("code")) {
          signin();
        } else {
          router.push("/");
        }
      }
    }
  }, [isAuthenticated, isLoading, user, router, signin]);

  return <p>Processing authentication...</p>;
}