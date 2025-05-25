// components/AuthGuard.tsx
"use client";

import { ReactNode, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthState } from "@/lib/useAuth";

interface AuthGuardProps {
  children: ReactNode;
  adminOnly?: boolean;
}

export default function AuthGuard({ children, adminOnly = false }: AuthGuardProps) {
  const router = useRouter();
  const { isAuthenticated, isLoading, user, error } = useAuthState();

  useEffect(() => {
    if (!isLoading) {
      if (!isAuthenticated) {
        // Don't automatically sign in, just redirect to login
        router.push("/");
      } else if (adminOnly) {
        const userGroups = user?.profile?.['cognito:groups'] || [];
        const isAdmin = Array.isArray(userGroups) && userGroups.includes('Admin');
        
        if (!isAdmin) {
          router.push("/scan");
        }
      }
    }
  }, [isAuthenticated, isLoading, user, router, adminOnly]);

  // Show loading state or return children
  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Encountering error... {error.message}</div>;
  }

  if (!isAuthenticated) {
    return null; // Will be redirected by useEffect
  }

  if (adminOnly) {
    const userGroups = user?.profile?.['cognito:groups'] || [];
    const isAdmin = Array.isArray(userGroups) && userGroups.includes('Admin');
    
    if (!isAdmin) {
      return null; // Will be redirected by useEffect
    }
  }

  return <>{children}</>;
}