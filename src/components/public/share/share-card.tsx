"use client";

import { useEffect, useState } from "react";
import { QRCodeCanvas } from "qrcode.react";
import { Share2 } from "lucide-react";
import { CustomButton } from "@/components/ui/custom-button";

interface ShareCardProps {
  qrUrl: string; // encoded in the QR code (tagged with utm_source=qr)
  shareUrl: string; // used by the native share sheet (tagged with utm_source=share)
  displayUrl: string; // clean URL shown under the QR code
  labels: {
    scanHint: string;
    qrAlt: string;
    share: string;
    shareTitle: string;
    shareText: string;
  };
}

export function ShareCard({
  qrUrl,
  shareUrl,
  displayUrl,
  labels,
}: ShareCardProps) {
  const [canShare, setCanShare] = useState(false);

  // Web Share API only exists on some browsers/devices (mostly mobile).
  // Checked after mount to avoid a server/client hydration mismatch.
  useEffect(() => {
    setCanShare(typeof navigator.share === "function");
  }, []);

  async function handleShare() {
    try {
      await navigator.share({
        title: labels.shareTitle,
        text: labels.shareText,
        url: shareUrl,
      });
    } catch (error) {
      // AbortError just means the user closed the share sheet
      if (!(error instanceof DOMException && error.name === "AbortError")) {
        console.error("Share failed", error);
      }
    }
  }

  return (
    <div className="mt-8 rounded-sm border border-amber-500/30 bg-card p-6 print:border-0 print:p-0">
      {/* White square with a built-in quiet zone so phones scan it reliably */}
      <div className="mx-auto w-full max-w-xs rounded-sm bg-white p-2">
        <QRCodeCanvas
          value={qrUrl}
          size={1024}
          level="M"
          marginSize={2}
          bgColor="#ffffff"
          fgColor="#111111"
          role="img"
          aria-label={labels.qrAlt}
          style={{ width: "100%", height: "auto" }}
        />
      </div>

      <p className="mt-4 font-mono text-sm font-semibold text-foreground">
        {displayUrl}
      </p>
      <p className="mt-1 font-body text-xs text-muted-foreground">
        {labels.scanHint}
      </p>

      {canShare && (
        <div className="mt-6 print:hidden">
          <CustomButton
            type="button"
            variant="secondary"
            intent="amber"
            size="md"
            className="w-full"
            onClick={() => void handleShare()}
          >
            <Share2 className="h-4 w-4" aria-hidden="true" />
            {labels.share}
          </CustomButton>
        </div>
      )}
    </div>
  );
}
