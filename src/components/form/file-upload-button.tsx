"use client";

import { useRef } from "react";

export function FileUploadButton({
  onFileSelect,
  disabled,
  label = "Upload photo",
}: {
  onFileSelect: (file: File) => void;
  disabled?: boolean;
  label?: string;
}) {
  const inputRef = useRef<HTMLInputElement>(null);

  return (
    <>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        disabled={disabled}
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) onFileSelect(file);
          e.target.value = "";
        }}
      />
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        disabled={disabled}
        className="focus-ring w-fit rounded-md border border-input bg-background px-3 py-1.5 font-body text-ui font-medium text-foreground hover:bg-muted disabled:cursor-not-allowed disabled:opacity-50"
      >
        {disabled ? "Uploading…" : label}
      </button>
    </>
  );
}
