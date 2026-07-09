export type PipelineBarRow = {
  key: string;
  label: string;
  value: number;
  color: string;
};

export function PipelineBars({ rows }: { rows: PipelineBarRow[] }) {
  const maxValue = Math.max(1, ...rows.map((row) => row.value));

  if (rows.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">No data yet</p>
    );
  }

  return (
    <div className="space-y-4">
      {rows.map((row) => (
        <div key={row.key} className="space-y-1.5">
          <div className="flex items-center justify-between text-sm">
            <span className="text-foreground">{row.label}</span>
            <span className="font-mono tabular-nums text-muted-foreground">
              {row.value.toLocaleString()}
            </span>
          </div>
          <div className="h-2 w-full overflow-hidden rounded-full bg-muted/40">
            <div
              className="h-full rounded-full"
              style={{
                width: `${Math.max(2, (row.value / maxValue) * 100)}%`,
                backgroundColor: row.color,
              }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}
