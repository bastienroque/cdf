export function DetailPageHeader({
  title,
  meta,
}: {
  title: string;
  meta?: React.ReactNode;
}) {
  return (
    <div className="mb-6">
      <h1 className="font-display text-h2 font-semibold tracking-tight text-foreground">
        {title}
      </h1>
      {meta && (
        <p className="mt-1 font-body text-ui text-muted-foreground">{meta}</p>
      )}
    </div>
  );
}
