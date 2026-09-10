// Small per-author accent swatches, ported from Design /desktop.html + mobile.html's
// authorTint palette — a deterministic pick keeps a given citizen number
// consistent across posts without needing the backend to store a color.
const TINTS = ["#d9d6ce", "#d6d3ca", "#dcd8cf", "#dedad2", "#dad7cf", "#d9d5cd", "#dcd9d1"];

export function tintForNumber(n: number): string {
  return TINTS[n % TINTS.length];
}
