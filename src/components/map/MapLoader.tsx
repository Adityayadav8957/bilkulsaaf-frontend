"use client";

import dynamic from "next/dynamic";
import type { CityAgg } from "@/lib/api/types";

const IndiaHeatMap = dynamic(
  () => import("./IndiaHeatMap").then((mod) => mod.IndiaHeatMap),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-[460px] w-full items-center justify-center rounded-[24px] border border-border-2 bg-white sm:h-[540px]">
        <p className="font-mono text-xs text-meta-2">Loading map…</p>
      </div>
    ),
  }
);

export function MapLoader({ cities }: { cities: CityAgg[] }) {
  return <IndiaHeatMap cities={cities} />;
}
