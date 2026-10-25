"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import {
  Languages,
  CheckCircle2,
  Clock,
  Search,
  Archive,
  Layers,
  Tag as TagIcon,
  Sparkles,
} from "lucide-react";
import { UpdateTranslationForm } from "@/components/admin/dashboard/update-translation-form";

export interface CatalogItem {
  id: string;
  category: string;
  namePt: string;
  nameEn: string | null;
  nameFr: string | null;
  translationStatus: "complete" | "pending";
  type: "ingredient" | "tag";
}

interface TranslationHubSectionProps {
  items: CatalogItem[];
  labels: {
    title: string;
    subtitle: string;
    status: string;
    type: string;
    empty: string;
    completeStatus: string;
    pendingStatus: string;
  };
}

export function TranslationHubSection({
  items,
  labels,
}: TranslationHubSectionProps) {
  const [statusFilter, setStatusFilter] = useState<"pending" | "complete">(
    "pending",
  );
  const [typeFilter, setTypeFilter] = useState<"all" | "ingredient" | "tag">(
    "all",
  );
  const [searchQuery, setSearchQuery] = useState("");

  const pendingCount = items.filter(
    (i) => i.translationStatus === "pending",
  ).length;
  const completeCount = items.filter(
    (i) => i.translationStatus === "complete",
  ).length;

  const filteredItems = items.filter((item) => {
    const matchesStatus = item.translationStatus === statusFilter;
    const matchesType = typeFilter === "all" || item.type === typeFilter;
    const q = searchQuery.toLowerCase();
    const matchesSearch =
      item.namePt.toLowerCase().includes(q) ||
      item.nameEn?.toLowerCase().includes(q) ||
      item.nameFr?.toLowerCase().includes(q) ||
      item.category.toLowerCase().includes(q);

    return matchesStatus && matchesType && matchesSearch;
  });

  return (
    <div className="space-y-6 pt-6 border-t border-border/65">
      {/* Header */}
      <div>
        <h2 className="font-mono text-sm font-bold uppercase tracking-widest text-foreground flex items-center gap-2">
          <Languages className="h-4 w-4 text-amber-500" /> {labels.title}
        </h2>
        <p className="text-xs text-muted-foreground font-body mt-0.5">
          {labels.subtitle}
        </p>
      </div>

      {/* Control Panel: Toggles & Search */}
      <div className="flex flex-col gap-4 rounded-sm border border-border/80 bg-card p-4">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          {/* Status Filter Toggle */}
          <div className="flex flex-col md:flex-row items-start md:items-center gap-2">
            <span className="font-mono text-[10px] font-bold uppercase tracking-wider text-muted-foreground mr-1 inline">
              {labels.status}:
            </span>
            <div className="flex flex-col md:flex-row rounded-sm border border-border bg-muted/40 p-1">
              <button
                onClick={() => setStatusFilter("pending")}
                className={`flex items-center gap-1.5 rounded-sm px-3 py-1.5 font-mono text-xs font-semibold uppercase tracking-wider transition-all ${
                  statusFilter === "pending"
                    ? "bg-amber-500 text-black shadow-xs"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <Clock className="h-3.5 w-3.5" />
                {labels.pendingStatus}
                <Badge className="ml-1 bg-black/20 px-1.5 py-0 font-mono text-[10px] text-current border-0">
                  {pendingCount}
                </Badge>
              </button>

              <button
                onClick={() => setStatusFilter("complete")}
                className={`flex items-center gap-1.5 rounded-sm px-3 py-1.5 font-mono text-xs font-semibold uppercase tracking-wider transition-all ${
                  statusFilter === "complete"
                    ? "bg-amber-500 text-black shadow-xs"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <Archive className="h-3.5 w-3.5" />
                {labels.completeStatus}
                <Badge className="ml-1 bg-black/20 px-1.5 py-0 font-mono text-[10px] text-current border-0">
                  {completeCount}
                </Badge>
              </button>
            </div>
          </div>

          {/* Type Filter Toggle */}
          <div className="flex flex-col md:flex-row items-start md:items-center gap-2">
            <span className="font-mono text-[10px] font-bold uppercase tracking-wider text-muted-foreground mr-1 inline">
              {labels.type}:
            </span>
            <div className="flex flex-col md:flex-row rounded-sm border border-border bg-muted/40 p-1">
              <button
                onClick={() => setTypeFilter("all")}
                className={`flex items-center gap-1 rounded-sm px-3 py-1.5 font-mono text-xs uppercase tracking-wider transition-all ${
                  typeFilter === "all"
                    ? "bg-amber-500/20 text-amber-500 font-bold border border-amber-500/30"
                    : "text-muted-foreground hover:text-foreground border border-transparent"
                }`}
              >
                <Sparkles className="h-3.5 w-3.5" />
                All
              </button>

              <button
                onClick={() => setTypeFilter("ingredient")}
                className={`flex items-center gap-1 rounded-sm px-3 py-1.5 font-mono text-xs uppercase tracking-wider transition-all ${
                  typeFilter === "ingredient"
                    ? "bg-amber-500/20 text-amber-500 font-bold border border-amber-500/30"
                    : "text-muted-foreground hover:text-foreground border border-transparent"
                }`}
              >
                <Layers className="h-3.5 w-3.5" />
                Ingredients
              </button>

              <button
                onClick={() => setTypeFilter("tag")}
                className={`flex items-center gap-1 rounded-sm px-3 py-1.5 font-mono text-xs uppercase tracking-wider transition-all ${
                  typeFilter === "tag"
                    ? "bg-amber-500/20 text-amber-500 font-bold border border-amber-500/30"
                    : "text-muted-foreground hover:text-foreground border border-transparent"
                }`}
              >
                <TagIcon className="h-3.5 w-3.5" />
                Tags
              </button>
            </div>
          </div>
        </div>

        {/* Search Bar */}
        <div className="relative w-full">
          <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search by category or localized name (PT, EN, FR)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-sm border border-border bg-background py-2 pl-9 pr-4 font-mono text-xs text-foreground placeholder:text-muted-foreground focus:border-amber-500 focus:outline-none"
          />
        </div>
      </div>

      {/* Item List */}
      {filteredItems.length === 0 ? (
        <div className="rounded-sm border border-dashed border-border/80 bg-muted/20 py-12 text-center">
          <p className="font-mono text-xs uppercase tracking-widest text-muted-foreground">
            {labels.empty}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {filteredItems.map((item) => (
            <div
              key={item.id}
              className="rounded-sm border border-border/60 bg-card p-4 sm:p-5 space-y-4 transition-all hover:border-amber-500/30"
            >
              <div className="flex items-center justify-between gap-2 flex-wrap">
                <div className="flex items-center gap-2">
                  <Badge
                    variant="outline"
                    className="font-mono text-[10px] uppercase bg-muted text-muted-foreground"
                  >
                    {item.type}
                  </Badge>
                  <Badge
                    variant="outline"
                    className="font-mono text-[10px] uppercase text-amber-600 border-amber-500/30 bg-amber-500/5"
                  >
                    {item.category}
                  </Badge>
                </div>

                {item.translationStatus === "complete" ? (
                  <span className="inline-flex items-center gap-1 font-mono text-xs text-green-600">
                    <CheckCircle2 className="h-3.5 w-3.5" />{" "}
                    {labels.completeStatus}
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 font-mono text-xs text-yellow-600">
                    <Clock className="h-3.5 w-3.5" /> {labels.pendingStatus}
                  </span>
                )}
              </div>

              <UpdateTranslationForm item={item} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
