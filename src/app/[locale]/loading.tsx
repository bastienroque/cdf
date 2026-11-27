export default function Loading() {
  return (
    <div
      role="status"
      aria-live="polite"
      className="mx-auto flex min-h-[50vh] max-w-7xl items-center justify-center px-6 py-24"
    >
      <span className="h-8 w-8 animate-spin rounded-full border-2 border-amber-500/30 border-t-amber-500" />
      <span className="sr-only">Loading</span>
    </div>
  );
}
