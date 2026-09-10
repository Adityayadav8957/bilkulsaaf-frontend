export function EmptyState({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <div className="rounded-card border border-dashed border-border-5 p-8 text-center">
      <p className="font-semibold text-ink">{title}</p>
      {subtitle && <p className="mt-1 text-sm text-meta-2">{subtitle}</p>}
    </div>
  );
}
