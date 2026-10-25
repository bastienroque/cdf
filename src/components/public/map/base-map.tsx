"use client";

import { useEffect, useMemo } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import Link from "next/link";

// Custom Leaflet Pin Icon
const customIcon = L.divIcon({
  className: "custom-map-pin",
  html: `
    <div class="flex h-12 w-12 items-center justify-center transition-transform hover:scale-110">
      <img src="/restaurant-pin.svg" alt="Restaurant Pin" class="h-12 w-12 drop-shadow-[0_2px_8px_rgba(245,158,11,0.5)]" />
    </div>
  `,
  iconSize: [48, 48],
  iconAnchor: [24, 48],
  popupAnchor: [0, -48],
});

export type MapPin = {
  id: string;
  name: string;
  slug?: string;
  lat: number | string;
  lng: number | string;
  avgScore?: string | number | null;
};

// A pin whose coordinates have been validated and converted to numbers
type ValidMapPin = Omit<MapPin, "lat" | "lng"> & { lat: number; lng: number };

interface BaseMapProps {
  pins: MapPin[];
  center?: [number, number];
  zoom?: number;
  heightClass?: string;
  enableClustering?: boolean;
}

// Converts coordinates once and rejects anything Leaflet can't handle.
// Returns null for empty/null values (Number("") and Number(null) are 0, which
// would silently place the pin at 0,0), NaN, Infinity and out-of-range values.
function toValidPin(pin: MapPin): ValidMapPin | null {
  if (pin.lat == null || pin.lng == null || pin.lat === "" || pin.lng === "") {
    return null;
  }

  const lat = Number(pin.lat);
  const lng = Number(pin.lng);

  if (!Number.isFinite(lat) || !Number.isFinite(lng)) return null;
  if (Math.abs(lat) > 90 || Math.abs(lng) > 180) return null;

  return { ...pin, lat, lng };
}

// Auto-Fit Map Bounds Component
function MapBoundsController({ pins }: { pins: ValidMapPin[] }) {
  const map = useMap();

  useEffect(() => {
    if (pins.length === 0) return;

    if (pins.length === 1) {
      map.setView([pins[0].lat, pins[0].lng], 15, { animate: true });
      return;
    }

    // Multiple pins: fit bounds with padding so all pins fit nicely on screen
    const bounds = L.latLngBounds(
      pins.map((p): [number, number] => [p.lat, p.lng]),
    );
    map.fitBounds(bounds, { padding: [40, 40], animate: true });
  }, [map, pins]);

  return null;
}

function MapZoomHandler() {
  const map = useMap();

  useEffect(() => {
    const container = map.getContainer();

    const handleWheel = (e: WheelEvent) => {
      // Check for Cmd (Mac) or Ctrl (Windows/Linux)
      if (e.ctrlKey || e.metaKey) {
        map.scrollWheelZoom.enable();
      } else {
        map.scrollWheelZoom.disable();
      }
    };

    container.addEventListener("wheel", handleWheel, { passive: true });

    return () => {
      container.removeEventListener("wheel", handleWheel);
    };
  }, [map]);

  return null;
}

export function BaseMap({
  pins,
  center = [38.7223, -9.1393],
  zoom = 10,
  heightClass = "h-64 w-full rounded-sm border border-border/80",
}: BaseMapProps) {
  // Memoized so MapBoundsController's effect only re-runs when `pins` changes,
  // not on every render (which would reset the user's pan/zoom).
  const validPins = useMemo(
    () =>
      pins.flatMap((pin) => {
        const valid = toValidPin(pin);
        return valid ? [valid] : [];
      }),
    [pins],
  );

  const cartoKey = process.env.NEXT_PUBLIC_CARTO_API_KEY;
  const tileQuery = cartoKey ? `?key=${cartoKey}` : "";

  return (
    <div className={`overflow-hidden ${heightClass}`}>
      <MapContainer
        center={center}
        zoom={zoom}
        className="h-full w-full z-0 bg-neutral-950"
        scrollWheelZoom={false}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>'
          url={`https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png${tileQuery}`}
          maxZoom={19}
        />

        <MapBoundsController pins={validPins} />

        <MapZoomHandler />

        {validPins.map((pin) => (
          <Marker key={pin.id} position={[pin.lat, pin.lng]} icon={customIcon}>
            <Popup minWidth={160} className="medieval-map-popup">
              <div className="p-1">
                {pin.slug ? (
                  <Link
                    href={`/restaurants/${pin.slug}`}
                    className="group flex flex-col gap-1 text-foreground hover:text-amber-500"
                  >
                    <span className="font-display text-sm font-bold uppercase tracking-tight group-hover:underline">
                      {pin.name}
                    </span>
                    {pin.avgScore ? (
                      <span className="inline-flex self-start rounded-sm border border-amber-500/30 bg-amber-500/10 px-2 py-0.5 font-mono text-xs font-semibold text-amber-500">
                        ★ {Number(pin.avgScore).toFixed(1)} / 10
                      </span>
                    ) : (
                      <span className="font-mono text-[11px] text-muted-foreground">
                        No reviews yet
                      </span>
                    )}
                  </Link>
                ) : (
                  <div className="flex flex-col gap-1">
                    <span className="font-display text-sm font-bold uppercase tracking-tight text-foreground">
                      {pin.name}
                    </span>
                  </div>
                )}
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}
