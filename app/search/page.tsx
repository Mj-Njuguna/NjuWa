"use client";

import { useState, useEffect } from "react";
import DashboardHeader from "@/components/dashboard/dashboard-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Search, Loader2 } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import Link from "next/link";

interface LoanRecord {
  id: string;
  clientId: string;
  client: {
    id: string;
    name: string;
    idNumber: string;
    phoneNumber1: string;
    phoneNumber2?: string;
    businessLocation: string;
    permitNumber?: string;
    homeAddress: string;
  };
  loanAmount: number;
  interestRate: number;
  registrationFee: number;
  loanDuration: number;
  applicationDate: string;
  disbursementDate?: string;
  firstInstallmentDate?: string;
  lastInstallmentDate?: string;
  dailyPaymentCheck: boolean;
  loanOfficer: string;
  status: string;
  guarantors: Array<{
    id: string;
    name: string;
    idNumber: string;
    phoneNumber: string;
  }>;
  references: Array<{
    id: string;
    name: string;
    phoneNumber: string;
    relationship: string;
  }>;
  mediaFiles: Array<{
    id: string;
    url: string;
    type: string;
    description?: string;
  }>;
}

export default function SearchPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<LoanRecord[]>([]);
  const [selectedRecord, setSelectedRecord] = useState<LoanRecord | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [allLoans, setAllLoans] = useState<LoanRecord[]>([]);

  // Fetch all loans when the component mounts
  useEffect(() => {
    const fetchLoans = async () => {
      try {
        setIsLoading(true);
        const response = await fetch('/api/loans');
        
        if (!response.ok) {
          throw new Error('Failed to fetch loan records');
        }
        
        const data = await response.json();
        setAllLoans(data);
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

    fetchLoans();
  }, []);

  const handleSearch = () => {
    if (!searchQuery.trim()) {
      toast({
        title: "Search Error",
        description: "Please enter a search term",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    
    // Search through the loans we already have
    const query = searchQuery.toLowerCase();
    const results = allLoans.filter(loan => 
      loan.client.name.toLowerCase().includes(query) ||
      loan.client.idNumber.toLowerCase().includes(query) ||
      loan.client.phoneNumber1.toLowerCase().includes(query) ||
      (loan.client.phoneNumber2 && loan.client.phoneNumber2.toLowerCase().includes(query)) ||
      loan.status.toLowerCase().includes(query)
    );
    
    setSearchResults(results);
    setSelectedRecord(null);
    setIsLoading(false);
    
    if (results.length === 0) {
      toast({
        title: "No Results",
        description: "No loan records match your search criteria",
      });
    }
  };

  const handleViewRecord = (record: LoanRecord) => {
    setSelectedRecord(record);
  };

  const handleBackToResults = () => {
    setSelectedRecord(null);
  };

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
  const formatDate = (dateString: string | undefined) => {
    if (!dateString) return 'Not set';
    
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <DashboardHeader />
      <main className="container mx-auto py-8 px-4">
        {selectedRecord ? (
          <div>
            <Button 
              variant="outline" 
              onClick={handleBackToResults}
              className="mb-4"
            >
              Back to Search Results
            </Button>
            
            {/* Display loan record details */}
            <Card>
              <CardHeader>
                <CardTitle>Loan Record Details</CardTitle>
                <CardDescription>
                  Full information about the selected loan
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {/* Client Information */}
                  <div>
                    <h3 className="text-lg font-semibold mb-2">Client Information</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Name</p>
                        <p className="font-medium">{selectedRecord.client.name}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">ID Number</p>
                        <p className="font-medium">{selectedRecord.client.idNumber}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Phone Number (Primary)</p>
                        <p className="font-medium">{selectedRecord.client.phoneNumber1}</p>
                      </div>
                      {selectedRecord.client.phoneNumber2 && (
                        <div>
                          <p className="text-sm text-gray-500 dark:text-gray-400">Phone Number (Secondary)</p>
                          <p className="font-medium">{selectedRecord.client.phoneNumber2}</p>
                        </div>
                      )}
                      <div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Business Location</p>
                        <p className="font-medium">{selectedRecord.client.businessLocation}</p>
                      </div>
                      {selectedRecord.client.permitNumber && (
                        <div>
                          <p className="text-sm text-gray-500 dark:text-gray-400">Permit Number</p>
                          <p className="font-medium">{selectedRecord.client.permitNumber}</p>
                        </div>
                      )}
                      <div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Home Address</p>
                        <p className="font-medium">{selectedRecord.client.homeAddress}</p>
                      </div>
                    </div>
                  </div>
                  
                  {/* Loan Information */}
                  <div>
                    <h3 className="text-lg font-semibold mb-2">Loan Information</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Loan Amount</p>
                        <p className="font-medium">{formatCurrency(selectedRecord.loanAmount)}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Interest Rate</p>
                        <p className="font-medium">{selectedRecord.interestRate}%</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Registration Fee</p>
                        <p className="font-medium">{formatCurrency(selectedRecord.registrationFee)}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Loan Duration</p>
                        <p className="font-medium">{selectedRecord.loanDuration} days</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Application Date</p>
                        <p className="font-medium">{formatDate(selectedRecord.applicationDate)}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Disbursement Date</p>
                        <p className="font-medium">{formatDate(selectedRecord.disbursementDate)}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">First Installment Date</p>
                        <p className="font-medium">{formatDate(selectedRecord.firstInstallmentDate)}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Last Installment Date</p>
                        <p className="font-medium">{formatDate(selectedRecord.lastInstallmentDate)}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Daily Payment Check</p>
                        <p className="font-medium">{selectedRecord.dailyPaymentCheck ? 'Yes' : 'No'}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Loan Officer</p>
                        <p className="font-medium">{selectedRecord.loanOfficer}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Status</p>
                        <p>
                          <span
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              selectedRecord.status.toLowerCase() === "active"
                                ? "bg-green-100 text-green-800 dark:bg-green-800/20 dark:text-green-400"
                                : selectedRecord.status.toLowerCase() === "completed"
                                ? "bg-blue-100 text-blue-800 dark:bg-blue-800/20 dark:text-blue-400"
                                : selectedRecord.status.toLowerCase() === "pending"
                                ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-800/20 dark:text-yellow-400"
                                : "bg-gray-100 text-gray-800 dark:bg-gray-800/20 dark:text-gray-400"
                            }`}
                          >
                            {selectedRecord.status}
                          </span>
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  {/* Guarantors */}
                  {selectedRecord.guarantors && selectedRecord.guarantors.length > 0 && (
                    <div>
                      <h3 className="text-lg font-semibold mb-2">Guarantors</h3>
                      <div className="space-y-3">
                        {selectedRecord.guarantors.map((guarantor, index) => (
                          <div key={guarantor.id || index} className="p-3 bg-gray-50 dark:bg-gray-800 rounded-md">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                              <div>
                                <p className="text-sm text-gray-500 dark:text-gray-400">Name</p>
                                <p className="font-medium">{guarantor.name}</p>
                              </div>
                              <div>
                                <p className="text-sm text-gray-500 dark:text-gray-400">ID Number</p>
                                <p className="font-medium">{guarantor.idNumber}</p>
                              </div>
                              <div>
                                <p className="text-sm text-gray-500 dark:text-gray-400">Phone Number</p>
                                <p className="font-medium">{guarantor.phoneNumber}</p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {/* References */}
                  {selectedRecord.references && selectedRecord.references.length > 0 && (
                    <div>
                      <h3 className="text-lg font-semibold mb-2">References</h3>
                      <div className="space-y-3">
                        {selectedRecord.references.map((reference, index) => (
                          <div key={reference.id || index} className="p-3 bg-gray-50 dark:bg-gray-800 rounded-md">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                              <div>
                                <p className="text-sm text-gray-500 dark:text-gray-400">Name</p>
                                <p className="font-medium">{reference.name}</p>
                              </div>
                              <div>
                                <p className="text-sm text-gray-500 dark:text-gray-400">Phone Number</p>
                                <p className="font-medium">{reference.phoneNumber}</p>
                              </div>
                              <div>
                                <p className="text-sm text-gray-500 dark:text-gray-400">Relationship</p>
                                <p className="font-medium">{reference.relationship}</p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {/* Actions */}
                  <div className="flex gap-2 justify-end">
                    <Link href={`/records/${selectedRecord.id}/edit`}>
                      <Button variant="outline">Edit Record</Button>
                    </Link>
                    <Link href={`/records/${selectedRecord.id}`}>
                      <Button>View Full Details</Button>
                    </Link>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        ) : (
          <>
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-8">
              <h1 className="text-3xl font-bold mb-4 md:mb-0">Search Loan Records</h1>
            </div>

            <Card className="mb-8">
              <CardHeader>
                <CardTitle>Search</CardTitle>
                <CardDescription>
                  Search for loan records by client name, ID number, phone number, or status
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex gap-2">
                  <Input
                    placeholder="Search..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                    className="flex-1"
                  />
                  <Button onClick={handleSearch} disabled={isLoading}>
                    {isLoading ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Search className="h-4 w-4 mr-2" />
                    )}
                    Search
                  </Button>
                </div>
              </CardContent>
            </Card>

            {searchResults.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Search Results</CardTitle>
                  <CardDescription>
                    Found {searchResults.length} record(s) matching your search
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {searchResults.map((record) => (
                      <div 
                        key={record.id} 
                        className="flex justify-between items-center p-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm hover:shadow-md transition-shadow"
                      >
                        <div>
                          <h3 className="font-semibold text-lg">{record.client.name}</h3>
                          <div className="text-sm text-gray-500 dark:text-gray-400">
                            <p>ID: {record.client.idNumber}</p>
                            <p>Phone: {record.client.phoneNumber1}</p>
                            <p>Amount: {formatCurrency(record.loanAmount)}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="mb-2">
                            <span
                              className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                record.status.toLowerCase() === "active"
                                  ? "bg-green-100 text-green-800 dark:bg-green-800/20 dark:text-green-400"
                                  : record.status.toLowerCase() === "completed"
                                  ? "bg-blue-100 text-blue-800 dark:bg-blue-800/20 dark:text-blue-400"
                                  : record.status.toLowerCase() === "pending"
                                  ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-800/20 dark:text-yellow-400"
                                  : "bg-gray-100 text-gray-800 dark:bg-gray-800/20 dark:text-gray-400"
                              }`}
                            >
                              {record.status}
                            </span>
                          </div>
                          <Button
                            size="sm"
                            onClick={() => handleViewRecord(record)}
                          >
                            View Details
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </>
        )}
      </main>
    </div>
  );
}