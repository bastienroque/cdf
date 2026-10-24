"use client";

let gtmLoaded = false;

export function loadGTM() {
  if (gtmLoaded) return;
  gtmLoaded = true;

  const gtmId = process.env.NEXT_PUBLIC_GTM_ID;
  if (!gtmId) {
    console.warn("NEXT_PUBLIC_GTM_ID is not set — GTM was not loaded.");
    return;
  }

  const script = document.createElement("script");
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtm.js?id=${gtmId}`;
  document.head.appendChild(script);
}
