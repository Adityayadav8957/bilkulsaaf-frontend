"use client";

import { useEffect, useRef, useState } from "react";

const MESSAGES = [
  "Sanitising public statements…",
  "Polishing the paperwork…",
  "Redacting absolutely nothing…",
  "Consulting the ministry of vibes…",
];

const DURATION_MS = 1700;
const FADE_MS = 350;

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

      <rect x="97" y="4" width="3" height="30" fill="#131312" />
      <path d="M100 6 L138 16 L100 26 Z" fill="#ff9933" />
      <path d="M100 12.7 L138 16 L100 19.3 Z" fill="#ffffff" />
      <circle cx="119" cy="16" r="2" fill="#0a2a6e" />
      <path d="M100 19.3 L138 16 L100 26 Z" fill="#128807" />
    </svg>
  );
}

export function SplashScreen() {
  const [progress, setProgress] = useState(0);
  const [fading, setFading] = useState(false);
  const [mounted, setMounted] = useState(true);
  const startRef = useRef<number | null>(null);

  useEffect(() => {
    if (sessionStorage.getItem("splash-shown")) {
      setMounted(false);
      return;
    }

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const duration = reduceMotion ? 250 : DURATION_MS;
    startRef.current = Date.now();

    const interval = setInterval(() => {
      const elapsed = Date.now() - (startRef.current ?? Date.now());
      const pct = Math.min(100, (elapsed / duration) * 100);
      setProgress(pct);
      if (pct >= 100) {
        clearInterval(interval);
        sessionStorage.setItem("splash-shown", "1");
        setFading(true);
        setTimeout(() => setMounted(false), FADE_MS);
      }
    }, 40);

    return () => clearInterval(interval);
  }, []);

  if (!mounted) return null;

  const message = MESSAGES[Math.min(MESSAGES.length - 1, Math.floor((progress / 100) * MESSAGES.length))];

  return (
    <div
      role="status"
      aria-label="Loading BilkulSaaf"
      className={`fixed inset-0 z-[2000] flex flex-col items-center justify-center bg-bg-outer px-6 transition-opacity duration-[350ms] ${
        fading ? "pointer-events-none opacity-0" : "opacity-100"
      }`}
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

      <div className="mt-7 -rotate-6 rounded-sm border-2 border-dashed border-red px-4 py-2">
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

      <p className="mt-8 text-sm text-text-muted">{message}</p>

      <div className="mt-4 h-1.5 w-full max-w-xs overflow-hidden rounded-full border border-border-6 bg-border-5">
        <div
          className="h-full rounded-full bg-red"
          style={{ width: `${progress}%`, transition: "width 80ms linear" }}
        />
      </div>
    </div>
  );
}
