"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Eye, FileEdit, PlusCircle, RefreshCw, Search, Loader2 } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "@/hooks/use-toast";

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
  loanOfficer: string;
}

export default function LoanRecordsList() {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedRecords, setSelectedRecords] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loanRecords, setLoanRecords] = useState<LoanRecord[]>([]);
  const [page, setPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(5);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // Function to trigger a refresh of the loan records
  const refreshLoanRecords = useCallback(() => {
    setRefreshTrigger(prev => prev + 1);
  }, []);

  // Fetch loan records when the component mounts or when refreshTrigger changes
  useEffect(() => {
    const fetchLoanRecords = async () => {
      try {
        setIsLoading(true);
        console.log('Fetching all loan records...');
        const response = await fetch('/api/loans');
        
        if (!response.ok) {
          throw new Error('Failed to fetch loan records');
        }
        
        const data = await response.json();
        console.log('Loan records data received:', data);
        
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
            loanOfficer: loan.loanOfficer || 'Not assigned',
          };
        }).filter(Boolean); // Remove any null entries
        
        console.log('Formatted loans:', formattedLoans);
        setLoanRecords(formattedLoans);
      } catch (error) {
        console.error('Error fetching loans:', error);
        toast({
          title: "Error",
          description: "Failed to load loan records",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchLoanRecords();
  }, [refreshTrigger]);

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

  // Toggle record selection
  const toggleRecordSelection = (id: string) => {
    if (selectedRecords.includes(id)) {
      setSelectedRecords(selectedRecords.filter((recordId) => recordId !== id));
    } else {
      setSelectedRecords([...selectedRecords, id]);
    }
  };

  // Toggle all records selection
  const toggleAllRecords = () => {
    if (selectedRecords.length === filteredRecords.length) {
      setSelectedRecords([]);
    } else {
      setSelectedRecords(filteredRecords.map((record) => record.id));
    }
  };

  // Filter records based on search query and status filter
  const filteredRecords = loanRecords.filter((record) => {
    const matchesSearch = 
      record.client.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      record.client.idNumber.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = 
      statusFilter === "all" || 
      record.status.toLowerCase() === statusFilter.toLowerCase();
    
    return matchesSearch && matchesStatus;
  });

  // Pagination logic
  const totalPages = Math.ceil(filteredRecords.length / itemsPerPage);
  const startIndex = (page - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentRecords = filteredRecords.slice(startIndex, endIndex);

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Loan Records</CardTitle>
          <CardDescription>Loading loan records...</CardDescription>
        </CardHeader>
        <CardContent className="flex justify-center items-center py-10">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </CardContent>
      </Card>
    );
  }

  if (loanRecords.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Loan Records</CardTitle>
          <CardDescription>No loan records found</CardDescription>
        </CardHeader>
        <CardContent className="text-center py-10">
          <p className="text-muted-foreground mb-4">No loan records have been created yet</p>
          <Link href="/records/new">
            <Button>
              <PlusCircle className="mr-2 h-4 w-4" />
              Create New Loan Record
            </Button>
          </Link>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <CardTitle>Loan Records</CardTitle>
            <CardDescription>
              Manage and view all loan records
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={refreshLoanRecords} disabled={isLoading}>
              <RefreshCw className={`mr-2 h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
            <Link href="/records/new">
              <Button>
                <PlusCircle className="mr-2 h-4 w-4" />
                New Record
              </Button>
            </Link>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="flex-1">
            <Label htmlFor="search" className="sr-only">
              Search
            </Label>
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500 dark:text-gray-400" />
              <Input
                id="search"
                placeholder="Search by name or ID..."
                className="pl-8"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
          <div>
            <Label htmlFor="status-filter" className="sr-only">
              Filter by Status
            </Label>
            <Select
              value={statusFilter}
              onValueChange={setStatusFilter}
            >
              <SelectTrigger id="status-filter" className="w-[180px]">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="defaulted">Defaulted</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12">
                  <Checkbox
                    checked={selectedRecords.length === filteredRecords.length && filteredRecords.length > 0}
                    onCheckedChange={toggleAllRecords}
                    aria-label="Select all records"
                  />
                </TableHead>
                <TableHead>Client</TableHead>
                <TableHead>ID Number</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Disbursement Date</TableHead>
                <TableHead>Last Installment</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Loan Officer</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {currentRecords.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={9} className="h-24 text-center">
                    No records found.
                  </TableCell>
                </TableRow>
              ) : (
                currentRecords.map((record) => (
                  <TableRow key={record.id}>
                    <TableCell>
                      <Checkbox
                        checked={selectedRecords.includes(record.id)}
                        onCheckedChange={() => toggleRecordSelection(record.id)}
                        aria-label={`Select record for ${record.client.name}`}
                      />
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Avatar className="h-8 w-8">
                          <AvatarFallback className="bg-blue-100 text-blue-600">
                            {record.client.name
                              .split(" ")
                              .map((n) => n[0])
                              .join("")}
                          </AvatarFallback>
                        </Avatar>
                        <span>{record.client.name}</span>
                      </div>
                    </TableCell>
                    <TableCell>{record.client.idNumber}</TableCell>
                    <TableCell>{formatCurrency(record.loanAmount)}</TableCell>
                    <TableCell>{formatDate(record.disbursementDate)}</TableCell>
                    <TableCell>{formatDate(record.lastInstallmentDate)}</TableCell>
                    <TableCell>
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          record.status === "active"
                            ? "bg-green-100 text-green-800 dark:bg-green-800/20 dark:text-green-400"
                            : record.status === "completed"
                            ? "bg-blue-100 text-blue-800 dark:bg-blue-800/20 dark:text-blue-400"
                            : record.status === "pending"
                            ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-800/20 dark:text-yellow-400"
                            : record.status === "defaulted"
                            ? "bg-red-100 text-red-800 dark:bg-red-800/20 dark:text-red-400"
                            : "bg-gray-100 text-gray-800 dark:bg-gray-800/20 dark:text-gray-400"
                        }`}
                      >
                        {record.status}
                      </span>
                    </TableCell>
                    <TableCell>{record.loanOfficer}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Link href={`/records/${record.id}`}>
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
                        <Link href={`/records/${record.id}/edit`}>
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
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        {selectedRecords.length > 0 && (
          <div className="mt-4 flex items-center gap-2">
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {selectedRecords.length} record(s) selected
            </p>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setSelectedRecords([])}
            >
              Clear Selection
            </Button>
          </div>
        )}

        {/* Pagination */}
        <div className="flex flex-col-reverse items-center justify-between gap-4 sm:flex-row">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <div>
              Showing{" "}
              <strong>
                {startIndex + 1}-
                {Math.min(endIndex, filteredRecords.length)}
              </strong>{" "}
              of <strong>{filteredRecords.length}</strong> records
            </div>
            <div className="flex items-center gap-1">
              <span>Show</span>
              <Select
                value={String(itemsPerPage)}
                onValueChange={(value) => {
                  setItemsPerPage(Number(value));
                  setPage(1);
                }}
              >
                <SelectTrigger className="h-8 w-16">
                  <SelectValue placeholder={itemsPerPage} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="5">5</SelectItem>
                  <SelectItem value="10">10</SelectItem>
                  <SelectItem value="20">20</SelectItem>
                  <SelectItem value="50">50</SelectItem>
                </SelectContent>
              </Select>
              <span>per page</span>
            </div>
          </div>

          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage(page - 1)}
              disabled={page === 1}
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage(page + 1)}
              disabled={page === totalPages}
            >
              Next
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}