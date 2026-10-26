"use client";

import * as React from "react";
import { Upload, FileText } from "lucide-react";

import { cn } from "./utils";

// Same token family as the other Form Controls (Input/Select): border-base-1
// border, --slds-c-input-radius-border radius, the app's real hover/focus/
// error colors. `state` is an optional, additive override -- omit it and the
// dropzone responds to real :hover/:focus-within like any other input;
// pass it only for a static demo that needs to force a look no mouse/
// keyboard is actually driving (mirrors the `focused` escape hatch already
// used on Input/SelectTrigger).
export type FileUploadState = "default" | "hover" | "focus" | "error";

const STATE_CLASSES: Record<FileUploadState, string> = {
  default: "border-[var(--slds-g-color-border-base-1)]",
  hover: "border-[#b0adab] bg-[var(--slds-g-color-background-alt)]",
  focus: "border-[#145F33] shadow-[0_0_0_3px_rgba(20,95,51,0.2)]",
  error: "border-[#A82031]",
};

interface FileUploadProps {
  variant?: "dropzone" | "compact";
  state?: FileUploadState;
  disabled?: boolean;
  fileName?: string;
  placeholder?: string;
  helperText?: string;
  accept?: string;
  onFilesSelected?: (files: FileList) => void;
  className?: string;
}

function FileUpload({
  variant = "dropzone",
  state,
  disabled,
  fileName,
  placeholder = "Drag & drop or click to upload",
  helperText,
  accept,
  onFilesSelected,
  className,
}: FileUploadProps) {
  const inputRef = React.useRef<HTMLInputElement>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      onFilesSelected?.(e.target.files);
    }
  };

  const hiddenInput = (
    <input
      ref={inputRef}
      type="file"
      accept={accept}
      disabled={disabled}
      onChange={handleChange}
      className="sr-only"
    />
  );

  if (variant === "compact") {
    return (
      <div
        className={cn(
          "flex h-7 items-center gap-2",
          disabled && "cursor-not-allowed opacity-60",
          className,
        )}
      >
        <label
          className={cn(
            "flex h-7 items-center gap-1.5 rounded-[var(--slds-c-input-radius-border)] border px-2.5 text-[length:var(--slds-g-font-size-3)]",
            "bg-[var(--slds-g-color-background-base)] border-[var(--slds-g-color-border-base-1)]",
            disabled ? "cursor-not-allowed" : "cursor-pointer",
            state === "error" && "border-[#A82031]",
          )}
        >
          <Upload
            className={cn(
              "h-3.5 w-3.5",
              state === "error"
                ? "text-[#A82031]"
                : "text-[var(--slds-g-color-text-weak)]",
            )}
          />
          Choose File
          {hiddenInput}
        </label>
        <span
          className={cn(
            "text-[length:var(--slds-g-font-size-3)]",
            fileName
              ? "text-[var(--slds-g-color-text-default)]"
              : "text-[var(--slds-g-color-text-weak)]",
          )}
        >
          {fileName || "No file chosen"}
        </span>
      </div>
    );
  }

  return (
    <label
      className={cn(
        "flex flex-col items-center justify-center gap-1 rounded-[var(--slds-c-input-radius-border)] border border-dashed p-5 text-center transition-colors",
        "bg-[var(--slds-g-color-background-base)]",
        !disabled && "hover:border-[#b0adab] hover:bg-[var(--slds-g-color-background-alt)]",
        !disabled && "focus-within:border-[#145F33] focus-within:shadow-[0_0_0_3px_rgba(20,95,51,0.2)]",
        disabled
          ? "cursor-not-allowed bg-[#f3f2f2] border-[var(--slds-g-color-border-base-1)]"
          : "cursor-pointer",
        !disabled && fileName && "border-solid border-[var(--slds-g-color-border-base-1)]",
        state && STATE_CLASSES[state],
        className,
      )}
    >
      {!disabled && hiddenInput}
      {fileName ? (
        <>
          <FileText
            className={cn(
              "mb-1 h-6 w-6",
              state === "error" ? "text-[#A82031]" : "text-[#145F33]",
            )}
          />
          <span className="text-[length:var(--slds-g-font-size-4)] font-medium">
            {fileName}
          </span>
        </>
      ) : (
        <>
          <Upload
            className={cn(
              "mb-1 h-6 w-6",
              state === "error"
                ? "text-[#A82031]"
                : disabled
                  ? "text-[var(--slds-g-color-text-weak)]"
                  : "text-[var(--slds-g-color-text-weak)] group-focus-within:text-[#145F33]",
            )}
          />
          <span className="text-[length:var(--slds-g-font-size-4)]">
            {disabled ? "Upload disabled" : placeholder}
          </span>
          {helperText && (
            <span className="text-[length:var(--slds-g-font-size-2)] text-[var(--slds-g-color-text-weak)]">
              {helperText}
            </span>
          )}
        </>
      )}
    </label>
  );
}

export { FileUpload };
