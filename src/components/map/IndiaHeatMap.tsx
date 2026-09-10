"use client";

import { useEffect, useMemo, useState } from "react";
import { CircleMarker, MapContainer, Popup, TileLayer, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import Link from "next/link";
import { getCityCoords } from "@/lib/geo/indiaCities";
import { formatCount } from "@/lib/format";
import { slugify } from "@/lib/slug";
import type { CityAgg } from "@/lib/api/types";

const INDIA_CENTER: [number, number] = [22.9734, 78.6569];

function HeatLayer({ points, max }: { points: [number, number, number][]; max: number }) {
  const map = useMap();

  useEffect(() => {
    if (points.length === 0) return;
    let layer: L.Layer | null = null;
    let cancelled = false;

    // leaflet.heat is a plain global-L script, not an ES/CJS module — it patches
    // whatever `L` it finds on `window` at import time, so `window.L` must be set
    // to this exact `leaflet` instance before it's (dynamically) imported.
    (window as unknown as { L: typeof L }).L = L;
    import("leaflet.heat").then(() => {
      if (cancelled) return;
      layer = L.heatLayer(points, {
        radius: 32,
        blur: 24,
        max,
        minOpacity: 0.35,
        gradient: { 0.2: "#fde68a", 0.45: "#fbbf24", 0.7: "#f97316", 1: "#dc2626" },
      }).addTo(map);
    });

    return () => {
      cancelled = true;
      layer?.remove();
    };
  }, [map, points, max]);

  return null;
}

function MapZoomControls() {
  const map = useMap();
  return (
    <div className="absolute right-4 top-4 z-[1000] flex overflow-hidden rounded-xl border border-white/70 bg-white/90 shadow-[0_8px_22px_rgba(19,19,18,0.13)] backdrop-blur">
      <button
        type="button"
        onClick={() => map.zoomIn()}
        className="flex h-9 w-9 items-center justify-center border-r border-border-2 text-lg text-ink transition-colors hover:bg-border-4"
        aria-label="Zoom in"
      >
        +
      </button>
      <button
        type="button"
        onClick={() => map.zoomOut()}
        className="flex h-9 w-9 items-center justify-center text-lg text-ink transition-colors hover:bg-border-4"
        aria-label="Zoom out"
      >
        −
      </button>
    </div>
  );
}

export function IndiaHeatMap({ cities }: { cities: CityAgg[] }) {
  const [selectedCity, setSelectedCity] = useState<CityAgg | null>(cities[0] ?? null);
  const plotted = useMemo(() => {
    return cities
      .map((city) => {
        const coords = getCityCoords(city.city);
        return coords ? { city, coords } : null;
      })
      .filter((entry): entry is { city: CityAgg; coords: [number, number] } => entry !== null);
  }, [cities]);

  const maxPosts = Math.max(1, ...plotted.map(({ city }) => city.postCount));
  const heatPoints: [number, number, number][] = plotted.map(({ city, coords }) => [
    coords[0],
    coords[1],
    city.postCount,
  ]);

  const selected = selectedCity ?? plotted[0]?.city;

  return (
    <div className="map-surface isolate z-0 relative overflow-hidden rounded-[24px] border border-border-2 bg-[#e7e5df] shadow-[0_18px_40px_rgba(19,19,18,0.13)]">
      <MapContainer
        center={INDIA_CENTER}
        zoom={5}
        minZoom={4}
        maxZoom={13}
        scrollWheelZoom
        zoomControl={false}
        attributionControl={false}
        className="h-[460px] w-full sm:h-[540px]"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <MapZoomControls />
        <HeatLayer points={heatPoints} max={maxPosts} />
        {plotted.map(({ city, coords }) => (
          <CircleMarker
            key={city.city}
            center={coords}
            radius={7 + 10 * (city.postCount / maxPosts)}
            pathOptions={{ color: "#ffffff", weight: 2, fillColor: "#131312", fillOpacity: 0.85 }}
            eventHandlers={{ click: () => setSelectedCity(city) }}
          >
            <Popup>
              <p className="font-semibold text-ink">{city.city}</p>
              <p className="mt-1 text-xs text-meta-2">
                {formatCount(city.postCount)} posts · {formatCount(city.voteCount)} votes
              </p>
              <Link
                href={`/cities/${slugify(city.city)}`}
                className="mt-1.5 inline-block text-xs font-medium text-ink underline"
              >
                View reports →
              </Link>
            </Popup>
          </CircleMarker>
        ))}
      </MapContainer>
      <div className="pointer-events-none absolute inset-x-0 top-0 z-[500] bg-gradient-to-b from-[#fafaf9]/90 via-[#fafaf9]/45 to-transparent px-4 pb-14 pt-4 sm:px-5 sm:pt-5">
        <div className="flex items-start justify-between gap-3 pr-20">
          <div>
            <p className="font-mono text-[10px] font-medium uppercase tracking-[0.16em] text-meta-2">Live report map</p>
            <p className="mt-1 text-sm font-semibold text-ink">Where the conversation is happening</p>
          </div>
          <span className="rounded-full border border-border-2 bg-white/80 px-2.5 py-1 font-mono text-[10px] text-text-muted shadow-sm">
            {plotted.length} cities
          </span>
        </div>
      </div>
      <div className="pointer-events-none absolute bottom-4 left-4 right-4 z-[500] flex items-end justify-between gap-3 sm:left-5 sm:right-5 sm:bottom-5">
        {selected && (
          <Link
            href={`/cities/${slugify(selected.city)}`}
            className="pointer-events-auto min-w-0 rounded-2xl border border-white/70 bg-white/95 px-3.5 py-3 shadow-[0_10px_24px_rgba(19,19,18,0.15)] backdrop-blur transition-transform hover:-translate-y-0.5 sm:px-4"
          >
            <p className="truncate text-sm font-semibold text-ink">{selected.city}</p>
            <p className="mt-0.5 font-mono text-[10px] text-meta-2">
              {formatCount(selected.postCount)} reports · {formatCount(selected.voteCount)} votes
            </p>
          </Link>
        )}
        <div className="hidden rounded-xl border border-white/70 bg-white/85 px-3 py-2 shadow-sm backdrop-blur sm:block">
          <p className="font-mono text-[9px] uppercase tracking-[0.12em] text-meta-2">Activity</p>
          <div className="mt-1.5 flex items-center gap-1">
            <span className="h-2 w-2 rounded-full bg-[#e8d99a]" />
            <span className="h-2 w-2 rounded-full bg-[#d9a52a]" />
            <span className="h-2 w-2 rounded-full bg-[#c75b2a]" />
            <span className="h-2 w-2 rounded-full bg-[#131312]" />
          </div>
        </div>
      </div>
      <a
        href="https://www.openstreetmap.org/copyright"
        target="_blank"
        rel="noreferrer"
        className="absolute bottom-1 right-2 z-[600] rounded bg-white/75 px-1.5 py-0.5 font-mono text-[8px] text-meta-2 backdrop-blur hover:text-ink"
      >
        © OpenStreetMap contributors
      </a>
    </div>
  );
}
