"use client";

import { useTransition } from "react";
import { CustomButton } from "@/components/ui/custom-button";

export function DeleteRowButton({
  label,
  confirmMessage,
  action,
}: {
  label: string;
  confirmMessage: string;
  action: () => Promise<void>;
}) {
  const [isPending, startTransition] = useTransition();

  function handleClick() {
    if (!confirm(confirmMessage)) return;

    startTransition(async () => {
      try {
        await action();
      } catch (error) {
        console.error("Failed to delete row", error);
      }
    });
  }

  return (
    <CustomButton
      type="button"
      variant="secondary"
      intent="destructive"
      size="sm"
      disabled={isPending}
      onClick={handleClick}
    >
      {label}
    </CustomButton>
  );
}
