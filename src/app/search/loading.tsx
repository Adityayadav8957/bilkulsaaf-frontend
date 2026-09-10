// This segment still blocks on request-time data (see `export const instant =
// false` in its page), so it keeps the whole-page spinner. The bottom-nav tabs
// deliberately do not have one — they prerender a real App Shell instead.
export { default } from "@/components/shared/RouteSpinner";
