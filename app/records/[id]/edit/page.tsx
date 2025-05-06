"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import DashboardHeader from "@/components/dashboard/dashboard-header";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "@/hooks/use-toast";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { CalendarIcon, Loader2, ArrowLeft } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// Define the form schema with Zod
const formSchema = z.object({
  // Client Information
  clientName: z.string().min(2, "Name must be at least 2 characters"),
  idNumber: z.string().min(5, "ID Number must be at least 5 characters"),
  phoneNumber1: z.string().min(10, "Phone number must be at least 10 characters"),
  phoneNumber2: z.string().optional(),
  businessLocation: z.string().min(3, "Business location is required"),
  permitNumber: z.string().optional(),
  homeAddress: z.string().min(3, "Home address is required"),

  // Loan Details
  loanAmount: z.coerce.number().positive("Loan amount must be positive"),
  interestRate: z.coerce.number().min(0, "Interest rate must be positive"),
  registrationFee: z.coerce.number().min(0, "Registration fee must be positive"),
  loanDuration: z.coerce.number().positive("Loan duration must be positive"),
  applicationDate: z.date(),
  disbursementDate: z.date().optional().nullable(),
  firstInstallmentDate: z.date().optional().nullable(),
  lastInstallmentDate: z.date().optional().nullable(),
  dailyPaymentCheck: z.boolean().default(false),
  loanOfficer: z.string().min(2, "Loan officer name is required"),
  status: z.string(),

  // Guarantor Information
  guarantorName: z.string().min(2, "Guarantor name is required"),
  guarantorIdNumber: z.string().min(5, "Guarantor ID is required"),
  guarantorPhoneNumber: z.string().min(10, "Guarantor phone is required"),

  // References (4 required)
  reference1Name: z.string().min(2, "Reference name is required"),
  reference1Phone: z.string().min(10, "Reference phone is required"),
  reference1Relationship: z.string().min(2, "Relationship is required"),
  
  reference2Name: z.string().min(2, "Reference name is required"),
  reference2Phone: z.string().min(10, "Reference phone is required"),
  reference2Relationship: z.string().min(2, "Relationship is required"),
  
  reference3Name: z.string().min(2, "Reference name is required"),
  reference3Phone: z.string().min(10, "Reference phone is required"),
  reference3Relationship: z.string().min(2, "Relationship is required"),
  
  reference4Name: z.string().min(2, "Reference name is required"),
  reference4Phone: z.string().min(10, "Reference phone is required"),
  reference4Relationship: z.string().min(2, "Relationship is required"),
});

type FormValues = z.infer<typeof formSchema>;

