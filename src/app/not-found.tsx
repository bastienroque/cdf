import Link from "next/link";
import { ShieldAlert, ArrowLeft } from "lucide-react";

export default function RootNotFound() {
  return (
    <html lang="en">
      <body className="bg-background text-foreground antialiased min-h-screen flex items-center justify-center p-6">
        <div className="max-w-md text-center">
          {/* Badge */}
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-amber-500/30 bg-amber-500/10 px-3.5 py-1 font-mono text-xs uppercase tracking-widest text-amber-600">
            <ShieldAlert className="h-3.5 w-3.5" />
            <span>404 — Page Not Found</span>
          </div>

          {/* Heading */}
          <h1 className="font-display text-7xl font-bold uppercase tracking-tight text-foreground mb-2">
            404
          </h1>
          <h2 className="font-display text-xl font-bold uppercase tracking-tight text-foreground mb-3">
            Uncharted Territory
          </h2>

          {/* Body */}
          <p className="font-body text-sm text-muted-foreground mb-6 leading-relaxed">
            The sanctuary, decree, or page you are looking for doesn't exist,
            has been removed, or was moved to another location.
          </p>

          {/* Home Link */}
          <Link
            href="/"
            className="inline-flex items-center gap-2 rounded-sm border border-amber-500/40 bg-amber-500/10 px-5 py-2.5 font-mono text-xs font-bold uppercase tracking-widest text-amber-600 hover:bg-amber-500 hover:text-black transition-all cursor-pointer"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Back to Home</span>
          </Link>
        </div>
      </body>
    </html>
  );
}
