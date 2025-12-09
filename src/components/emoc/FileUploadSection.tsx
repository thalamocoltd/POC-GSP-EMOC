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
  files: FileAttachment[];
  onFilesChange: (files: FileAttachment[]) => void;
  maxFilesPerCategory?: number;
}

const CATEGORIES: FileCategory[] = [
  "Technical Information",
  "Minute of Meeting",
  "Other Documents"
];

// Guideline text for categories
const CATEGORY_GUIDELINES: Record<FileCategory, string | undefined> = {
  "Technical Information": "For example, PFD, P&ID Mark up, Presentation",
  "Minute of Meeting": undefined,
  "Other Documents": undefined
};

export const FileUploadSection = ({
  files,
  onFilesChange,
  maxFilesPerCategory = 10
}: FileUploadSectionProps) => {
  // Create refs for each category
  const fileInputRefs = useRef<Record<FileCategory, HTMLInputElement | null>>({
    "Technical Information": null,
    "Minute of Meeting": null,
    "Other Documents": null
  });

  const [errors, setErrors] = React.useState<Record<FileCategory, string | null>>({
    "Technical Information": null,
    "Minute of Meeting": null,
    "Other Documents": null
  });

  const allowedTypesText = ALLOWED_FILE_TYPES.join(", ");

  const getFilesByCategory = (category: FileCategory): FileAttachment[] => {
    return files.filter(f => f.category === category);
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>, category: FileCategory) => {
    const selectedFiles = event.target.files;
    if (!selectedFiles) return;

    setErrors(prev => ({ ...prev, [category]: null }));
    const categoryFiles = getFilesByCategory(category);
    const newFiles: FileAttachment[] = [];
    const errorList: string[] = [];

    Array.from(selectedFiles).forEach((file) => {
      if (!validateFileType(file.name)) {
        errorList.push(`${file.name}: Invalid file type`);
        return;
      }

      if (!validateFileSize(file.size)) {
        errorList.push(`${file.name}: File size exceeds 10MB`);
        return;
      }

      if (categoryFiles.length + newFiles.length >= maxFilesPerCategory) {
        errorList.push(`Maximum ${maxFilesPerCategory} files per category`);
        return;
      }

      const attachment: FileAttachment = {
        id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        category: category,
        fileName: file.name,
        fileSize: file.size,
        fileType: file.type,
        uploadedAt: new Date(),
        uploadedBy: "Current User",
        url: URL.createObjectURL(file)
      };

      newFiles.push(attachment);
    });

    if (errorList.length > 0) {
      setErrors(prev => ({ ...prev, [category]: errorList[0] }));
    }

    if (newFiles.length > 0) {
      onFilesChange([...files, ...newFiles]);
    }

    if (event.target) {
      event.target.value = "";
    }
  };

  const handleRemoveFile = (fileId: string) => {
    const updatedFiles = files.filter(f => f.id !== fileId);
    onFilesChange(updatedFiles);
  };

  return (
    <div className="space-y-8">
      {CATEGORIES.map((category) => {
        const categoryFiles = getFilesByCategory(category);
        const categoryError = errors[category];
        const isFull = categoryFiles.length >= maxFilesPerCategory;

        return (
          <div key={category} className="space-y-3">
            {/* Category Header */}
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <label className="text-[13px] font-medium text-[#1C1C1E] block">
                  {category}
                </label>
                {CATEGORY_GUIDELINES[category] && (
                  <p className="text-xs text-[#68737D] mt-1">
                    {CATEGORY_GUIDELINES[category]}
                  </p>
                )}
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => fileInputRefs.current[category]?.click()}
                disabled={isFull}
                className="gap-2 border-[#D4D9DE] ml-4 shrink-0"
              >
                <Upload className="w-4 h-4" />
                Upload
              </Button>
            </div>

            {/* Hidden File Input */}
            <input
              ref={(el) => {
                if (el) fileInputRefs.current[category] = el;
              }}
              type="file"
              multiple
              accept={ALLOWED_FILE_TYPES.join(",")}
              onChange={(e) => handleFileSelect(e, category)}
              className="hidden"
              title={`Upload files to ${category}`}
            />

            {/* Error Message */}
            {categoryError && (
              <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
                <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                <p className="text-sm text-red-800">{categoryError}</p>
              </div>
            )}

            {/* File List */}
            {categoryFiles.length > 0 ? (
              <div className="border border-[#E5E7EB] rounded-lg divide-y divide-[#E5E7EB]">
                {categoryFiles.map((file) => (
                  <div
                    key={file.id}
                    className="flex items-center justify-between p-3 hover:bg-[#F7F8FA] transition-colors"
                  >
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <FileText className="w-4 h-4 text-[#68737D] shrink-0" />
                      <p className="text-sm text-[#1C1C1E] truncate flex-1">
                        {file.fileName}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleRemoveFile(file.id)}
                      className="p-1 hover:bg-red-50 rounded transition-colors shrink-0 ml-2 cursor-pointer"
                      title={`Remove ${file.fileName}`}
                    >
                      <X className="w-4 h-4 text-[#D93F4C]" />
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="border-2 border-dashed border-[#D4D9DE] rounded-lg p-4 text-center">
                <FileText className="w-6 h-6 text-[#A0ADB8] mx-auto mb-1" />
                <p className="text-xs text-[#68737D]">No files uploaded</p>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};
