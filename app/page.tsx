"use client";

import { Button } from "@/components/ui/button";
import { ArrowRight, LogIn, UserPlus, ChevronRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useAuth } from "@clerk/nextjs";
import { Card, CardContent } from "@/components/ui/card";

export default function Home() {
  const { isSignedIn } = useAuth();

  return (
    <main className="min-h-screen">
      {/* Hero Section with Authentication CTA */}
      <section className="relative bg-gradient-to-b from-blue-50 to-white dark:from-gray-900 dark:to-gray-800">
        <div className="container px-4 py-16 md:py-24 mx-auto flex flex-col lg:flex-row items-center gap-12">
          <div className="flex-1 space-y-6">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight text-gray-900 dark:text-white">
              Empowering Growth Through{" "}
              <span className="text-blue-600 dark:text-blue-400">
                Accessible Capital
              </span>
            </h1>
            <p className="text-lg md:text-xl text-gray-600 dark:text-gray-300 max-w-2xl">
              Njuwa Capital provides flexible soft loans to help businesses and
              individuals achieve their financial goals with personalized
              repayment plans.
            </p>
            
            {/* Authentication Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-8">
              <Card className="bg-white dark:bg-gray-800 border-blue-100 dark:border-blue-900 hover:shadow-lg transition-all">
                <CardContent className="p-6">
                  <div className="flex flex-col items-center text-center space-y-4">
                    <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
                      <LogIn className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                    </div>
                    <h3 className="text-xl font-semibold">Existing Users</h3>
                    <p className="text-gray-600 dark:text-gray-400 mb-2">Already have an account? Sign in to access your dashboard.</p>
                    <Link href="/auth/sign-in" className="w-full">
                      <Button className="w-full">Sign In <ChevronRight className="ml-2 h-4 w-4" /></Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="bg-white dark:bg-gray-800 border-blue-100 dark:border-blue-900 hover:shadow-lg transition-all">
                <CardContent className="p-6">
                  <div className="flex flex-col items-center text-center space-y-4">
                    <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
                      <UserPlus className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                    </div>
                    <h3 className="text-xl font-semibold">New Users</h3>
                    <p className="text-gray-600 dark:text-gray-400 mb-2">Create a new account to get started with Njuwa Capital.</p>
                    <Link href="/auth/sign-up" className="w-full">
                      <Button variant="outline" className="w-full">Sign Up <ChevronRight className="ml-2 h-4 w-4" /></Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            </div>
            
            {/* Dashboard Access Button - Only shown if signed in */}
            {isSignedIn && (
              <div className="mt-6">
                <Link href="/dashboard">
                  <Button className="px-6 py-6 text-lg w-full md:w-auto">
                    Go to Dashboard <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </Link>
              </div>
            )}
          </div>
          
          <div className="flex-1 relative">
            <div className="relative w-full h-[400px] md:h-[500px]">
              <Image
                src="https://images.pexels.com/photos/7821757/pexels-photo-7821757.jpeg"
                alt="Loan management"
                fill
                className="object-cover rounded-xl shadow-2xl"
                priority
              />
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white dark:bg-gray-800">
        <div className="container px-4 mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-16 text-gray-900 dark:text-white">
            Why Choose Njuwa Capital
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
            {features.map((feature, index) => (
              <div
                key={index}
                className="p-6 bg-gray-50 dark:bg-gray-700 rounded-lg shadow-sm hover:shadow-md transition-shadow duration-300"
              >
                <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center mb-4">
                  <feature.icon className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                </div>
                <h3 className="text-xl font-semibold mb-3 text-gray-900 dark:text-white">
                  {feature.title}
                </h3>
                <p className="text-gray-600 dark:text-gray-300">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

    

      {/* Footer */}
      <footer className="bg-gray-50 dark:bg-gray-900 py-12">
        <div className="container px-4 mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="mb-6 md:mb-0">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                Njuwa Capital
              </h2>
              <p className="text-gray-600 dark:text-gray-300 mt-2">
                Empowering growth through accessible capital
              </p>
            </div>
            <div className="flex gap-8">
              <Link
                href="/about"
                className="text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400"
              >
                About Us
              </Link>
              <Link
                href="/contact"
                className="text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400"
              >
                Contact
              </Link>
              <Link
                href="/privacy"
                className="text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400"
              >
                Privacy Policy
              </Link>
            </div>
          </div>
          <div className="mt-8 pt-8 border-t border-gray-200 dark:border-gray-700 text-center text-gray-500 dark:text-gray-400">
            © {new Date().getFullYear()} Njuwa Capital. All rights reserved.
          </div>
        </div>
      </footer>
    </main>
  );
}

const features = [
  {
    title: "Quick Application Process",
    description:
      "Complete your loan application in minutes with our streamlined process.",
    icon: (props: any) => (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        {...props}
      >
        <path d="m5 12 5 5 9-9" />
      </svg>
    ),
  },
  {
    title: "Flexible Repayment Options",
    description:
      "Choose repayment terms that work for your business with customizable plans.",
    icon: (props: any) => (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        {...props}
      >
        <path d="M12 2v20" />
        <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
      </svg>
    ),
  },
  {
    title: "Personalized Support",
    description:
      "Our dedicated loan officers provide guidance throughout the entire loan process.",
    icon: (props: any) => (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        {...props}
      >
        <path d="M14 9a2 2 0 0 1-2 2H6l-4 4V4c0-1.1.9-2 2-2h8a2 2 0 0 1 2 2v5Z" />
        <path d="M18 9h2a2 2 0 0 1 2 2v11l-4-4h-6a2 2 0 0 1-2-2v-1" />
      </svg>
    ),
  },
  {
    title: "Competitive Rates",
    description:
      "Access capital with transparent fees and competitive interest rates.",
    icon: (props: any) => (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        {...props}
      >
        <circle cx="12" cy="12" r="10" />
        <path d="M16 8h-6a2 2 0 1 0 0 4h4a2 2 0 1 1 0 4H8" />
        <path d="M12 18V6" />
      </svg>
    ),
  },
  {
    title: "Quick Disbursement",
    description:
      "Receive funds quickly once your application is approved and processed.",
    icon: (props: any) => (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        {...props}
      >
        <path d="M12 2v20" />
        <path d="m17 5-5-3-5 3" />
        <path d="m17 19-5 3-5-3" />
        <path d="M20 10h-8a2 2 0 0 0-2 2v4" />
      </svg>
    ),
  },
  {
    title: "Transparent Process",
    description:
      "No hidden fees or surprise terms. We believe in complete transparency.",
    icon: (props: any) => (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        {...props}
      >
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10" />
        <path d="m9 12 2 2 4-4" />
      </svg>
    ),
  },
];