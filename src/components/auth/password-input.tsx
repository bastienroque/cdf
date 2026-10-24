"use client";

import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { TextInput } from "@/components/form/form-field";

interface PasswordInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  className?: string;
}

export function PasswordInput({
  className = "",
  ...props
}: PasswordInputProps) {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="relative mt-1">
      <TextInput
        type={showPassword ? "text" : "password"}
        {...props}
        className={`focus-ring w-full rounded-sm border border-border bg-background px-3 py-2 pr-10 font-body text-sm text-foreground transition-colors hover:border-amber-500/40 ${className}`}
      />
      <button
        type="button"
        onClick={() => setShowPassword(!showPassword)}
        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors focus:outline-none"
        tabIndex={-1}
        aria-label={showPassword ? "Hide password" : "Show password"}
      >
        {showPassword ? (
          <EyeOff className="h-4 w-4" />
        ) : (
          <Eye className="h-4 w-4" />
        )}
      </button>
    </div>
  );
}
