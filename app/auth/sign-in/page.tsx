"use client";

import { SignIn } from "@clerk/nextjs";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function SignInPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 p-4">
      <div className="w-full max-w-md">
        <Link 
          href="/" 
          className="flex items-center text-sm text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 mb-4"
        >
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to home
        </Link>
        
        <div className="w-full">
          <SignIn 
            appearance={{
              elements: {
                rootBox: "mx-auto w-full",
                card: "shadow-lg rounded-lg border border-gray-200 dark:border-gray-700",
                headerTitle: "text-2xl font-bold",
                headerSubtitle: "text-gray-500 dark:text-gray-400",
                formButtonPrimary: "bg-blue-600 hover:bg-blue-700 text-white",
                footerAction: "text-blue-600 hover:text-blue-700",
              }
            }}
            routing="path"
            path="/auth/sign-in"
            signUpUrl="/auth/sign-up"
            redirectUrl="/dashboard"
          />
        </div>
      </div>
    </div>
  );
}