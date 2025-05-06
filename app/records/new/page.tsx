"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
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
import DashboardHeader from "@/components/dashboard/dashboard-header";
import { toast } from "@/hooks/use-toast";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { CalendarIcon, Loader2 } from "lucide-react";
import { useUser } from "@clerk/nextjs";
import { FileUpload } from "@/components/ui/file-upload";
import { uploadToCloudinary } from "@/lib/cloudinary";

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
  disbursementDate: z.date().optional(),
  firstInstallmentDate: z.date().optional(),
  lastInstallmentDate: z.date().optional(),
  dailyPaymentCheck: z.boolean().default(false),
  loanOfficer: z.string().min(2, "Loan officer name is required"),
  status: z.string().optional(),
  contractFile: z.instanceof(File).optional(),

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

export default function NewLoanRecordPage() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState("client");
  const [contractFile, setContractFile] = useState<File | null>(null);
  const router = useRouter();
  const { user } = useUser();
  
  // Define default values for the form
  const defaultValues: Partial<FormValues> = {
    applicationDate: new Date(),
    dailyPaymentCheck: true,
    interestRate: 10, // Default 10%
    registrationFee: 0,
    loanDuration: 30, // Default 30 days
  };

  // Initialize form
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues,
  });

  // Handle form submission
  async function onSubmit(data: FormValues) {
    setIsSubmitting(true);
    
    try {
      // Format guarantor data
      const guarantors = [
        {
          name: data.guarantorName,
          idNumber: data.guarantorIdNumber,
          phoneNumber: data.guarantorPhoneNumber,
        },
      ];

      // Format references data
      const references = [
        {
          name: data.reference1Name,
          phoneNumber: data.reference1Phone,
          relationship: data.reference1Relationship,
        },
        {
          name: data.reference2Name,
          phoneNumber: data.reference2Phone,
          relationship: data.reference2Relationship,
        },
        {
          name: data.reference3Name,
          phoneNumber: data.reference3Phone,
          relationship: data.reference3Relationship,
        },
        {
          name: data.reference4Name,
          phoneNumber: data.reference4Phone,
          relationship: data.reference4Relationship,
        },
      ];

      // Upload contract file if provided
      let mediaFiles = [];
      if (contractFile) {
        try {
          const uploadResult = await uploadToCloudinary(contractFile);
          mediaFiles.push({
            fileName: contractFile.name,
            fileType: contractFile.type,
            fileUrl: uploadResult.secure_url,
            description: "Signed Contract",
          });
        } catch (uploadError) {
          console.error("Error uploading contract:", uploadError);
          toast({
            title: "Upload Error",
            description: "Failed to upload contract file. Please try again.",
            variant: "destructive",
          });
        }
      }

      // Prepare the data to send to the API
      const formData = {
        clientName: data.clientName,
        idNumber: data.idNumber,
        phoneNumber1: data.phoneNumber1,
        phoneNumber2: data.phoneNumber2 || null,
        businessLocation: data.businessLocation,
        permitNumber: data.permitNumber || null,
        homeAddress: data.homeAddress,
        
        loanAmount: data.loanAmount,
        interestRate: data.interestRate,
        registrationFee: data.registrationFee,
        loanDuration: data.loanDuration,
        applicationDate: data.applicationDate,
        disbursementDate: data.disbursementDate,
        firstInstallmentDate: data.firstInstallmentDate,
        lastInstallmentDate: data.lastInstallmentDate,
        dailyPaymentCheck: data.dailyPaymentCheck,
        loanOfficer: data.loanOfficer || user?.fullName || "Admin",
        status: data.status || "PENDING",
        
        guarantors,
        references,
        mediaFiles,
      };
      
      console.log("Submitting loan data:", formData);
      
      // Send data to the API
      const response = await fetch('/api/loans', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create loan record');
      }
      
      const result = await response.json();
      
      toast({
        title: "Loan record created",
        description: `Loan record for ${data.clientName} has been created successfully.`,
      });
      
      // Redirect to the records page
      router.push("/records");
    } catch (error) {
      console.error("Error submitting form:", error);
      toast({
        title: "Failed to create record",
        description: error instanceof Error ? error.message : "There was an error creating the loan record. Please try again.",
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
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold">New Loan Application</h1>
        </div>

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
                        Enter the client's personal and business details
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
                                <Input {...field} placeholder="+1234567890" />
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
                                <Input {...field} placeholder="+1234567890" />
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
                        onClick={() => router.push("/dashboard")}
                      >
                        Cancel
                      </Button>
                      <Button
                        type="button"
                        onClick={() => {
                          // Validate client info fields before proceeding
                          const clientFields = ['clientName', 'idNumber', 'phoneNumber1', 'businessLocation', 'homeAddress'];
                          const isValid = clientFields.every(field => form.getValues(field as any));
                          
                          if (isValid) {
                            setActiveTab("loan");
                          } else {
                            // Trigger validation to show errors
                            clientFields.forEach(field => form.trigger(field as any));
                            
                            toast({
                              title: "Missing information",
                              description: "Please fill in all required client information fields.",
                              variant: "destructive",
                            });
                          }
                        }}
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
                        Enter the loan amount, terms, and schedule
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
                            <FormDescription>
                              Number of days until the loan is fully paid
                            </FormDescription>
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
                                <PopoverContent
                                  className="w-auto p-0"
                                  align="start"
                                >
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
                              <FormLabel>Disbursement Date (Optional)</FormLabel>
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
                                <PopoverContent
                                  className="w-auto p-0"
                                  align="start"
                                >
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
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name="firstInstallmentDate"
                          render={({ field }) => (
                            <FormItem className="flex flex-col">
                              <FormLabel>
                                First Installment Date (Optional)
                              </FormLabel>
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
                                <PopoverContent
                                  className="w-auto p-0"
                                  align="start"
                                >
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
                          name="lastInstallmentDate"
                          render={({ field }) => (
                            <FormItem className="flex flex-col">
                              <FormLabel>
                                Last Installment Date (Optional)
                              </FormLabel>
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
                                <PopoverContent
                                  className="w-auto p-0"
                                  align="start"
                                >
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

                      <div className="mt-6">
                        <FileUpload
                          label="Signed Contract"
                          description="Upload the signed loan contract (PDF)"
                          accept=".pdf"
                          maxSize={10}
                          onFileChange={setContractFile}
                          value={contractFile}
                        />
                      </div>
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
                        onClick={() => {
                          // Validate loan details fields before proceeding
                          const loanFields = ['loanAmount', 'interestRate', 'loanDuration', 'applicationDate'];
                          const isValid = loanFields.every(field => form.getValues(field as any));
                          
                          if (isValid) {
                            setActiveTab("guarantor");
                          } else {
                            // Trigger validation to show errors
                            loanFields.forEach(field => form.trigger(field as any));
                            
                            toast({
                              title: "Missing information",
                              description: "Please fill in all required loan details fields.",
                              variant: "destructive",
                            });
                          }
                        }}
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
                        Enter the details of the loan guarantor
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
                                <Input {...field} placeholder="+1234567890" />
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
                        onClick={() => {
                          // Validate guarantor fields before proceeding
                          const guarantorFields = ['guarantorName', 'guarantorIdNumber', 'guarantorPhoneNumber'];
                          const isValid = guarantorFields.every(field => form.getValues(field as any));
                          
                          if (isValid) {
                            setActiveTab("references");
                          } else {
                            // Trigger validation to show errors
                            guarantorFields.forEach(field => form.trigger(field as any));
                            
                            toast({
                              title: "Missing information",
                              description: "Please fill in all required guarantor information fields.",
                              variant: "destructive",
                            });
                          }
                        }}
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
                        Enter details for four references
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-8">
                      {/* Reference 1 */}
                      <div className="space-y-4">
                        <h3 className="text-lg font-medium">Reference 1</h3>
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
                                    placeholder="+1234567890"
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
                                    placeholder="Family, Friend, etc."
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                      </div>

                      <Separator />

                      {/* Reference 2 */}
                      <div className="space-y-4">
                        <h3 className="text-lg font-medium">Reference 2</h3>
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
                                    placeholder="+1234567890"
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
                                    placeholder="Family, Friend, etc."
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                      </div>

                      <Separator />

                      {/* Reference 3 */}
                      <div className="space-y-4">
                        <h3 className="text-lg font-medium">Reference 3</h3>
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
                                    placeholder="+1234567890"
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
                                    placeholder="Family, Friend, etc."
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                      </div>

                      <Separator />

                      {/* Reference 4 */}
                      <div className="space-y-4">
                        <h3 className="text-lg font-medium">Reference 4</h3>
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
                                    placeholder="+1234567890"
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
                                    placeholder="Family, Friend, etc."
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
                            Submitting...
                          </>
                        ) : (
                          "Submit Application"
                        )}
                      </Button>
                    </CardFooter>
                  </Card>
                </TabsContent>
              </div>
            </form>
          </Form>
        </Tabs>
      </main>
    </div>
  );
}