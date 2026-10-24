"use client";

export function RoleToggleButton({
  currentRole,
  action,
}: {
  currentRole: "admin" | "user";
  action: () => Promise<void>;
}) {
  const nextRole = currentRole === "admin" ? "user" : "admin";
  return (
    <button
      onClick={() => {
        const message =
          nextRole === "admin"
            ? "Promote this user to admin?"
            : "Remove admin access from this user?";
        if (confirm(message)) action();
      }}
      className={
        nextRole === "admin"
          ? "text-action hover:underline"
          : "text-destructive hover:underline"
      }
    >
      {nextRole === "admin" ? "Promote to admin" : "Demote to user"}
    </button>
  );
}
