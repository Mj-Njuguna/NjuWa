import { redirect } from "next/navigation";
import { auth } from "@clerk/nextjs";
import DashboardHeader from "@/components/dashboard/dashboard-header";
import LoanRecordsList from "@/components/loans/loan-records-list";

export default async function RecordsPage() {
  const { userId } = auth();
  
  if (!userId) {
    redirect("/auth/sign-in");
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <DashboardHeader />
      <main className="container mx-auto py-8 px-4">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-8">
          <h1 className="text-3xl font-bold mb-4 md:mb-0">Loan Records</h1>
        </div>

        <LoanRecordsList />
      </main>
    </div>
  );
}