import { redirect } from "next/navigation";
import { auth, currentUser } from "@clerk/nextjs";
import Link from "next/link";
import DashboardHeader from "@/components/dashboard/dashboard-header";
import DashboardStats from "@/components/dashboard/dashboard-stats";
import DashboardCharts from "@/components/dashboard/dashboard-charts";
import RecentLoans from "@/components/dashboard/recent-loans";
import ExportReports from "@/components/dashboard/export-reports";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Download, FileSpreadsheet, FileText, Filter } from "lucide-react";

export default async function DashboardPage() {
  // Get the user's authentication status and user object
  let userId = null;
  let user = null;
  
  try {
    // Try to get auth info, but don't fail if it's not available
    const authInfo = auth();
    userId = authInfo?.userId;
    user = await currentUser();
  } catch (error) {
    console.error("Auth error:", error);
    // Continue without auth for development purposes
  }
  
  // For development purposes, allow access even without authentication
  // In production, you would uncomment this redirect
  /*
  if (!userId || !user) {
    redirect("/auth/sign-in");
  }
  */

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <DashboardHeader />
      <main className="container mx-auto py-8 px-4">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold">Dashboard</h1>
            <p className="text-gray-500 dark:text-gray-400 mt-1">
              Welcome back, {user?.firstName || 'User'}! Here's an overview of your loan portfolio.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" className="flex items-center gap-1">
              <Filter className="h-4 w-4" />
              <span>Filter</span>
            </Button>
            <ExportReports />
          </div>
        </div>

        {/* Dashboard Stats */}
        <DashboardStats />

        {/* Dashboard Charts */}
        <DashboardCharts />

        {/* Recent Loans Table */}
        <RecentLoans />

        {/* Quick Actions Section */}
        <div className="mt-8">
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
              <CardDescription>Common tasks you might want to perform</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-wrap gap-2">
              <Link href="/records/new" className="flex-1">
                <Button className="w-full">Create New Loan Record</Button>
              </Link>
              <Link href="/search" className="flex-1">
                <Button variant="outline" className="w-full">Search Records</Button>
              </Link>
              <Link href="/records" className="flex-1">
                <Button variant="outline" className="w-full">View All Records</Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}