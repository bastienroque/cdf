import { DetailPageHeader } from "@/components/ui/detail-page-header";
import { Building2 } from "lucide-react";

interface RestaurantHeaderProps {
  name: string;
  metaLine: string;
  verifiedLabel: string;
}

export function RestaurantHeader({
  name,
  metaLine,
  verifiedLabel,
}: RestaurantHeaderProps) {
  return (
    <div className="mb-8 border-b border-border/60 pb-6">
      <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-amber-500/30 bg-amber-500/10 px-3.5 py-1 font-mono text-xs uppercase tracking-widest text-amber-600">
        <Building2 className="h-3.5 w-3.5" />
        {verifiedLabel}
      </div>
      <DetailPageHeader title={name} meta={metaLine} />
    </div>
  );
}
