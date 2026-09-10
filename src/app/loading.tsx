export default function Loading() {
  return (
    <div className="flex flex-col items-center gap-3 px-4 py-24 text-center">
      <span className="h-8 w-8 flex-none animate-spin rounded-full border-2 border-border-5 border-t-red" />
      <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-meta-3">
        Fetching the next dispatch…
      </p>
    </div>
  );
}
