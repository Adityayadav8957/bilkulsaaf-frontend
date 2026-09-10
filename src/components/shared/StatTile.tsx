export function StatTile({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-card border border-border-3 bg-white px-4 py-3">
      <p className="text-lg font-semibold text-ink">{value}</p>
      <p className="font-mono text-[11px] uppercase tracking-wide text-meta-2">{label}</p>
    </div>
  );
}
