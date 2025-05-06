"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { CalendarIcon, Download, FileSpreadsheet, FileText, Loader2 } from "lucide-react";
import { toast } from "@/hooks/use-toast";

type ExportFormat = "csv" | "pdf";
type ReportType = "loans" | "payments" | "clients" | "summary";

interface ExportReportsProps {
  className?: string;
}

export default function ExportReports({ className }: ExportReportsProps) {
  const [open, setOpen] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [reportType, setReportType] = useState<ReportType>("loans");
  const [exportFormat, setExportFormat] = useState<ExportFormat>("csv");
  const [dateRange, setDateRange] = useState<{
    from: Date | undefined;
    to: Date | undefined;
  }>({
    from: new Date(new Date().getFullYear(), new Date().getMonth(), 1), // First day of current month
    to: new Date(),
  });

  const handleExport = async () => {
    if (!dateRange.from || !dateRange.to) {
      toast({
        title: "Date range required",
        description: "Please select a start and end date for the report",
        variant: "destructive",
      });
      return;
    }

    setIsExporting(true);

    try {
      // Format dates for API
      const fromDate = format(dateRange.from, "yyyy-MM-dd");
      const toDate = format(dateRange.to, "yyyy-MM-dd");

      // Call the export API
      const response = await fetch(
        `/api/reports/export?type=${reportType}&format=${exportFormat}&from=${fromDate}&to=${toDate}`,
        {
          method: "GET",
        }
      );

      if (!response.ok) {
        throw new Error("Failed to generate report");
      }

      // Get the blob from the response
      const blob = await response.blob();
      
      // Create a URL for the blob
      const url = window.URL.createObjectURL(blob);
      
      // Create a link element
      const link = document.createElement("a");
      
      // Set link properties
      link.href = url;
      link.download = `${reportType}_report_${fromDate}_to_${toDate}.${exportFormat}`;
      
      // Append to the document
      document.body.appendChild(link);
      
      // Trigger download
      link.click();
      
      // Clean up
      window.URL.revokeObjectURL(url);
      document.body.removeChild(link);
      
      toast({
        title: "Report exported",
        description: `Your ${reportType} report has been downloaded`,
        variant: "default",
      });
      
      setOpen(false);
    } catch (error) {
      console.error("Error exporting report:", error);
      toast({
        title: "Export failed",
        description: "There was an error exporting your report. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className={cn("flex items-center gap-1", className)}>
          <Download className="h-4 w-4" />
          <span>Export</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Export Report</DialogTitle>
          <DialogDescription>
            Generate a report of your loan data. Choose the type of report and date range.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="report-type">Report Type</Label>
            <Select
              value={reportType}
              onValueChange={(value: ReportType) => setReportType(value)}
            >
              <SelectTrigger id="report-type">
                <SelectValue placeholder="Select report type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="loans">Loan Records</SelectItem>
                <SelectItem value="payments">Payment History</SelectItem>
                <SelectItem value="clients">Client List</SelectItem>
                <SelectItem value="summary">Summary Report</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="grid gap-2">
            <Label htmlFor="date-range">Date Range</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  id="date-range"
                  variant={"outline"}
                  className={cn(
                    "justify-start text-left font-normal",
                    !dateRange && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {dateRange?.from ? (
                    dateRange.to ? (
                      <>
                        {format(dateRange.from, "LLL dd, y")} -{" "}
                        {format(dateRange.to, "LLL dd, y")}
                      </>
                    ) : (
                      format(dateRange.from, "LLL dd, y")
                    )
                  ) : (
                    <span>Pick a date range</span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  initialFocus
                  mode="range"
                  defaultMonth={dateRange?.from}
                  selected={dateRange}
                  onSelect={setDateRange}
                  numberOfMonths={2}
                />
              </PopoverContent>
            </Popover>
          </div>
          
          <div className="grid gap-2">
            <Label htmlFor="export-format">Export Format</Label>
            <div className="flex gap-4">
              <div className="flex items-center">
                <Button
                  type="button"
                  variant={exportFormat === "csv" ? "default" : "outline"}
                  className="flex items-center gap-2"
                  onClick={() => setExportFormat("csv")}
                >
                  <FileSpreadsheet className="h-4 w-4" />
                  CSV
                </Button>
              </div>
              <div className="flex items-center">
                <Button
                  type="button"
                  variant={exportFormat === "pdf" ? "default" : "outline"}
                  className="flex items-center gap-2"
                  onClick={() => setExportFormat("pdf")}
                >
                  <FileText className="h-4 w-4" />
                  PDF
                </Button>
              </div>
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button onClick={handleExport} disabled={isExporting}>
            {isExporting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Exporting...
              </>
            ) : (
              <>
                <Download className="mr-2 h-4 w-4" />
                Export Report
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
