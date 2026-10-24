"use client";

export function MarkReadButton({ action }: { action: () => Promise<void> }) {
  return (
    <button onClick={() => action()} className="text-action hover:underline">
      Mark as read
    </button>
  );
}
