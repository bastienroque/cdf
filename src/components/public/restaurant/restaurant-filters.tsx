"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Filter, Search, ArrowUp, ArrowDown } from "lucide-react";
import { useTransition, useEffect, useState } from "react";

interface RestaurantFiltersProps {
  cities: { city: string }[];
  currentCity?: string;
  currentPrice?: string;
  currentSort: string;
  currentQuery?: string;
  priceLabels: string[];
  labels: {
    filterLabel: string;
    allCities: string;
    anyPrice: string;
    sortDesc: string;
    sortAsc: string;
    searchPlaceholder: string;
  };
}

export function RestaurantFilters({
  cities,
  currentCity,
  currentPrice,
  currentSort,
  currentQuery,
  priceLabels,
  labels: t,
}: RestaurantFiltersProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const [searchVal, setSearchVal] = useState(currentQuery ?? "");

  useEffect(() => {
    const handler = setTimeout(() => {
      if (searchVal !== (currentQuery ?? "")) {
        const params = new URLSearchParams(searchParams.toString());
        if (searchVal && searchVal.trim() !== "") {
          params.set("q", searchVal);
        } else {
          params.delete("q");
        }

        startTransition(() => {
          router.replace(`${pathname}?${params.toString()}`);
        });
      }
    }, 600);

    return () => clearTimeout(handler);
  }, [searchVal, currentQuery, pathname, router, searchParams]);

  const updateParam = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value && value.trim() !== "") {
      params.set(key, value);
    } else {
      params.delete(key);
    }

    startTransition(() => {
      router.replace(`${pathname}?${params.toString()}`);
    });
  };

  return (
    <div className="mb-10 flex flex-col gap-3 rounded-sm border border-amber-500/30 bg-card p-4 relative">
      {isPending && (
        <div className="absolute right-4 top-4 font-mono text-[10px] text-amber-500 uppercase tracking-widest animate-pulse">
          Filtering...
        </div>
      )}

      {/* ---- Dropdown Filters Row ---- */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center gap-3">
        <div className="mr-2 flex items-center gap-2 font-mono text-xs uppercase tracking-widest text-amber-600 shrink-0">
          <Filter className="h-4 w-4" />
          <span>{t.filterLabel}</span>
        </div>

        {/* City Filter */}
        <select
          defaultValue={currentCity ?? ""}
          onChange={(e) => updateParam("city", e.target.value)}
          aria-label="Filter restaurants by city"
          className="focus-ring rounded-sm border border-border bg-background px-3 py-2 font-mono text-xs uppercase tracking-wider text-foreground transition-colors hover:border-amber-500/40"
        >
          <option value="">{t.allCities}</option>
          {cities.map((c) => (
            <option key={c.city} value={c.city}>
              {c.city}
            </option>
          ))}
        </select>

        {/* Price Filter */}
        <select
          defaultValue={currentPrice ?? ""}
          onChange={(e) => updateParam("price", e.target.value)}
          aria-label="Filter restaurants by price range"
          className="focus-ring rounded-sm border border-border bg-background px-3 py-2 font-mono text-xs uppercase tracking-wider text-foreground transition-colors hover:border-amber-500/40"
        >
          <option value="">{t.anyPrice}</option>
          {[1, 2, 3, 4].map((p) => (
            <option key={p} value={p}>
              {priceLabels[p - 1]}
            </option>
          ))}
        </select>

        {/* Sort Direction Toggle Selector */}
        <div className="relative inline-flex items-center">
          <select
            defaultValue={currentSort}
            onChange={(e) => updateParam("sort", e.target.value)}
            aria-label="Sort restaurants by score"
            className="focus-ring appearance-none rounded-sm border border-amber-500/30 bg-amber-500/10 pl-8 pr-3 py-2 font-mono text-xs font-semibold uppercase tracking-wider text-amber-600 transition-colors hover:bg-amber-500/20 cursor-pointer"
          >
            <option value="desc">{t.sortDesc}</option>
            <option value="asc">{t.sortAsc}</option>
          </select>
          {currentSort === "desc" ? (
            <ArrowDown className="pointer-events-none absolute left-2.5 h-3.5 w-3.5 text-amber-600" />
          ) : (
            <ArrowUp className="pointer-events-none absolute left-2.5 h-3.5 w-3.5 text-amber-600" />
          )}
        </div>
      </div>

      {/* ---- Search Input Row ---- */}
      <div className="pt-3 border-t border-border/40">
        <div className="relative w-full">
          <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            value={searchVal}
            onChange={(e) => setSearchVal(e.target.value)}
            placeholder={t.searchPlaceholder}
            className="w-full rounded-sm border border-border bg-background py-2 pl-9 pr-4 font-mono text-xs text-foreground placeholder:text-muted-foreground focus:border-amber-500 focus:outline-none"
          />
        </div>
      </div>
    </div>
  );
}
