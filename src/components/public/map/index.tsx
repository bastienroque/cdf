"use client";

import dynamic from "next/dynamic";

// Dynamic import to prevent SSR window/document execution errors in Leaflet
export const RestaurantsClusterMap = dynamic(
  () =>
    import("./base-map").then((m) => {
      return function ClusterMapWrapper({ pins }: { pins: any[] }) {
        return (
          <m.BaseMap
            pins={pins}
            zoom={6.5}
            heightClass="h-[calc(100vh-8rem)] w-full rounded-sm border border-border"
            enableClustering={true}
          />
        );
      };
    }),
  { ssr: false },
);

export const RestaurantSingleMap = dynamic(
  () =>
    import("./base-map").then((m) => {
      return function SingleMapWrapper({
        lat,
        lng,
        name,
      }: {
        lat: number;
        lng: number;
        name: string;
      }) {
        return (
          <m.BaseMap
            pins={[{ id: "single", name, lat, lng }]}
            center={[lat, lng]}
            zoom={15}
            heightClass="h-64 w-full rounded-sm border border-border/80 "
            enableClustering={false}
          />
        );
      };
    }),
  { ssr: false },
);
