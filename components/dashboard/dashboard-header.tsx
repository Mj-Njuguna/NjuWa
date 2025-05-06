"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useClerk, useUser } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ModeToggle } from "@/components/mode-toggle";
import { 
  Menu, 
  X, 
  Search, 
  PlusCircle, 
  LayoutDashboard, 
  FileText, 
  Settings, 
  LogOut,
  User 
} from "lucide-react";

export default function DashboardHeader() {
  const { signOut } = useClerk();
  const { user, isLoaded } = useUser();
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [userName, setUserName] = useState<string | null>(null);
  const [userEmail, setUserEmail] = useState<string | null>(null);

  // Process user data when it's loaded
  useEffect(() => {
    if (isLoaded && user) {
      // Get profile image (prioritize Google provider image if available)
      const googleAccount = user.externalAccounts?.find(account => 
        account.provider.toLowerCase() === 'google'
      );
      
      if (googleAccount?.imageUrl) {
        setProfileImage(googleAccount.imageUrl);
      } else if (user.imageUrl) {
        setProfileImage(user.imageUrl);
      }
      
      // Get user name (prioritize Google provider name if available)
      if (googleAccount?.firstName && googleAccount?.lastName) {
        setUserName(`${googleAccount.firstName} ${googleAccount.lastName}`);
      } else if (user.fullName) {
        setUserName(user.fullName);
      } else if (user.firstName && user.lastName) {
        setUserName(`${user.firstName} ${user.lastName}`);
      } else if (user.username) {
        setUserName(user.username);
      }
      
      // Get user email
      if (user.emailAddresses && user.emailAddresses.length > 0) {
        const primaryEmail = user.emailAddresses.find(email => email.id === user.primaryEmailAddressId);
        setUserEmail(primaryEmail?.emailAddress || user.emailAddresses[0].emailAddress);
      }
    }
  }, [isLoaded, user]);

  const handleSignOut = async () => {
    await signOut();
    router.push("/");
  };

  return (
    <header className="bg-white dark:bg-gray-800 shadow-sm">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo and desktop nav */}
          <div className="flex items-center">
            <Link href="/dashboard" className="flex items-center">
              <span className="text-xl font-bold text-blue-600 dark:text-blue-400">
                Njuwa Capital
              </span>
            </Link>
            <nav className="hidden md:ml-10 md:flex md:space-x-8">
              <Link
                href="/dashboard"
                className="text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 px-3 py-2 text-sm font-medium"
              >
                Dashboard
              </Link>
              <Link
                href="/records"
                className="text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 px-3 py-2 text-sm font-medium"
              >
                Loan Records
              </Link>
              <Link
                href="/search"
                className="text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 px-3 py-2 text-sm font-medium"
              >
                Search
              </Link>
            </nav>
          </div>

          {/* Right side actions */}
          <div className="hidden md:flex items-center space-x-4">
            <Link href="/records/new">
              <Button variant="default" size="sm" className="flex items-center">
                <PlusCircle className="h-4 w-4 mr-2" />
                New Loan
              </Button>
            </Link>
            <ModeToggle />
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className="relative h-10 w-10 rounded-full"
                >
                  <span className="sr-only">Open user menu</span>
                  {profileImage ? (
                    <img
                      className="h-8 w-8 rounded-full"
                      src={profileImage}
                      alt="User profile"
                    />
                  ) : (
                    <User className="h-5 w-5" />
                  )}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <div className="flex items-center justify-start gap-2 p-2">
                  <div className="flex flex-col space-y-1 leading-none">
                    {userName && (
                      <p className="font-medium">{userName}</p>
                    )}
                    {userEmail && (
                      <p className="text-xs text-muted-foreground">
                        {userEmail}
                      </p>
                    )}
                  </div>
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/dashboard">
                    <LayoutDashboard className="mr-2 h-4 w-4" />
                    Dashboard
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/records">
                    <FileText className="mr-2 h-4 w-4" />
                    Loan Records
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/settings">
                    <Settings className="mr-2 h-4 w-4" />
                    Settings
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleSignOut}>
                  <LogOut className="mr-2 h-4 w-4" />
                  Sign out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Mobile menu button */}
          <div className="flex md:hidden">
            <ModeToggle />
            <button
              type="button"
              className="ml-2 inline-flex items-center justify-center p-2 rounded-md text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 focus:outline-none"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              <span className="sr-only">Open main menu</span>
              {mobileMenuOpen ? (
                <X className="block h-6 w-6" aria-hidden="true" />
              ) : (
                <Menu className="block h-6 w-6" aria-hidden="true" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white dark:bg-gray-800 shadow-lg">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            <Link
              href="/dashboard"
              className="block px-3 py-2 rounded-md text-base font-medium text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400"
              onClick={() => setMobileMenuOpen(false)}
            >
              <LayoutDashboard className="inline-block h-5 w-5 mr-2" />
              Dashboard
            </Link>
            <Link
              href="/records"
              className="block px-3 py-2 rounded-md text-base font-medium text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400"
              onClick={() => setMobileMenuOpen(false)}
            >
              <FileText className="inline-block h-5 w-5 mr-2" />
              Loan Records
            </Link>
            <Link
              href="/search"
              className="block px-3 py-2 rounded-md text-base font-medium text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400"
              onClick={() => setMobileMenuOpen(false)}
            >
              <Search className="inline-block h-5 w-5 mr-2" />
              Search
            </Link>
            <Link
              href="/records/new"
              className="block px-3 py-2 rounded-md text-base font-medium text-blue-600 dark:text-blue-400"
              onClick={() => setMobileMenuOpen(false)}
            >
              <PlusCircle className="inline-block h-5 w-5 mr-2" />
              New Loan
            </Link>
            <button
              onClick={handleSignOut}
              className="w-full text-left px-3 py-2 rounded-md text-base font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20"
            >
              <LogOut className="inline-block h-5 w-5 mr-2" />
              Sign out
            </button>
          </div>
        </div>
      )}
    </header>
  );
}