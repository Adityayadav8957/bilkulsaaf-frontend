// `/states` itself prerenders fully, but `/states/[state]` below it still
// blocks on its request-time param (see its `export const instant = false`),
// so this segment keeps the whole-page spinner.
export { default } from "@/components/shared/RouteSpinner";
