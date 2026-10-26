export function AuthCard({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-[70vh] items-center justify-center px-6 py-12">
      <div className="w-full max-w-sm rounded-lg bg-card p-4 md:p-8 ring-1 ring-foreground/10">
        <h1 className="font-display text-h2 font-semibold tracking-tight text-foreground">
          {title}
        </h1>
        {subtitle && (
          <p className="mt-1 font-body text-ui text-muted-foreground">
            {subtitle}
          </p>
        )}
        <div className="mt-6">{children}</div>
      </div>
    </div>
  );
}
