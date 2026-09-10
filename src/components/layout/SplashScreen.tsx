"use client";

import { useEffect, useRef, useState } from "react";

const TOTAL_MS = 2800;

function BuildingMark() {
  return (
    <svg viewBox="0 0 200 140" className="h-28 w-auto sm:h-32" aria-hidden="true">
      <path d="M46 72 A54 54 0 0 1 154 72 Z" fill="#131312" />

      <g fill="#131312">
        <rect x="40" y="72" width="6" height="42" />
        <rect x="54" y="72" width="6" height="42" />
        <rect x="68" y="72" width="6" height="42" />
        <rect x="82" y="72" width="6" height="42" />
        <rect x="96" y="72" width="6" height="42" />
        <rect x="110" y="72" width="6" height="42" />
        <rect x="124" y="72" width="6" height="42" />
        <rect x="138" y="72" width="6" height="42" />
        <rect x="152" y="72" width="6" height="42" />
      </g>

      <rect x="30" y="114" width="140" height="10" fill="#131312" />
      <rect x="18" y="124" width="164" height="12" fill="#131312" />

      {/* Dome apex sits at y=18 (a true semicircle: 108-wide chord, r=54) — the
          pole stops right there instead of running into it, so the two don't
          fuse into one black mass. */}
      <rect x="97" y="2" width="3" height="17" fill="#131312" />
      <g className="flag-wave">
        <rect x="100" y="3" width="24" height="4.8" fill="#ff9933" />
        <rect x="100" y="7.8" width="24" height="4.8" fill="#ffffff" />
        <rect x="100" y="12.6" width="24" height="4.8" fill="#128807" />
        <circle cx="112" cy="10.2" r="1.7" fill="#0a2a6e" />
      </g>
    </svg>
  );
}

/**
 * Boot splash — shown on every full page load (root layout stays mounted
 * across client-side navigations, so this never re-triggers on in-app tab
 * switches, only on an actual reload/fresh load). The progress bar, stamp
 * slam, and dismiss fade are pure CSS keyframe animations (see .splash-fill
 * / .splash-stamp / .splash-overlay in globals.css) rather than a JS-driven
 * timer loop, so they can't get stuck if a timer is throttled — a single
 * setTimeout just unmounts the node once the full sequence (stamp slam +
 * progress fill) has finished, matching TOTAL_MS to the CSS durations below.
 */
export function SplashScreen() {
  const [mounted, setMounted] = useState(true);
  const initializedRef = useRef(false);

  useEffect(() => {
    // React Strict Mode (dev only) double-invokes effects: mount, cleanup,
    // mount again — synchronously, before paint. This component lives for
    // the app's lifetime (mounted once in the root layout, never really
    // unmounted), so skip the duplicate pass entirely and let the one real
    // timer — started on the first pass — run to completion.
    if (initializedRef.current) return;
    initializedRef.current = true;

    setTimeout(() => setMounted(false), TOTAL_MS);
  }, []);

  if (!mounted) return null;

  return (
    <div
      role="status"
      aria-label="Loading BilkulSaaf"
      className="splash-overlay fixed inset-0 z-[2000] flex flex-col items-center justify-center bg-bg-outer px-6"
      style={{
        backgroundImage: "url(/paper-texture.svg)",
        backgroundRepeat: "repeat",
        backgroundSize: "260px 260px",
      }}
    >
      <BuildingMark />

      <div className="mt-6 w-full max-w-xs border-y-2 border-ink py-0.5">
        <div className="border-t border-ink" />
      </div>

      <div className="splash-stamp mt-7 rounded-sm border-2 border-dashed border-red bg-red-tint px-4 py-2">
        <span className="font-mono text-sm font-bold uppercase tracking-[0.2em] text-red sm:text-base">
          Definitely Clean
        </span>
      </div>

      <h1 className="mt-6 font-serif text-3xl font-bold tracking-[-0.03em] text-ink sm:text-4xl">
        BilkulSaaf
      </h1>
      <p className="mt-1.5 font-mono text-[11px] uppercase tracking-[0.25em] text-red sm:text-xs">
        Obviously · Completely · Definitely
      </p>
      <p className="mt-1 font-mono text-[11px] text-meta-2">भारत · अनौपचारिक जनहित संस्करण</p>

      <p className="mt-8 text-sm text-text-muted">Sanitising public statements…</p>

      <div className="mt-4 h-1.5 w-full max-w-xs overflow-hidden rounded-full border border-border-6 bg-border-5">
        <div className="splash-fill h-full rounded-full bg-red" />
      </div>
    </div>
  );
}
