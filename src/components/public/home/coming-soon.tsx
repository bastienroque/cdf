import { MessageSquarePlus } from "lucide-react";

interface ComingSoonReviewsProps {
  labels: {
    tag: string;
    title: string;
    description: string;
  };
}

export function ComingSoonReviews({ labels }: ComingSoonReviewsProps) {
  return (
    <section className="px-6 pb-20">
      <div className="mx-auto max-w-5xl">
        <div className="flex flex-col items-start gap-4 rounded-sm border border-dashed border-amber-500/40 bg-amber-500/5 p-6 sm:flex-row sm:items-center sm:gap-6 sm:p-8">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-sm border border-amber-500/30 bg-amber-500/10">
            <MessageSquarePlus
              className="h-6 w-6 text-amber-500"
              aria-hidden="true"
            />
          </div>

          <div>
            <p className="font-mono text-xs uppercase tracking-widest text-amber-600">
              {labels.tag}
            </p>
            <h2 className="font-display text-xl font-bold tracking-tight text-foreground sm:text-2xl">
              {labels.title}
            </h2>
            <p className="mt-2 max-w-2xl font-body text-sm text-muted-foreground">
              {labels.description}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
