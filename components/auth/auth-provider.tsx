"use client";

import { useEffect } from "react";
import { useAuth } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { toast } from "@/hooks/use-toast";

export function AuthErrorHandler() {
  const { isLoaded, isSignedIn } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // Add a global error handler for Clerk token refresh errors
    const handleClerkError = (event: ErrorEvent) => {
      if (
        event.error?.message?.includes("ClerkJS: Token refresh failed") ||
        event.error?.message?.includes("ClerkJS: Network error")
      ) {
        console.error("Clerk authentication error:", event.error);
        
        // Show a toast notification
        toast({
          title: "Authentication Error",
          description: "Your session has expired. Please sign in again.",
          variant: "destructive",
        });
        
        // Redirect to sign-in page after a short delay
        setTimeout(() => {
          router.push("/auth/sign-in");
        }, 2000);
      }
    };

    window.addEventListener("error", handleClerkError);

    return () => {
      window.removeEventListener("error", handleClerkError);
    };
  }, [isLoaded, isSignedIn, router]);

  return null;
}

export default function AuthProvider({ children }: { children: React.ReactNode }) {
  return (
    <>
      <AuthErrorHandler />
      {children}
    </>
  );
}
