"use client";

import { useEffect } from "react";
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

interface BaseMapProps {
  pins: MapPin[];
  center?: [number, number];
  zoom?: number;
  heightClass?: string;
  enableClustering?: boolean;
}

// Auto-Fit Map Bounds Component
function MapBoundsController({ pins }: { pins: MapPin[] }) {
  const map = useMap();

  useEffect(() => {
    const validPins = pins.filter((p) => {
      const lat = Number(p.lat);
      const lng = Number(p.lng);
      return !isNaN(lat) && !isNaN(lng);
    });

    if (validPins.length === 0) return;

    if (validPins.length === 1) {
      const lat = Number(validPins[0].lat);
      const lng = Number(validPins[0].lng);
      map.setView([lat, lng], 15, { animate: true });
    } else {
      // Multiple pins: Fit bounds with padding so all pins fit nicely on screen
      const bounds = L.latLngBounds(
        validPins.map((p) => [Number(p.lat), Number(p.lng)]),
      );
      map.fitBounds(bounds, { padding: [40, 40], animate: true });
    }
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
  const validPins = pins.filter((pin) => {
    const latNum = Number(pin.lat);
    const lngNum = Number(pin.lng);
    return !isNaN(latNum) && !isNaN(lngNum);
  });

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
          url={`https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png?key=${process.env.NEXT_PUBLIC_CARTO_API_KEY}`}
          maxZoom={19}
        />

        <MapBoundsController pins={validPins} />

        <MapZoomHandler />

        {validPins.map((pin) => (
          <Marker
            key={pin.id}
            position={[Number(pin.lat), Number(pin.lng)]}
            icon={customIcon}
          >
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
