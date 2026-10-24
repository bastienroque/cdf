"use client";

import React, { useId } from "react";
import { cn } from "@/lib/utils";

export function FieldLabel({
  children,
  className,
  htmlFor,
}: {
  children: React.ReactNode;
  className?: string;
  htmlFor?: string;
}) {
  return (
    <label
      htmlFor={htmlFor}
      className={cn(
        "flex flex-col gap-1 font-body text-ui font-medium text-foreground",
        className,
      )}
    >
      {children}
    </label>
  );
}

export function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return (
    <p role="alert" className="font-body text-caption text-destructive">
      {message}
    </p>
  );
}

/**
 * Composite FormField wrapper that automatically connects
 * label htmlFor, input id, and error message rendering.
 */
export function FormField({
  label,
  error,
  children,
  className,
}: {
  label?: React.ReactNode;
  error?: string;
  children: (id: string) => React.ReactNode;
  className?: string;
}) {
  const id = useId();

  return (
    <div className={cn("flex flex-col gap-1", className)}>
      {label && <FieldLabel htmlFor={id}>{label}</FieldLabel>}
      {children(id)}
      <FieldError message={error} />
    </div>
  );
}

export function TextInput({
  id,
  className,
  ...props
}: React.ComponentProps<"input">) {
  return (
    <input
      id={id}
      {...props}
      className={cn(
        "w-full focus-ring rounded-md border border-input bg-background px-2.5 py-1.5 font-body text-body text-foreground placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50",
        className,
      )}
    />
  );
}

export function TextArea({
  id,
  className,
  ...props
}: React.ComponentProps<"textarea">) {
  return (
    <textarea
      id={id}
      {...props}
      className={cn(
        "focus-ring rounded-md border border-input bg-background px-2.5 py-1.5 font-body text-body text-foreground placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50",
        className,
      )}
    />
  );
}

export function SelectInput({
  id,
  className,
  ...props
}: React.ComponentProps<"select">) {
  return (
    <select
      id={id}
      {...props}
      className={cn(
        "focus-ring rounded-md border border-input bg-background px-2.5 py-1.5 font-body text-body text-foreground disabled:cursor-not-allowed disabled:opacity-50",
        className,
      )}
    />
  );
}

export function PrimaryButton(props: React.ComponentProps<"button">) {
  return (
    <button
      {...props}
      className={cn(
        "focus-ring rounded-md bg-primary px-4 py-1.5 font-body text-ui font-medium text-primary-foreground hover:bg-primary/80 cursor-pointer disabled:opacity-50",
        props.className,
      )}
    />
  );
}

export function SecondaryButton(props: React.ComponentProps<"button">) {
  return (
    <button
      {...props}
      className={cn(
        "focus-ring rounded-md border border-border bg-background px-4 py-1.5 font-body text-ui font-medium text-foreground hover:bg-muted disabled:pointer-events-none disabled:opacity-50",
        props.className,
      )}
    />
  );
}
