"use client";

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
  return (
    <CustomButton
      type="button"
      variant="secondary"
      intent="destructive"
      size="sm"
      onClick={() => {
        if (confirm(confirmMessage)) {
          action();
        }
      }}
    >
      {label}
    </CustomButton>
  );
}
