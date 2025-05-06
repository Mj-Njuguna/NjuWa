"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import DashboardHeader from "@/components/dashboard/dashboard-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { toast } from "@/hooks/use-toast";
import { Loader2, ArrowLeft, FileEdit, RefreshCw, Trash2, FileText, Download, Eye, File } from "lucide-react";
import { format } from "date-fns";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface LoanRecord {
  id: string;
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
    fileName: string;
    fileType: string;
    fileUrl: string;
    description?: string;
  }>;
}

export default function RecordDetailPage() {
  const router = useRouter();
  const params = useParams();
  const [record, setRecord] = useState<LoanRecord | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    async function fetchRecord() {
      if (!params.id) return;
      
      try {
        setIsLoading(true);
        const response = await fetch(`/api/loans/${params.id}`);
        
        if (!response.ok) {
          throw new Error('Failed to fetch loan record');
        }
        
        const data = await response.json();
        console.log('Loan record data:', data);
        setRecord(data);
      } catch (err) {
        console.error('Error fetching loan record:', err);
        setError('Failed to load loan record details');
        toast({
          title: "Error",
          description: "Failed to load loan record details",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    }

    fetchRecord();
  }, [params.id]);

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
    
    try {
      const date = new Date(dateString);
      return format(date, 'MMM d, yyyy');
    } catch (error) {
      return 'Invalid date';
    }
  };

  // Calculate expected return (principal + interest)
  const calculateExpectedReturn = (loanAmount: number, interestRate: number) => {
    const interestAmount = (loanAmount * interestRate) / 100;
    return loanAmount + interestAmount;
  };

  // Get status badge class
  const getStatusBadgeClass = (status: string) => {
    switch (status.toLowerCase()) {
      case 'active':
        return 'bg-green-100 text-green-800 dark:bg-green-800/20 dark:text-green-400';
      case 'completed':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-800/20 dark:text-blue-400';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-800/20 dark:text-yellow-400';
      case 'defaulted':
        return 'bg-red-100 text-red-800 dark:bg-red-800/20 dark:text-red-400';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-800/20 dark:text-gray-400';
    }
  };

  // Update loan status
  const updateLoanStatus = async (newStatus: string) => {
    if (!record) return;
    
    try {
      setIsUpdatingStatus(true);
      
      const response = await fetch(`/api/loans/${params.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          status: newStatus
        }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update loan status');
      }
      
      // Update the local record state with the new status
      setRecord({
        ...record,
        status: newStatus
      });
      
      toast({
        title: "Status Updated",
        description: `Loan status has been updated to ${newStatus}`,
        variant: "default",
      });
    } catch (error) {
      console.error('Error updating loan status:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to update loan status",
        variant: "destructive",
      });
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  // Delete loan record
  const deleteLoanRecord = async () => {
    if (!record) return;
    
    try {
      setIsDeleting(true);
      
      const response = await fetch(`/api/loans/${params.id}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to delete loan record');
      }
      
      toast({
        title: "Record Deleted",
        description: "Loan record has been successfully deleted",
        variant: "default",
      });
      
      // Redirect to the records list page
      router.push('/records');
    } catch (error) {
      console.error('Error deleting loan record:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to delete loan record",
        variant: "destructive",
      });
      setIsDeleting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <DashboardHeader />
        <main className="container mx-auto py-8 px-4">
          <div className="flex justify-center items-center h-64">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        </main>
      </div>
    );
  }

  if (error || !record) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <DashboardHeader />
        <main className="container mx-auto py-8 px-4">
          <Button 
            variant="outline" 
            onClick={() => router.back()}
            className="mb-4"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
          <Card>
            <CardHeader>
              <CardTitle>Error</CardTitle>
              <CardDescription>
                {error || 'Record not found'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p>Unable to load the loan record. Please try again later or contact support.</p>
            </CardContent>
            <CardFooter>
              <Button onClick={() => router.push('/records')}>
                Return to Records
              </Button>
            </CardFooter>
          </Card>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <DashboardHeader />
      <main className="container mx-auto py-8 px-4">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
          <div className="flex items-center gap-2">
            <Button 
              variant="outline" 
              onClick={() => router.back()}
              size="sm"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back
            </Button>
            <h1 className="text-3xl font-bold">Loan Record Details</h1>
          </div>
          <div className="flex items-center gap-2">
            <Link href={`/records/${record.id}/edit`}>
              <Button>
                <FileEdit className="mr-2 h-4 w-4" />
                Edit Record
              </Button>
            </Link>
            
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive" disabled={isDeleting}>
                  {isDeleting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Deleting...
                    </>
                  ) : (
                    <>
                      <Trash2 className="mr-2 h-4 w-4" />
                      Delete
                    </>
                  )}
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This action cannot be undone. This will permanently delete the loan record
                    for {record.client.name} and all associated data.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction 
                    onClick={deleteLoanRecord}
                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  >
                    Delete
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Client Information */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Client Information</CardTitle>
              <CardDescription>Personal and business details</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center gap-4">
                <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center text-primary text-2xl font-bold">
                  {record.client.name.split(' ').map(n => n[0]).join('')}
                </div>
                <div>
                  <h3 className="text-xl font-semibold">{record.client.name}</h3>
                  <p className="text-sm text-muted-foreground">ID: {record.client.idNumber}</p>
                </div>
              </div>

              <Separator />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Primary Phone</p>
                  <p className="font-medium">{record.client.phoneNumber1}</p>
                </div>
                {record.client.phoneNumber2 && (
                  <div>
                    <p className="text-sm text-muted-foreground">Secondary Phone</p>
                    <p className="font-medium">{record.client.phoneNumber2}</p>
                  </div>
                )}
                <div>
                  <p className="text-sm text-muted-foreground">Business Location</p>
                  <p className="font-medium">{record.client.businessLocation}</p>
                </div>
                {record.client.permitNumber && (
                  <div>
                    <p className="text-sm text-muted-foreground">Business Permit</p>
                    <p className="font-medium">{record.client.permitNumber}</p>
                  </div>
                )}
                <div className="md:col-span-2">
                  <p className="text-sm text-muted-foreground">Home Address</p>
                  <p className="font-medium">{record.client.homeAddress}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Loan Status */}
          <Card>
            <CardHeader>
              <CardTitle>Loan Status</CardTitle>
              <CardDescription>Current status and details</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-col items-center gap-2">
                <span
                  className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusBadgeClass(
                    record.status
                  )}`}
                >
                  {record.status}
                </span>
                
                <div className="w-full mt-2">
                  <Select
                    value={record.status}
                    onValueChange={updateLoanStatus}
                    disabled={isUpdatingStatus}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Change status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="PENDING">Pending</SelectItem>
                      <SelectItem value="APPROVED">Approved</SelectItem>
                      <SelectItem value="DISBURSED">Disbursed</SelectItem>
                      <SelectItem value="ACTIVE">Active</SelectItem>
                      <SelectItem value="COMPLETED">Completed</SelectItem>
                      <SelectItem value="DEFAULTED">Defaulted</SelectItem>
                      <SelectItem value="REJECTED">Rejected</SelectItem>
                    </SelectContent>
                  </Select>
                  {isUpdatingStatus && (
                    <div className="flex justify-center mt-2">
                      <RefreshCw className="h-4 w-4 animate-spin text-primary" />
                    </div>
                  )}
                </div>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Loan Amount</p>
                <p className="text-2xl font-bold">{formatCurrency(record.loanAmount)}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Interest Rate</p>
                <p className="font-medium">{record.interestRate}%</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Expected Return</p>
                <p className="font-medium text-green-600 dark:text-green-400 font-semibold">
                  {formatCurrency(calculateExpectedReturn(record.loanAmount, record.interestRate))}
                  <span className="text-xs text-muted-foreground ml-1">
                    (Interest: {formatCurrency((record.loanAmount * record.interestRate) / 100)})
                  </span>
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Registration Fee</p>
                <p className="font-medium">{formatCurrency(record.registrationFee)}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Loan Officer</p>
                <p className="font-medium">{record.loanOfficer}</p>
              </div>
            </CardContent>
          </Card>

          {/* Loan Details */}
          <Card className="lg:col-span-3">
            <CardHeader>
              <CardTitle>Loan Details</CardTitle>
              <CardDescription>Terms and schedule</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div>
                  <p className="text-sm text-muted-foreground">Application Date</p>
                  <p className="font-medium">{formatDate(record.applicationDate)}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Disbursement Date</p>
                  <p className="font-medium">{formatDate(record.disbursementDate)}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">First Installment</p>
                  <p className="font-medium">{formatDate(record.firstInstallmentDate)}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Last Installment</p>
                  <p className="font-medium">{formatDate(record.lastInstallmentDate)}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Loan Duration</p>
                  <p className="font-medium">{record.loanDuration} days</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Daily Payment Check</p>
                  <p className="font-medium">{record.dailyPaymentCheck ? 'Yes' : 'No'}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Guarantor Information */}
          <Card className="lg:col-span-3">
            <CardHeader>
              <CardTitle>Guarantor Information</CardTitle>
              <CardDescription>Loan guarantors</CardDescription>
            </CardHeader>
            <CardContent>
              {record.guarantors && record.guarantors.length > 0 ? (
                <div className="space-y-4">
                  {record.guarantors.map((guarantor, index) => (
                    <div key={guarantor.id || index} className="p-4 bg-gray-50 dark:bg-gray-800 rounded-md">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                          <p className="text-sm text-muted-foreground">Name</p>
                          <p className="font-medium">{guarantor.name}</p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">ID Number</p>
                          <p className="font-medium">{guarantor.idNumber}</p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Phone Number</p>
                          <p className="font-medium">{guarantor.phoneNumber}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground">No guarantors registered for this loan.</p>
              )}
            </CardContent>
          </Card>

          {/* References */}
          <Card className="lg:col-span-3">
            <CardHeader>
              <CardTitle>References</CardTitle>
              <CardDescription>Client references</CardDescription>
            </CardHeader>
            <CardContent>
              {record.references && record.references.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {record.references.map((reference, index) => (
                    <div key={reference.id || index} className="p-4 bg-gray-50 dark:bg-gray-800 rounded-md">
                      <div className="space-y-2">
                        <div>
                          <p className="text-sm text-muted-foreground">Name</p>
                          <p className="font-medium">{reference.name}</p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Phone Number</p>
                          <p className="font-medium">{reference.phoneNumber}</p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Relationship</p>
                          <p className="font-medium">{reference.relationship}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground">No references registered for this loan.</p>
              )}
            </CardContent>
          </Card>
          
          {/* Documents Section */}
          <Card className="lg:col-span-3">
            <CardHeader>
              <CardTitle>Documents</CardTitle>
              <CardDescription>Loan contracts and other documents</CardDescription>
            </CardHeader>
            <CardContent>
              {record.mediaFiles && record.mediaFiles.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {record.mediaFiles.map((file, index) => (
                    <div key={file.id || index} className="p-4 border rounded-lg flex flex-col">
                      <div className="flex items-center mb-3">
                        {file.fileType === 'CONTRACT_PDF' ? (
                          <FileText className="h-8 w-8 text-blue-500 mr-3" />
                        ) : (
                          <File className="h-8 w-8 text-gray-500 mr-3" />
                        )}
                        <div className="flex-1 truncate">
                          <p className="font-medium truncate" title={file.fileName}>
                            {file.fileName}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {file.description || (file.fileType === 'CONTRACT_PDF' ? 'Signed Contract' : 'Document')}
                          </p>
                        </div>
                      </div>
                      <div className="flex mt-auto space-x-2">
                        <a 
                          href={file.fileUrl} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="flex-1"
                        >
                          <Button variant="outline" size="sm" className="w-full">
                            <Eye className="h-4 w-4 mr-1" />
                            View
                          </Button>
                        </a>
                        <a 
                          href={file.fileUrl} 
                          download={file.fileName}
                          className="flex-1"
                          onClick={(e) => {
                            e.preventDefault();
                            // Create a temporary anchor element to trigger download
                            const link = document.createElement('a');
                            link.href = file.fileUrl;
                            link.download = file.fileName;
                            document.body.appendChild(link);
                            link.click();
                            document.body.removeChild(link);
                            
                            toast({
                              title: "Download Started",
                              description: `Downloading ${file.fileName}`,
                              variant: "default",
                            });
                          }}
                        >
                          <Button variant="default" size="sm" className="w-full">
                            <Download className="h-4 w-4 mr-1" />
                            Download
                          </Button>
                        </a>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
                  <p className="text-muted-foreground">No documents available for this loan.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
