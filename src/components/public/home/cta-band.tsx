import { Link } from "@/i18n/navigation";

interface CtaBandProps {
  isAuthenticated: boolean;
  labels: {
    authTitle: string;
    authSubtitle: string;
    authAction: string;
    guestTitle: string;
    guestSubtitle: string;
    guestAction: string;
  };
}

export function CtaBand({ isAuthenticated, labels }: CtaBandProps) {
  return (
    <section className="border-t border-border px-6 py-20 text-center">
      {isAuthenticated ? (
        <>
          <h2 className="font-display text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
            {labels.authTitle}
          </h2>
          <p className="mt-2 font-body text-muted-foreground">
            {labels.authSubtitle}
          </p>
          <Link
            href="/review"
            className="focus-ring mt-6 inline-block rounded-sm bg-primary px-7 py-3 font-body text-sm font-semibold text-primary-foreground hover:bg-primary/90 uppercase tracking-wider"
          >
            {labels.authAction}
          </Link>
        </>
      ) : (
        <>
          <h2 className="font-display text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
            {labels.guestTitle}
          </h2>
          <p className="mt-2 font-body text-muted-foreground">
            {labels.guestSubtitle}
          </p>
          <Link
            href="/register"
            className="focus-ring mt-6 inline-block rounded-sm bg-primary px-7 py-3 font-body text-sm font-semibold text-primary-foreground hover:bg-primary/90 uppercase tracking-wider"
          >
            {labels.guestAction}
          </Link>
        </>
      )}
    </section>
  );
}
