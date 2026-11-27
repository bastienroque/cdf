import { Link } from "@/i18n/navigation";

interface PaginationProps {
  page: number;
  totalPages: number;
  pathname: string;
  // Current filters, kept on every page link
  query?: Record<string, string | undefined>;
  label: string;
}

export function Pagination({
  page,
  totalPages,
  pathname,
  query = {},
  label,
}: PaginationProps) {
  if (totalPages <= 1) return null;

  const hrefFor = (p: number) => {
    const params = new URLSearchParams();
    for (const [key, value] of Object.entries(query)) {
      if (value) params.set(key, value);
    }
    if (p > 1) params.set("page", String(p));
    const qs = params.toString();
    return qs ? `${pathname}?${qs}` : pathname;
  };

  return (
    <nav aria-label={label} className="mt-12 flex flex-wrap items-center justify-center gap-2">
      {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => {
        const isActive = p === page;
        return (
          <Link
            key={p}
            href={hrefFor(p)}
            aria-current={isActive ? "page" : undefined}
            className={`focus-ring rounded-sm px-4 py-2 font-mono text-xs uppercase tracking-widest transition-all ${
              isActive
                ? "bg-amber-500 text-black font-semibold"
                : "border border-border bg-background text-foreground hover:bg-muted"
            }`}
          >
            {p}
          </Link>
        );
      })}
    </nav>
  );
}
