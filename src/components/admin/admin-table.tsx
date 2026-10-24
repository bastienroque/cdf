"use client";

export type AdminRow = {
  id: string;
  cells: React.ReactNode[];
  actions?: React.ReactNode;
};

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
    <table className="w-full border-collapse rounded-lg font-body text-ui">
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
              <div className="flex items-center justify-end gap-2">
                {row.actions}
              </div>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
