import Script from "next/script";

// Loads the Google Maps JavaScript API (Places library) only on the admin
// pages that use address search, instead of on every public page.
export function GoogleMapsScript() {
  const key = process.env.GOOGLE_MAPS_API_KEY;
  if (!key) return null;
  return (
    <Script
      id="google-maps"
      src={`https://maps.googleapis.com/maps/api/js?key=${encodeURIComponent(key)}&loading=async&libraries=places`}
      strategy="afterInteractive"
    />
  );
}
