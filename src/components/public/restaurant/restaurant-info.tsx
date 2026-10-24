import { MapPin, Phone, Globe, ShieldCheck } from "lucide-react";
import { RestaurantSingleMap } from "@/components/public/map";

interface RestaurantInfoProps {
  address: string;
  phone: string | null;
  website: string | null;
  lat: number;
  lng: number;
  name: string;
  labels: {
    coordinatesHeader: string;
    noPhone: string;
    visitPortal: string;
    noWebsite: string;
  };
}

export function RestaurantInfo({
  address,
  phone,
  website,
  lat,
  lng,
  name,
  labels,
}: RestaurantInfoProps) {
  return (
    <div className="mb-10 grid grid-cols-1 gap-6 md:grid-cols-2">
      {/* Sanctuary Details */}
      <div className="flex flex-col gap-4 rounded-sm border border-amber-500/30 bg-card p-6 ">
        <h2 className="flex items-center gap-2 border-b border-border/60 pb-3 font-mono text-xs font-semibold uppercase tracking-widest text-amber-600">
          <ShieldCheck className="h-4 w-4" />
          {labels.coordinatesHeader}
        </h2>

        <div className="flex flex-col gap-3 font-body text-sm text-foreground">
          <div className="flex items-start gap-3">
            <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-amber-500" />
            <span>{address}</span>
          </div>

          <div className="flex items-center gap-3">
            <Phone className="h-4 w-4 shrink-0 text-amber-500" />
            {phone ? (
              <span>{phone}</span>
            ) : (
              <span className="font-mono text-xs uppercase text-muted-foreground">
                {labels.noPhone}
              </span>
            )}
          </div>

          <div className="flex items-center gap-3">
            <Globe className="h-4 w-4 shrink-0 text-amber-500" />
            {website ? (
              <a
                href={website}
                target="_blank"
                rel="noopener noreferrer"
                className="font-mono text-xs uppercase tracking-wider text-amber-600 hover:underline"
              >
                {labels.visitPortal}
              </a>
            ) : (
              <span className="font-mono text-xs uppercase text-muted-foreground">
                {labels.noWebsite}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Map Frame */}
      <div className="overflow-hidden rounded-sm border border-amber-500/30 bg-card p-2 ">
        <RestaurantSingleMap lat={lat} lng={lng} name={name} />
      </div>
    </div>
  );
}
