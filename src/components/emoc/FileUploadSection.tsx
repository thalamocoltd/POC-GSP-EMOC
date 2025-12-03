import React, { useRef } from "react";
import { Button } from "../ui/button";
import { FileAttachment, FileCategory } from "../../types/emoc";
import { 
  validateFileType, 
  validateFileSize, 
  formatFileSize,
  ALLOWED_FILE_TYPES 
} from "../../lib/emoc-utils";
import { Upload, X, FileText, AlertCircle } from "lucide-react";
import { cn } from "../ui/utils";

interface FileUploadSectionProps {
  category: FileCategory;
  files: FileAttachment[];
  onFilesChange: (files: FileAttachment[]) => void;
  maxFiles?: number;
}

export const FileUploadSection = ({ 
  category, 
  files, 
  onFilesChange,
  maxFiles = 10 
}: FileUploadSectionProps) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [error, setError] = React.useState<string | null>(null);

  const allowedTypes = ALLOWED_FILE_TYPES[category];
  const allowedTypesText = allowedTypes.join(", ");

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = event.target.files;
    if (!selectedFiles) return;

    setError(null);
    const newFiles: FileAttachment[] = [];
    const errors: string[] = [];

    Array.from(selectedFiles).forEach((file) => {
      if (!validateFileType(file.name, category)) {
        errors.push(`${file.name}: Invalid file type`);
        return;
      }

      if (!validateFileSize(file.size)) {
        errors.push(`${file.name}: File size exceeds 10MB`);
        return;
      }

      if (files.length + newFiles.length >= maxFiles) {
        errors.push(`Maximum ${maxFiles} files allowed`);
        return;
      }

      const attachment: FileAttachment = {
        id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        category,
        fileName: file.name,
        fileSize: file.size,
        fileType: file.type,
        uploadedAt: new Date(),
        uploadedBy: "Current User",
        url: URL.createObjectURL(file)
      };

      newFiles.push(attachment);
    });

    if (errors.length > 0) {
      setError(errors[0]);
    }

    if (newFiles.length > 0) {
      onFilesChange([...files, ...newFiles]);
    }

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleRemoveFile = (fileId: string) => {
    const updatedFiles = files.filter(f => f.id !== fileId);
    onFilesChange(updatedFiles);
    setError(null);
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div>
          <label className="text-[13px] font-medium text-[#1C1C1E] block">
            {category}
          </label>
          <p className="text-xs text-[#68737D] mt-1">
            Allowed: {allowedTypesText} (Max 10MB per file)
          </p>
        </div>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => fileInputRef.current?.click()}
          disabled={files.length >= maxFiles}
          className="gap-2 border-[#D4D9DE]"
        >
          <Upload className="w-4 h-4" />
          Upload
        </Button>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept={allowedTypes.join(",")}
        onChange={handleFileSelect}
        className="hidden"
      />

      {error && (
        <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
          <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
          <p className="text-sm text-red-800">{error}</p>
        </div>
      )}

      {files.length > 0 && (
        <div className="border border-[#E5E7EB] rounded-lg divide-y divide-[#E5E7EB]">
          {files.map((file) => (
            <div
              key={file.id}
              className="flex items-center justify-between p-3 hover:bg-[#F7F8FA] transition-colors"
            >
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <FileText className="w-5 h-5 text-[#68737D] shrink-0" />
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-[#1C1C1E] truncate">
                    {file.fileName}
                  </p>
                  <p className="text-xs text-[#68737D]">
                    {formatFileSize(file.fileSize)}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => handleRemoveFile(file.id)}
                className="p-1 hover:bg-red-50 rounded transition-colors shrink-0 ml-2"
              >
                <X className="w-4 h-4 text-[#D93F4C]" />
              </button>
            </div>
          ))}
        </div>
      )}

      {files.length === 0 && (
        <div className="border-2 border-dashed border-[#D4D9DE] rounded-lg p-6 text-center">
          <FileText className="w-8 h-8 text-[#A0ADB8] mx-auto mb-2" />
          <p className="text-sm text-[#68737D]">No files uploaded</p>
        </div>
      )}
    </div>
  );
};
