"use client";

export type AdminRow = {
  id: string;
  cells: React.ReactNode[];
  actions?: React.ReactNode;
};

// A table on tablet and desktop; on phones each row becomes a card with the
// column names as labels, so nothing scrolls sideways.
export function AdminTable({
  headers,
  rows,
  emptyMessage = "No results found.",
}: {
  headers: string[];
  rows: AdminRow[];
  emptyMessage?: string;
}) {
  if (rows.length === 0) {
    return (
      <p className="rounded-lg bg-muted p-6 font-body text-body text-muted-foreground">
        {emptyMessage}
      </p>
    );
  }

  return (
    <>
      <ul className="flex flex-col gap-3 md:hidden">
        {rows.map((row) => (
          <li
            key={row.id}
            className="flex flex-col gap-3 rounded-sm border border-border/60 bg-card p-4"
          >
            <dl className="flex flex-col gap-2.5">
              {row.cells.map((cell, i) => (
                <div key={i} className="flex flex-col gap-1">
                  {/* The first cell (name/title) needs no label */}
                  {i > 0 && (
                    <dt className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                      {headers[i]}
                    </dt>
                  )}
                  <dd className="min-w-0 text-foreground">{cell}</dd>
                </div>
              ))}
            </dl>
            {row.actions && (
              <div className="flex flex-wrap items-center gap-2 border-t border-border/40 pt-3">
                {row.actions}
              </div>
            )}
          </li>
        ))}
      </ul>

      <table className="hidden w-full border-collapse rounded-lg font-body text-ui md:table">
        <thead>
          <tr className="border-b border-border text-left">
            {headers.map((h) => (
              <th key={h} className="p-3 font-medium text-muted-foreground">
                {h}
              </th>
            ))}
            <th className="p-3" />
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.id} className="border-b border-border hover:bg-muted/50">
              {row.cells.map((cell, i) => (
                <td key={i} className="p-3 text-foreground">
                  {cell}
                </td>
              ))}
              <td className="p-3">
                <div className="flex items-center justify-end gap-2">{row.actions}</div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </>
  );
}
