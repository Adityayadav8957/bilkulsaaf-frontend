"use client";

import { useRouter } from "next/navigation";

export function NearbyLocationPicker({
  states,
  selected,
}: {
  states: string[];
  selected: string;
}) {
  const router = useRouter();

  return (
    <select
      value={selected}
      onChange={(e) => {
        const params = new URLSearchParams(window.location.search);
        params.set("near", e.target.value);
        router.push(`/explore?${params.toString()}#around-you`);
      }}
      aria-label="Change location for Around you"
      className="appearance-none rounded-pill bg-[length:10px_6px] bg-[position:right_10px_center] bg-no-repeat border-none bg-transparent py-1.5 pl-3 pr-6 font-mono text-xs text-text-muted-2"
      style={{
        backgroundImage:
          "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 10 6'%3E%3Cpath d='M1 1l4 4 4-4' stroke='%234a4740' stroke-width='1.5' fill='none'/%3E%3C/svg%3E\")",
      }}
    >
      {states.map((state) => (
        <option key={state} value={state}>
          {state}
        </option>
      ))}
    </select>
  );
}
