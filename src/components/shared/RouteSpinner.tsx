/**
 * The whole-page loading spinner.
 *
 * This used to live at `src/app/loading.tsx`, where it wrapped every route in
 * one Suspense boundary — so its fallback, not the page, became each route's
 * prerendered App Shell and every navigation flashed a spinner. It now lives
 * only in the segments that still block on request-time data (the routes that
 * carry `export const instant = false`). The bottom-nav tabs instead ship a
 * real static shell with shape-matching skeletons; see `Skeletons.tsx`.
 */
export default function RouteSpinner() {
  return (
    <div className="flex flex-col items-center gap-3 px-4 py-24 text-center">
      <span className="h-8 w-8 flex-none animate-spin rounded-full border-2 border-border-5 border-t-red" />
      <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-meta-3">
        Fetching the next dispatch…
      </p>
    </div>
  );
}
