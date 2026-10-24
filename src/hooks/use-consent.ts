"use client";

import { CONSENT_COOKIE_NAME, ConsentState } from "@/lib/consent/consent";
import { useState, useEffect, useCallback } from "react";

function readConsentCookie(): ConsentState {
  if (typeof document === "undefined") return "undetermined";
  const match = document.cookie.match(
    new RegExp(`${CONSENT_COOKIE_NAME}=([^;]+)`),
  );
  const value = match?.[1];
  if (value === "accepted" || value === "rejected") return value;
  return "undetermined";
}

function writeConsentCookie(value: ConsentState) {
  const maxAge = 60 * 60 * 24 * 365;
  document.cookie = `${CONSENT_COOKIE_NAME}=${value}; path=/; max-age=${maxAge}; SameSite=Lax`;
}

function clearConsentCookie() {
  document.cookie = `${CONSENT_COOKIE_NAME}=; path=/; max-age=0; SameSite=Lax`;
}

const CONSENT_EVENT = "cdf_consent_change";

export function useConsent() {
  const [consent, setConsent] = useState<ConsentState>("undetermined");
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setConsent(readConsentCookie());
    setHydrated(true);

    const handleConsentChange = () => {
      setConsent(readConsentCookie());
    };

    window.addEventListener(CONSENT_EVENT, handleConsentChange);
    return () => {
      window.removeEventListener(CONSENT_EVENT, handleConsentChange);
    };
  }, []);

  const accept = useCallback(() => {
    writeConsentCookie("accepted");
    setConsent("accepted");
    window.dispatchEvent(new Event(CONSENT_EVENT));
  }, []);

  const reject = useCallback(() => {
    writeConsentCookie("rejected");
    setConsent("rejected");
    window.dispatchEvent(new Event(CONSENT_EVENT));
  }, []);

  const reset = useCallback(() => {
    clearConsentCookie();
    setConsent("undetermined");
    window.dispatchEvent(new Event(CONSENT_EVENT));
  }, []);

  return { consent, hydrated, accept, reject, reset };
}