export default function EditLoanRecordPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState("client");
  const router = useRouter();
  const params = useParams();

  // Initialize form
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      applicationDate: new Date(),
      dailyPaymentCheck: false,
      status: "PENDING",
    },
  });

  // Fetch loan record data
  useEffect(() => {
    async function fetchLoanRecord() {
      if (!params.id) return;
      
      try {
        setIsLoading(true);
        const response = await fetch(`/api/loans/${params.id}`);
        
        if (!response.ok) {
          throw new Error('Failed to fetch loan record');
        }
        
        const data = await response.json();
        console.log('Loan record data:', data);
        
        // Format dates
        const formattedData = {
          ...data,
          applicationDate: data.applicationDate ? new Date(data.applicationDate) : new Date(),
          disbursementDate: data.disbursementDate ? new Date(data.disbursementDate) : null,
          firstInstallmentDate: data.firstInstallmentDate ? new Date(data.firstInstallmentDate) : null,
          lastInstallmentDate: data.lastInstallmentDate ? new Date(data.lastInstallmentDate) : null,
        };
        
        // Map guarantor data if exists
        if (data.guarantors && data.guarantors.length > 0) {
          const guarantor = data.guarantors[0];
          formattedData.guarantorName = guarantor.name;
          formattedData.guarantorIdNumber = guarantor.idNumber;
          formattedData.guarantorPhoneNumber = guarantor.phoneNumber;
        }
        
        // Map references data if exists
        if (data.references && data.references.length > 0) {
          const refs = data.references;
          if (refs[0]) {
            formattedData.reference1Name = refs[0].name;
            formattedData.reference1Phone = refs[0].phoneNumber;
            formattedData.reference1Relationship = refs[0].relationship;
          }
          if (refs[1]) {
            formattedData.reference2Name = refs[1].name;
            formattedData.reference2Phone = refs[1].phoneNumber;
            formattedData.reference2Relationship = refs[1].relationship;
          }
          if (refs[2]) {
            formattedData.reference3Name = refs[2].name;
            formattedData.reference3Phone = refs[2].phoneNumber;
            formattedData.reference3Relationship = refs[2].relationship;
          }
          if (refs[3]) {
            formattedData.reference4Name = refs[3].name;
            formattedData.reference4Phone = refs[3].phoneNumber;
            formattedData.reference4Relationship = refs[3].relationship;
          }
        }
        
        // Set form values
        form.reset(formattedData);
      } catch (err) {
        console.error('Error fetching loan record:', err);
        toast({
          title: "Error",
          description: "Failed to load loan record details",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    }

    fetchLoanRecord();
  }, [params.id, form]);

  // Handle form submission
  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsSubmitting(true);
    try {
      // Format guarantor data
      const guarantors = [
        {
          name: values.guarantorName,
          idNumber: values.guarantorIdNumber,
          phoneNumber: values.guarantorPhoneNumber,
        },
      ];

      // Format references data
      const references = [];
      
      if (values.reference1Name && values.reference1Phone) {
        references.push({
          name: values.reference1Name,
          phoneNumber: values.reference1Phone,
          relationship: values.reference1Relationship,
        });
      }
      
      if (values.reference2Name && values.reference2Phone) {
        references.push({
          name: values.reference2Name,
          phoneNumber: values.reference2Phone,
          relationship: values.reference2Relationship,
        });
      }
      
      if (values.reference3Name && values.reference3Phone) {
        references.push({
          name: values.reference3Name,
          phoneNumber: values.reference3Phone,
          relationship: values.reference3Relationship,
        });
      }
      
      if (values.reference4Name && values.reference4Phone) {
        references.push({
          name: values.reference4Name,
          phoneNumber: values.reference4Phone,
          relationship: values.reference4Relationship,
        });
      }

      // Prepare the data to send to the API
      const formData = {
        clientName: values.clientName,
        idNumber: values.idNumber,
        phoneNumber1: values.phoneNumber1,
        phoneNumber2: values.phoneNumber2,
        businessLocation: values.businessLocation,
        permitNumber: values.permitNumber,
        homeAddress: values.homeAddress,
        
        loanAmount: values.loanAmount,
        interestRate: values.interestRate,
        registrationFee: values.registrationFee,
        loanDuration: values.loanDuration,
        applicationDate: values.applicationDate,
        disbursementDate: values.disbursementDate,
        firstInstallmentDate: values.firstInstallmentDate,
        lastInstallmentDate: values.lastInstallmentDate,
        dailyPaymentCheck: values.dailyPaymentCheck,
        loanOfficer: values.loanOfficer,
        status: values.status,
        
        guarantors,
        references,
      };

      // Send the data to the API
      const response = await fetch(`/api/loans/${params.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update loan record');
      }

      const data = await response.json();
      
      // Show success toast
      toast({
        title: "Success!",
        description: "Loan record updated successfully.",
        variant: "default",
      });
      
      // Redirect to the loan record page
      router.push(`/records/${params.id}`);
    } catch (error) {
      console.error('Error updating loan record:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to update loan record",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <DashboardHeader />
      <main className="container mx-auto py-8 px-4">
        <div className="flex items-center gap-2 mb-6">
          <Button 
            variant="outline" 
            onClick={() => router.back()}
            size="sm"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
          <h1 className="text-3xl font-bold">Edit Loan Record</h1>
        </div>

        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : (
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
            <TabsList className="grid grid-cols-4 w-full max-w-2xl">
              <TabsTrigger value="client">Client Info</TabsTrigger>
              <TabsTrigger value="loan">Loan Details</TabsTrigger>
              <TabsTrigger value="guarantor">Guarantor</TabsTrigger>
              <TabsTrigger value="references">References</TabsTrigger>
            </TabsList>

            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)}>
                <div className="space-y-6">
                  {/* Client Information Tab */}
                  <TabsContent value="client">
                    <Card>
                      <CardHeader>
                        <CardTitle>Client Information</CardTitle>
                        <CardDescription>
                          Edit the client's personal and business details
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <FormField
                            control={form.control}
                            name="clientName"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Client Name</FormLabel>
                                <FormControl>
                                  <Input {...field} placeholder="Full name" />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={form.control}
                            name="idNumber"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>ID Number</FormLabel>
                                <FormControl>
                                  <Input {...field} placeholder="ID123456" />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <FormField
                            control={form.control}
                            name="phoneNumber1"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Primary Phone Number</FormLabel>
                                <FormControl>
                                  <Input
                                    {...field}
                                    placeholder="e.g., 0712345678"
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={form.control}
                            name="phoneNumber2"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>
                                  Secondary Phone Number (Optional)
                                </FormLabel>
                                <FormControl>
                                  <Input
                                    {...field}
                                    placeholder="e.g., 0712345678"
                                    value={field.value || ""}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>

                        <Separator />

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <FormField
                            control={form.control}
                            name="businessLocation"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Business Location</FormLabel>
                                <FormControl>
                                  <Input
                                    {...field}
                                    placeholder="123 Business St"
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={form.control}
                            name="permitNumber"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>
                                  Business Permit Number (Optional)
                                </FormLabel>
                                <FormControl>
                                  <Input
                                    {...field}
                                    placeholder="PERMIT-123456"
                                    value={field.value || ""}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>

                        <FormField
                          control={form.control}
                          name="homeAddress"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Home Address</FormLabel>
                              <FormControl>
                                <Textarea
                                  {...field}
                                  placeholder="Full home address"
                                  rows={3}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </CardContent>
                      <CardFooter className="flex justify-between">
                        <Button
                          variant="outline"
                          onClick={() => router.push(`/records/${params.id}`)}
                        >
                          Cancel
                        </Button>
                        <Button
                          type="button"
                          onClick={() => setActiveTab("loan")}
                        >
                          Next: Loan Details
                        </Button>
                      </CardFooter>
                    </Card>
                  </TabsContent>

                  {/* Loan Details Tab */}
                  <TabsContent value="loan">
                    <Card>
                      <CardHeader>
                        <CardTitle>Loan Details</CardTitle>
                        <CardDescription>
                          Edit the loan amount, terms, and schedule
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <FormField
                            control={form.control}
                            name="loanAmount"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Loan Amount</FormLabel>
                                <FormControl>
                                  <Input
                                    {...field}
                                    type="number"
                                    placeholder="0.00"
                                    step="0.01"
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={form.control}
                            name="interestRate"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Interest Rate (%)</FormLabel>
                                <FormControl>
                                  <Input
                                    {...field}
                                    type="number"
                                    placeholder="10"
                                    step="0.1"
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={form.control}
                            name="registrationFee"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Registration Fee</FormLabel>
                                <FormControl>
                                  <Input
                                    {...field}
                                    type="number"
                                    placeholder="0.00"
                                    step="0.01"
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <FormField
                            control={form.control}
                            name="loanDuration"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Loan Duration (days)</FormLabel>
                                <FormControl>
                                  <Input
                                    {...field}
                                    type="number"
                                    placeholder="30"
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={form.control}
                            name="loanOfficer"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Loan Officer</FormLabel>
                                <FormControl>
                                  <Input
                                    {...field}
                                    placeholder="Officer name"
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>

                        <FormField
                          control={form.control}
                          name="status"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Loan Status</FormLabel>
                              <Select
                                onValueChange={field.onChange}
                                defaultValue={field.value}
                                value={field.value}
                              >
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select loan status" />
                                  </SelectTrigger>
                                </FormControl>
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
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <Separator />

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <FormField
                            control={form.control}
                            name="applicationDate"
                            render={({ field }) => (
                              <FormItem className="flex flex-col">
                                <FormLabel>Application Date</FormLabel>
                                <Popover>
                                  <PopoverTrigger asChild>
                                    <FormControl>
                                      <Button
                                        variant={"outline"}
                                        className={cn(
                                          "w-full pl-3 text-left font-normal",
                                          !field.value && "text-muted-foreground"
                                        )}
                                      >
                                        {field.value ? (
                                          format(field.value, "PPP")
                                        ) : (
                                          <span>Pick a date</span>
                                        )}
                                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                      </Button>
                                    </FormControl>
                                  </PopoverTrigger>
                                  <PopoverContent className="w-auto p-0" align="start">
                                    <Calendar
                                      mode="single"
                                      selected={field.value}
                                      onSelect={field.onChange}
                                      initialFocus
                                    />
                                  </PopoverContent>
                                </Popover>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={form.control}
                            name="disbursementDate"
                            render={({ field }) => (
                              <FormItem className="flex flex-col">
                                <FormLabel>Disbursement Date</FormLabel>
                                <Popover>
                                  <PopoverTrigger asChild>
                                    <FormControl>
                                      <Button
                                        variant={"outline"}
                                        className={cn(
                                          "w-full pl-3 text-left font-normal",
                                          !field.value && "text-muted-foreground"
                                        )}
                                      >
                                        {field.value ? (
                                          format(field.value, "PPP")
                                        ) : (
                                          <span>Pick a date</span>
                                        )}
                                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                      </Button>
                                    </FormControl>
                                  </PopoverTrigger>
                                  <PopoverContent className="w-auto p-0" align="start">
                                    <Calendar
                                      mode="single"
                                      selected={field.value || undefined}
                                      onSelect={field.onChange}
                                      initialFocus
                                    />
                                  </PopoverContent>
                                </Popover>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <FormField
                            control={form.control}
                            name="firstInstallmentDate"
                            render={({ field }) => (
                              <FormItem className="flex flex-col">
                                <FormLabel>First Installment Date</FormLabel>
                                <Popover>
                                  <PopoverTrigger asChild>
                                    <FormControl>
                                      <Button
                                        variant={"outline"}
                                        className={cn(
                                          "w-full pl-3 text-left font-normal",
                                          !field.value && "text-muted-foreground"
                                        )}
                                      >
                                        {field.value ? (
                                          format(field.value, "PPP")
                                        ) : (
                                          <span>Pick a date</span>
                                        )}
                                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                      </Button>
                                    </FormControl>
                                  </PopoverTrigger>
                                  <PopoverContent className="w-auto p-0" align="start">
                                    <Calendar
                                      mode="single"
                                      selected={field.value || undefined}
                                      onSelect={field.onChange}
                                      initialFocus
                                    />
                                  </PopoverContent>
                                </Popover>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={form.control}
                            name="lastInstallmentDate"
                            render={({ field }) => (
                              <FormItem className="flex flex-col">
                                <FormLabel>Last Installment Date</FormLabel>
                                <Popover>
                                  <PopoverTrigger asChild>
                                    <FormControl>
                                      <Button
                                        variant={"outline"}
                                        className={cn(
                                          "w-full pl-3 text-left font-normal",
                                          !field.value && "text-muted-foreground"
                                        )}
                                      >
                                        {field.value ? (
                                          format(field.value, "PPP")
                                        ) : (
                                          <span>Pick a date</span>
                                        )}
                                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                      </Button>
                                    </FormControl>
                                  </PopoverTrigger>
                                  <PopoverContent className="w-auto p-0" align="start">
                                    <Calendar
                                      mode="single"
                                      selected={field.value || undefined}
                                      onSelect={field.onChange}
                                      initialFocus
                                    />
                                  </PopoverContent>
                                </Popover>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>

                        <FormField
                          control={form.control}
                          name="dailyPaymentCheck"
                          render={({ field }) => (
                            <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                              <FormControl>
                                <Checkbox
                                  checked={field.value}
                                  onCheckedChange={field.onChange}
                                />
                              </FormControl>
                              <div className="space-y-1 leading-none">
                                <FormLabel>Daily Payment Check</FormLabel>
                                <FormDescription>
                                  Check this if the loan requires daily payment verification.
                                </FormDescription>
                              </div>
                            </FormItem>
                          )}
                        />
                      </CardContent>
                      <CardFooter className="flex justify-between">
                        <Button
                          variant="outline"
                          type="button"
                          onClick={() => setActiveTab("client")}
                        >
                          Back: Client Info
                        </Button>
                        <Button
                          type="button"
                          onClick={() => setActiveTab("guarantor")}
                        >
                          Next: Guarantor
                        </Button>
                      </CardFooter>
                    </Card>
                  </TabsContent>

                  {/* Guarantor Tab */}
                  <TabsContent value="guarantor">
                    <Card>
                      <CardHeader>
                        <CardTitle>Guarantor Information</CardTitle>
                        <CardDescription>
                          Edit guarantor details for this loan
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <FormField
                          control={form.control}
                          name="guarantorName"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Guarantor Name</FormLabel>
                              <FormControl>
                                <Input {...field} placeholder="Full name" />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <FormField
                            control={form.control}
                            name="guarantorIdNumber"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Guarantor ID Number</FormLabel>
                                <FormControl>
                                  <Input {...field} placeholder="ID123456" />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={form.control}
                            name="guarantorPhoneNumber"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Guarantor Phone Number</FormLabel>
                                <FormControl>
                                  <Input
                                    {...field}
                                    placeholder="e.g., 0712345678"
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                      </CardContent>
                      <CardFooter className="flex justify-between">
                        <Button
                          variant="outline"
                          type="button"
                          onClick={() => setActiveTab("loan")}
                        >
                          Back: Loan Details
                        </Button>
                        <Button
                          type="button"
                          onClick={() => setActiveTab("references")}
                        >
                          Next: References
                        </Button>
                      </CardFooter>
                    </Card>
                  </TabsContent>

                  {/* References Tab */}
                  <TabsContent value="references">
                    <Card>
                      <CardHeader>
                        <CardTitle>References</CardTitle>
                        <CardDescription>
                          Edit reference contacts for this loan
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-6">
                        {/* Reference 1 */}
                        <div>
                          <h3 className="text-lg font-medium mb-2">Reference 1</h3>
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <FormField
                              control={form.control}
                              name="reference1Name"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Name</FormLabel>
                                  <FormControl>
                                    <Input {...field} placeholder="Full name" />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />

                            <FormField
                              control={form.control}
                              name="reference1Phone"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Phone Number</FormLabel>
                                  <FormControl>
                                    <Input
                                      {...field}
                                      placeholder="e.g., 0712345678"
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />

                            <FormField
                              control={form.control}
                              name="reference1Relationship"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Relationship</FormLabel>
                                  <FormControl>
                                    <Input
                                      {...field}
                                      placeholder="e.g., Family, Friend"
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </div>
                        </div>

                        {/* Reference 2 */}
                        <div>
                          <h3 className="text-lg font-medium mb-2">Reference 2</h3>
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <FormField
                              control={form.control}
                              name="reference2Name"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Name</FormLabel>
                                  <FormControl>
                                    <Input {...field} placeholder="Full name" />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />

                            <FormField
                              control={form.control}
                              name="reference2Phone"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Phone Number</FormLabel>
                                  <FormControl>
                                    <Input
                                      {...field}
                                      placeholder="e.g., 0712345678"
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />

                            <FormField
                              control={form.control}
                              name="reference2Relationship"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Relationship</FormLabel>
                                  <FormControl>
                                    <Input
                                      {...field}
                                      placeholder="e.g., Family, Friend"
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </div>
                        </div>

                        {/* Reference 3 */}
                        <div>
                          <h3 className="text-lg font-medium mb-2">Reference 3</h3>
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <FormField
                              control={form.control}
                              name="reference3Name"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Name</FormLabel>
                                  <FormControl>
                                    <Input {...field} placeholder="Full name" />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />

                            <FormField
                              control={form.control}
                              name="reference3Phone"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Phone Number</FormLabel>
                                  <FormControl>
                                    <Input
                                      {...field}
                                      placeholder="e.g., 0712345678"
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />

                            <FormField
                              control={form.control}
                              name="reference3Relationship"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Relationship</FormLabel>
                                  <FormControl>
                                    <Input
                                      {...field}
                                      placeholder="e.g., Family, Friend"
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </div>
                        </div>

                        {/* Reference 4 */}
                        <div>
                          <h3 className="text-lg font-medium mb-2">Reference 4</h3>
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <FormField
                              control={form.control}
                              name="reference4Name"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Name</FormLabel>
                                  <FormControl>
                                    <Input {...field} placeholder="Full name" />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />

                            <FormField
                              control={form.control}
                              name="reference4Phone"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Phone Number</FormLabel>
                                  <FormControl>
                                    <Input
                                      {...field}
                                      placeholder="e.g., 0712345678"
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />

                            <FormField
                              control={form.control}
                              name="reference4Relationship"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Relationship</FormLabel>
                                  <FormControl>
                                    <Input
                                      {...field}
                                      placeholder="e.g., Family, Friend"
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </div>
                        </div>
                      </CardContent>
                      <CardFooter className="flex justify-between">
                        <Button
                          variant="outline"
                          type="button"
                          onClick={() => setActiveTab("guarantor")}
                        >
                          Back: Guarantor
                        </Button>
                        <Button type="submit" disabled={isSubmitting}>
                          {isSubmitting ? (
                            <>
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              Saving...
                            </>
                          ) : (
                            "Save Changes"
                          )}
                        </Button>
                      </CardFooter>
                    </Card>
                  </TabsContent>
                </div>
              </form>
            </Form>
          </Tabs>
        )}
      </main>
    </div>
  );
}
