"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/components/ui/use-toast";
import { format } from "date-fns";
import { CalendarClock, Download, Edit, FileText, Image, Printer, Trash2, UserCheck } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
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

interface LoanRecordDetailsProps {
  record: any;
}

export default function LoanRecordDetails({ record }: LoanRecordDetailsProps) {
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    setIsDeleting(true);
    
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000));
    
    toast({
      title: "Record deleted",
      description: `Loan record for ${record.clientName} has been deleted.`,
    });
    
    setIsDeleting(false);
  };

  const handlePrint = () => {
    toast({
      title: "Print functionality",
      description: "Print functionality will be implemented in a future update.",
    });
  };

  const handleExport = () => {
    toast({
      title: "Export functionality",
      description: "Export functionality will be implemented in a future update.",
    });
  };

  const formatDate = (date: Date | null) => {
    if (!date) return "Not set";
    return format(new Date(date), "PPP");
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800 dark:bg-green-800/20 dark:text-green-400";
      case "completed":
        return "bg-blue-100 text-blue-800 dark:bg-blue-800/20 dark:text-blue-400";
      case "pending":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-800/20 dark:text-yellow-400";
      case "defaulted":
        return "bg-red-100 text-red-800 dark:bg-red-800/20 dark:text-red-400";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-800/20 dark:text-gray-400";
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold">{record.clientName}</h2>
          <p className="text-muted-foreground">ID: {record.idNumber}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link href={`/records/${record.id}/edit`}>
            <Button variant="outline" className="flex items-center">
              <Edit className="mr-2 h-4 w-4" />
              Edit Record
            </Button>
          </Link>
          <Button variant="outline" onClick={handlePrint}>
            <Printer className="mr-2 h-4 w-4" />
            Print
          </Button>
          <Button variant="outline" onClick={handleExport}>
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive">
                <Trash2 className="mr-2 h-4 w-4" />
                Delete
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                <AlertDialogDescription>
                  This action cannot be undone. This will permanently delete the
                  loan record for {record.clientName} and remove all associated data
                  from our servers.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleDelete}
                  disabled={isDeleting}
                  className="bg-red-600 hover:bg-red-700"
                >
                  {isDeleting ? "Deleting..." : "Delete"}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>

      <Tabs defaultValue="details">
        <TabsList className="grid grid-cols-4 w-full max-w-md">
          <TabsTrigger value="details">Details</TabsTrigger>
          <TabsTrigger value="contacts">Contacts</TabsTrigger>
          <TabsTrigger value="schedule">Schedule</TabsTrigger>
          <TabsTrigger value="documents">Documents</TabsTrigger>
        </TabsList>

        {/* Details Tab */}
        <TabsContent value="details" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Loan Details</CardTitle>
              <CardDescription>
                Basic information about this loan
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-1">
                  <p className="text-sm font-medium text-muted-foreground">Status</p>
                  <p>
                    <Badge className={getStatusColor(record.status)}>
                      {record.status.charAt(0).toUpperCase() + record.status.slice(1)}
                    </Badge>
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-medium text-muted-foreground">Loan Officer</p>
                  <p>{record.loanOfficer}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-medium text-muted-foreground">Loan Amount</p>
                  <p className="text-xl font-bold">${record.loanAmount.toLocaleString()}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-medium text-muted-foreground">Interest Rate</p>
                  <p>{record.interestRate}%</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-medium text-muted-foreground">Registration Fee</p>
                  <p>${record.registrationFee.toLocaleString()}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-medium text-muted-foreground">Loan Duration</p>
                  <p>{record.loanDuration} days</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-medium text-muted-foreground">Daily Payment Check</p>
                  <p>{record.dailyPaymentCheck ? "Yes" : "No"}</p>
                </div>
              </div>

              <Separator />

              <div className="space-y-4">
                <h3 className="text-lg font-medium">Client Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-muted-foreground">Phone Number (Primary)</p>
                    <p>{record.phoneNumber1}</p>
                  </div>
                  {record.phoneNumber2 && (
                    <div className="space-y-1">
                      <p className="text-sm font-medium text-muted-foreground">Phone Number (Secondary)</p>
                      <p>{record.phoneNumber2}</p>
                    </div>
                  )}
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-muted-foreground">Business Location</p>
                    <p>{record.businessLocation}</p>
                  </div>
                  {record.permitNumber && (
                    <div className="space-y-1">
                      <p className="text-sm font-medium text-muted-foreground">Business Permit Number</p>
                      <p>{record.permitNumber}</p>
                    </div>
                  )}
                  <div className="col-span-1 md:col-span-2 space-y-1">
                    <p className="text-sm font-medium text-muted-foreground">Home Address</p>
                    <p>{record.homeAddress}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Contacts Tab */}
        <TabsContent value="contacts" className="space-y-6">
          {/* Guarantor Information */}
          <Card>
            <CardHeader>
              <div className="flex items-center">
                <UserCheck className="mr-2 h-5 w-5 text-blue-600 dark:text-blue-400" />
                <CardTitle>Guarantor</CardTitle>
              </div>
              <CardDescription>
                Person who guarantees this loan
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-1">
                  <p className="text-sm font-medium text-muted-foreground">Name</p>
                  <p>{record.guarantor.name}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-medium text-muted-foreground">ID Number</p>
                  <p>{record.guarantor.idNumber}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-medium text-muted-foreground">Phone Number</p>
                  <p>{record.guarantor.phoneNumber}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* References */}
          <Card>
            <CardHeader>
              <div className="flex items-center">
                <UserCheck className="mr-2 h-5 w-5 text-green-600 dark:text-green-400" />
                <CardTitle>References</CardTitle>
              </div>
              <CardDescription>
                List of references for this loan
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Phone Number</TableHead>
                    <TableHead>Relationship</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {record.references.map((reference: any, index: number) => (
                    <TableRow key={index}>
                      <TableCell>{reference.name}</TableCell>
                      <TableCell>{reference.phoneNumber}</TableCell>
                      <TableCell>{reference.relationship}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Schedule Tab */}
        <TabsContent value="schedule" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center">
                <CalendarClock className="mr-2 h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                <CardTitle>Loan Schedule</CardTitle>
              </div>
              <CardDescription>
                Important dates for this loan
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-1">
                  <p className="text-sm font-medium text-muted-foreground">Application Date</p>
                  <p>{formatDate(record.applicationDate)}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-medium text-muted-foreground">Disbursement Date</p>
                  <p>{formatDate(record.disbursementDate)}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-medium text-muted-foreground">First Installment Date</p>
                  <p>{formatDate(record.firstInstallmentDate)}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-medium text-muted-foreground">Last Installment Date</p>
                  <p>{formatDate(record.lastInstallmentDate)}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Payment Tracking - would be populated with real data in a full app */}
          <Card>
            <CardHeader>
              <CardTitle>Payment Tracking</CardTitle>
              <CardDescription>
                Record of payments made against this loan
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-center p-6 text-muted-foreground">
                <p>Payment tracking feature coming soon</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Documents Tab */}
        <TabsContent value="documents" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center">
                <Image className="mr-2 h-5 w-5 text-purple-600 dark:text-purple-400" />
                <CardTitle>Images</CardTitle>
              </div>
              <CardDescription>
                Photos related to this loan application
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-center p-6 text-muted-foreground">
                <p>Image viewing feature coming soon</p>
              </div>
            </CardContent>
            <CardFooter>
              <Button variant="outline" className="w-full">
                Upload New Images
              </Button>
            </CardFooter>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-center">
                <FileText className="mr-2 h-5 w-5 text-orange-600 dark:text-orange-400" />
                <CardTitle>Documents</CardTitle>
              </div>
              <CardDescription>
                PDF and other documents related to this loan
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-center p-6 text-muted-foreground">
                <p>Document viewing feature coming soon</p>
              </div>
            </CardContent>
            <CardFooter>
              <Button variant="outline" className="w-full">
                Upload New Documents
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}