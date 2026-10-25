"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Search } from "lucide-react";
import { useTransition } from "react";

export function RestaurantSearchBar({ placeholder }: { placeholder: string }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const handleSearch = (term: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (term) {
      params.set("q", term);
    } else {
      params.delete("q");
    }

    startTransition(() => {
      router.replace(`${pathname}?${params.toString()}`);
    });
  };

  return (
    <div className="relative w-full">
      <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
      <input
        type="text"
        defaultValue={searchParams.get("q") ?? ""}
        placeholder={placeholder}
        onChange={(e) => handleSearch(e.target.value)}
        className="w-full rounded-sm border border-border bg-card py-2 pl-9 pr-4 font-mono text-xs text-foreground placeholder:text-muted-foreground focus:border-amber-500 focus:outline-none"
      />
      {isPending && (
        <span className="absolute right-3 top-1/2 -translate-y-1/2 font-mono text-[10px] text-amber-500">
          ...
        </span>
      )}
    </div>
  );
}
