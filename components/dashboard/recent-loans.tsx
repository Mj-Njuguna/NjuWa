"use client";

import { useEffect, useState } from "react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Eye, FileEdit, Loader2 } from "lucide-react";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";

interface LoanRecord {
  id: string;
  client: {
    name: string;
    idNumber: string;
  };
  loanAmount: number;
  disbursementDate: string | null;
  lastInstallmentDate: string | null;
  status: string;
}

export default function RecentLoans() {
  const [loans, setLoans] = useState<LoanRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [displayCount, setDisplayCount] = useState(5);

  useEffect(() => {
    async function fetchLoans() {
      try {
        setLoading(true);
        console.log('Fetching recent loans...');
        const response = await fetch('/api/loans');
        
        if (!response.ok) {
          throw new Error('Failed to fetch loan records');
        }
        
        const data = await response.json();
        console.log('Recent loans data received:', data);
        
        // Format the data for display
        const formattedLoans = data.map((loan: any) => {
          // Check if client exists
          if (!loan.client) {
            console.error('Loan record missing client data:', loan);
            return null;
          }
          
          return {
            id: loan.id,
            client: {
              name: loan.client.name,
              idNumber: loan.client.idNumber,
            },
            loanAmount: loan.loanAmount,
            disbursementDate: loan.disbursementDate,
            lastInstallmentDate: loan.lastInstallmentDate,
            status: typeof loan.status === 'string' ? loan.status.toLowerCase() : 'unknown',
          };
        }).filter(Boolean); // Remove any null entries
        
        console.log('Formatted loans:', formattedLoans);
        setLoans(formattedLoans);
      } catch (err) {
        console.error('Error fetching loans:', err);
        setError('Failed to load loan records');
      } finally {
        setLoading(false);
      }
    }

    fetchLoans();
  }, []);

  // Format currency in Kenyan Shillings
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-KE', {
      style: 'currency',
      currency: 'KES',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  // Format date
  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Not set';
    
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  // If loading, show skeleton UI
  if (loading) {
    console.log('Recent loans component is loading...');
    return (
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Recent Loans</CardTitle>
            <CardDescription>
              Recent loan applications and their status
            </CardDescription>
          </div>
          <div className="h-9 w-24 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="h-10 w-full bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="h-16 w-full bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  // If error, show error message
  if (error) {
    console.log('Recent loans error:', error);
    return (
      <Card>
        <CardHeader>
          <CardTitle>Recent Loans</CardTitle>
          <CardDescription>
            Recent loan applications and their status
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md text-red-600 dark:text-red-400">
            {error}
          </div>
        </CardContent>
      </Card>
    );
  }

  // If no loans, show empty state
  if (loans.length === 0) {
    console.log('No loan records found');
    return (
      <Card>
        <CardHeader>
          <CardTitle>Recent Loans</CardTitle>
          <CardDescription>
            Recent loan applications and their status
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="p-8 text-center">
            <p className="text-muted-foreground mb-4">No loan records found</p>
            <Link href="/records/new">
              <Button>Create New Loan Record</Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    );
  }

  console.log('Rendering recent loans with data:', loans);

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Recent Loans</CardTitle>
          <CardDescription>
            Recent loan applications and their status
          </CardDescription>
        </div>
        <Link href="/records">
          <Button variant="outline">View All Records</Button>
        </Link>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Client</TableHead>
              <TableHead>ID Number</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Disbursement Date</TableHead>
              <TableHead>Last Installment</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loans.slice(0, displayCount).map((loan) => (
              <TableRow key={loan.id}>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback className="bg-blue-100 text-blue-600">
                        {loan.client.name
                          .split(" ")
                          .map((n) => n[0])
                          .join("")}
                      </AvatarFallback>
                    </Avatar>
                    <span>{loan.client.name}</span>
                  </div>
                </TableCell>
                <TableCell>{loan.client.idNumber}</TableCell>
                <TableCell>{formatCurrency(loan.loanAmount)}</TableCell>
                <TableCell>{formatDate(loan.disbursementDate)}</TableCell>
                <TableCell>{formatDate(loan.lastInstallmentDate)}</TableCell>
                <TableCell>
                  <span
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      loan.status === "active"
                        ? "bg-green-100 text-green-800 dark:bg-green-800/20 dark:text-green-400"
                        : loan.status === "completed"
                        ? "bg-blue-100 text-blue-800 dark:bg-blue-800/20 dark:text-blue-400"
                        : loan.status === "pending"
                        ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-800/20 dark:text-yellow-400"
                        : "bg-gray-100 text-gray-800 dark:bg-gray-800/20 dark:text-gray-400"
                    }`}
                  >
                    {loan.status}
                  </span>
                </TableCell>
                <TableCell className="text-right space-x-2">
                  <Link href={`/records/${loan.id}`}>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-blue-600 dark:text-blue-400"
                      title="View details"
                    >
                      <Eye className="h-4 w-4" />
                      <span className="sr-only">View</span>
                    </Button>
                  </Link>
                  <Link href={`/records/${loan.id}/edit`}>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-blue-600 dark:text-blue-400"
                      title="Edit record"
                    >
                      <FileEdit className="h-4 w-4" />
                      <span className="sr-only">Edit</span>
                    </Button>
                  </Link>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        {displayCount < loans.length && (
          <div className="mt-4 text-center">
            <Button
              variant="outline"
              onClick={() => setDisplayCount(displayCount + 5)}
            >
              Load More
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}