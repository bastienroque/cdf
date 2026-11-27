"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Filter, Search, ArrowUp, ArrowDown, SlidersHorizontal } from "lucide-react";
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
    filtering: string;
    cityAria: string;
    priceAria: string;
    sortAria: string;
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
  // Mobile only: the dropdowns start folded away unless a filter is active
  const [filtersOpen, setFiltersOpen] = useState(
    Boolean(currentCity || currentPrice || currentSort === "asc"),
  );

  useEffect(() => {
    const handler = setTimeout(() => {
      if (searchVal !== (currentQuery ?? "")) {
        const params = new URLSearchParams(searchParams.toString());
        if (searchVal && searchVal.trim() !== "") {
          params.set("q", searchVal);
        } else {
          params.delete("q");
        }
        params.delete("page");

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
    // A new filter starts again from page 1
    params.delete("page");

    startTransition(() => {
      router.replace(`${pathname}?${params.toString()}`);
    });
  };

  const activeCount =
    (currentCity ? 1 : 0) + (currentPrice ? 1 : 0) + (currentSort === "asc" ? 1 : 0);
  const selectClass =
    "focus-ring h-11 w-full min-w-0 rounded-sm border border-border bg-background px-3 font-mono text-xs uppercase text-foreground transition-colors hover:border-amber-500/40 md:h-auto md:w-auto md:py-2 md:tracking-wider";

  return (
    <div className="relative mb-8 flex flex-col gap-3 rounded-sm border border-amber-500/30 bg-card p-3 md:mb-10 md:p-4">
      {isPending && (
        <div className="absolute right-4 -top-5 font-mono text-[10px] text-amber-600 uppercase tracking-widest animate-pulse md:top-4">
          {t.filtering}
        </div>
      )}

      {/* ---- Search + mobile filter toggle ---- */}
      <div className="flex items-center gap-2 md:order-2 md:border-t md:border-border/40 md:pt-3">
        <div className="relative min-w-0 flex-1">
          <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
          <input
            type="search"
            value={searchVal}
            onChange={(e) => setSearchVal(e.target.value)}
            placeholder={t.searchPlaceholder}
            aria-label={t.searchPlaceholder}
            className="h-11 w-full rounded-sm border border-border bg-background pl-9 pr-3 font-body md:h-auto md:py-2 md:font-mono md:text-xs text-foreground placeholder:text-muted-foreground focus:border-amber-500 focus:outline-none"
          />
        </div>
        <button
          type="button"
          onClick={() => setFiltersOpen((open) => !open)}
          aria-expanded={filtersOpen}
          aria-controls="restaurant-filter-controls"
          className="focus-ring inline-flex h-11 shrink-0 items-center gap-1.5 rounded-sm border border-amber-500/30 bg-amber-500/10 px-3 font-mono text-xs font-semibold uppercase tracking-wider text-amber-600 md:hidden"
        >
          <SlidersHorizontal className="h-3.5 w-3.5" />
          <span>{t.filterLabel.replace(/:\s*$/, "")}</span>
          {activeCount > 0 && (
            <span className="rounded-full bg-amber-500 px-1.5 text-[10px] leading-4 text-black">
              {activeCount}
            </span>
          )}
        </button>
      </div>

      {/* ---- Dropdown filters: collapsible on mobile, always shown on desktop ---- */}
      <div
        id="restaurant-filter-controls"
        className={`${filtersOpen ? "grid" : "hidden"} grid-cols-2 gap-2 md:order-1 md:flex md:items-center md:gap-3`}
      >
        <div className="hidden items-center gap-2 font-mono text-xs uppercase tracking-widest text-amber-600 shrink-0 md:mr-2 md:flex">
          <Filter className="h-4 w-4" />
          <span>{t.filterLabel}</span>
        </div>

        <select
          defaultValue={currentCity ?? ""}
          onChange={(e) => updateParam("city", e.target.value)}
          aria-label={t.cityAria}
          className={selectClass}
        >
          <option value="">{t.allCities}</option>
          {cities.map((c) => (
            <option key={c.city} value={c.city}>
              {c.city}
            </option>
          ))}
        </select>

        <select
          defaultValue={currentPrice ?? ""}
          onChange={(e) => updateParam("price", e.target.value)}
          aria-label={t.priceAria}
          className={selectClass}
        >
          <option value="">{t.anyPrice}</option>
          {[1, 2, 3, 4].map((p) => (
            <option key={p} value={p}>
              {priceLabels[p - 1]}
            </option>
          ))}
        </select>

        <div className="relative col-span-2 inline-flex items-center md:col-span-1">
          <select
            defaultValue={currentSort}
            onChange={(e) => updateParam("sort", e.target.value)}
            aria-label={t.sortAria}
            className="focus-ring h-11 w-full appearance-none rounded-sm border border-amber-500/30 bg-amber-500/10 pl-8 pr-3 font-mono md:h-auto md:py-2 text-xs font-semibold uppercase md:tracking-wider text-amber-600 transition-colors hover:bg-amber-500/20 cursor-pointer md:w-auto"
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
    </div>
  );
}
