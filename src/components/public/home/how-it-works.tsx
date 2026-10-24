interface HowItWorksProps {
  labels: {
    tag: string;
    title: string;
    step1Title: string;
    step1Desc: string;
    step2Title: string;
    step2Desc: string;
  };
}

export function HowItWorks({ labels }: HowItWorksProps) {
  return (
    <section className="border-y border-border/60 bg-muted/40 px-6 py-20">
      <div className="mx-auto max-w-5xl">
        <div className="mb-10 text-center">
          <span className="text-xs font-mono uppercase tracking-widest text-muted-foreground">
            {labels.tag}
          </span>
          <h2 className="font-display text-2xl sm:text-3xl font-bold text-foreground">
            {labels.title}
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="border border-border/50 bg-background/50 p-6 rounded-sm">
            <div className="mb-4 flex h-10 w-10 items-center justify-center border border-primary/40 bg-primary/10 font-display text-lg font-bold text-primary rounded-sm">
              I
            </div>
            <h3 className="font-display text-lg font-semibold text-foreground">
              {labels.step1Title}
            </h3>
            <p className="mt-2 font-body text-sm text-muted-foreground leading-relaxed">
              {labels.step1Desc}
            </p>
          </div>

          <div className="border border-border/50 bg-background/50 p-6 rounded-sm">
            <div className="mb-4 flex h-10 w-10 items-center justify-center border border-primary/40 bg-primary/10 font-display text-lg font-bold text-primary rounded-sm">
              II
            </div>
            <h3 className="font-display text-lg font-semibold text-foreground">
              {labels.step2Title}
            </h3>
            <p className="mt-2 font-body text-sm text-muted-foreground leading-relaxed">
              {labels.step2Desc}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
