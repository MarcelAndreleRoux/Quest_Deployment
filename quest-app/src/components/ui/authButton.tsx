"use client";

import { useAuthState } from "@/lib/useAuth";
import { Button } from "./button";

export default function AuthButton() {
  const { isAuthenticated, isLoading, signin, signup, signout } = useAuthState();

  if (isLoading) return <p>Loading...</p>;

  return isAuthenticated ? (
    <Button variant={"destructive"} onClick={() => signout()}>Sign out</Button>
  ) : (
    <div className="flex gap-4">
      <Button variant={"default"} onClick={() => signin()}>Sign in</Button>
      <Button variant={"secondary"} onClick={() => signup()}>Sign up</Button>
    </div>
  );
}