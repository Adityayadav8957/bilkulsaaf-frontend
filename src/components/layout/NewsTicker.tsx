import Link from "next/link";

type TickerItem = { label: string; href: string };

function Track({ items }: { items: TickerItem[] }) {
  return (
    <div className="flex w-max flex-none items-center gap-10 pr-10" aria-hidden="true">
      {items.map((item, index) => (
        <Link
          key={index}
          href={item.href}
          tabIndex={-1}
          className="flex flex-none items-center gap-3 whitespace-nowrap font-mono text-[11px] uppercase tracking-[0.1em] text-white/80 hover:text-white"
        >
          <span className="text-red">●</span>
          {item.label}
        </Link>
      ))}
    </div>
  );
}

export function NewsTicker({ items }: { items: TickerItem[] }) {
  if (items.length === 0) return null;

  return (
    <div className="border-b-2 border-ink bg-ink">
      <div className="mx-auto flex max-w-7xl items-stretch">
        <span className="flex flex-none items-center gap-1.5 bg-red pl-4 pr-3.5 font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-white sm:pl-6">
          <span className="h-1.5 w-1.5 flex-none animate-pulse rounded-full bg-white" />
          Breaking
        </span>
        <div className="hide-scrollbar relative min-w-0 flex-1 overflow-hidden">
          <div className="ticker-track flex w-max items-center py-2 pl-6">
            <Track items={items} />
            <Track items={items} />
          </div>
          <div className="pointer-events-none absolute inset-y-0 right-0 w-10 bg-gradient-to-l from-ink to-transparent" />
        </div>
        {/* Screen-reader summary; the scrolling track itself is presentational. */}
        <p className="sr-only">Trending now: {items.map((item) => item.label).join(". ")}</p>
      </div>
    </div>
  );
}
