"use client";

import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "@/hooks/use-toast";
import { FileText, Upload, X, Loader2 } from "lucide-react";

interface FileUploadProps {
  onFileChange: (file: File | null) => void;
  value?: File | null;
  accept?: string;
  maxSize?: number; // in MB
  label?: string;
  description?: string;
}

export function FileUpload({
  onFileChange,
  value,
  accept = ".pdf",
  maxSize = 5, // 5MB default
  label = "Upload file",
  description = "Upload a file",
}: FileUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [fileName, setFileName] = useState<string | null>(value?.name || null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    
    if (!file) {
      onFileChange(null);
      setFileName(null);
      return;
    }

    // Check file type
    if (accept && !file.type.includes("pdf")) {
      toast({
        title: "Invalid file type",
        description: "Please upload a PDF file",
        variant: "destructive",
      });
      onFileChange(null);
      setFileName(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
      return;
    }

    // Check file size
    if (maxSize && file.size > maxSize * 1024 * 1024) {
      toast({
        title: "File too large",
        description: `File size should be less than ${maxSize}MB`,
        variant: "destructive",
      });
      onFileChange(null);
      setFileName(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
      return;
    }

    setIsUploading(true);
    
    // Simulate upload delay for UI feedback
    setTimeout(() => {
      onFileChange(file);
      setFileName(file.name);
      setIsUploading(false);
    }, 500);
  };

  const clearFile = () => {
    onFileChange(null);
    setFileName(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      <div className="border rounded-md p-4 space-y-4">
        {!fileName ? (
          <>
            <div className="flex flex-col items-center justify-center py-4 border-2 border-dashed rounded-md">
              <Upload className="h-8 w-8 text-gray-400 mb-2" />
              <p className="text-sm text-gray-500 mb-1">{description}</p>
              <p className="text-xs text-gray-400">PDF up to {maxSize}MB</p>
              <Input
                ref={fileInputRef}
                type="file"
                accept={accept}
                onChange={handleFileChange}
                className="hidden"
                id="file-upload"
              />
              <Button
                variant="outline"
                size="sm"
                className="mt-2"
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploading}
              >
                {isUploading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Uploading...
                  </>
                ) : (
                  "Select File"
                )}
              </Button>
            </div>
          </>
        ) : (
          <div className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-800 rounded-md">
            <div className="flex items-center space-x-2">
              <FileText className="h-5 w-5 text-blue-500" />
              <span className="text-sm font-medium truncate max-w-[200px]">
                {fileName}
              </span>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={clearFile}
              className="h-8 w-8 p-0"
            >
              <X className="h-4 w-4" />
              <span className="sr-only">Remove file</span>
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
