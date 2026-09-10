import Link from "next/link";
import type { Metadata } from "next";
import { listCities, listStates } from "@/lib/api/map";
import { EmptyState } from "@/components/shared/EmptyState";
import { Breadcrumbs } from "@/components/shared/Breadcrumbs";
import { MobileBackButton } from "@/components/shared/MobileBackButton";
import { RightRail } from "@/components/layout/RightRail";
import { MapLoader } from "@/components/map/MapLoader";
import { buildMetadata } from "@/lib/seo/metadata";
import { itemListJsonLd, JsonLd } from "@/lib/seo/jsonld";
import { formatCount } from "@/lib/format";
import { slugify } from "@/lib/slug";

// TODO: Cache Components adoption. Refactor this route so this opt-out can be removed.
// See: https://nextjs.org/docs/app/guides/migrating-to-cache-components
export const instant = false;

export function generateMetadata(): Metadata {
  return buildMetadata({
    title: "Browse Reports by State",
    description:
      "Every Indian state with an active citizen report on BilkulSaaf, ranked by how much activity it's seen.",
    path: "/states",
  });
}

export default async function StatesPage() {
  const [states, cities] = await Promise.all([listStates(), listCities({ limit: 50 })]);
  const totalPosts = states.reduce((total, state) => total + state.postCount, 0);
  const totalVotes = states.reduce((total, state) => total + state.voteCount, 0);
  const topState = states[0];

  return (
    <div className="px-4 py-6 sm:px-6 sm:py-10">
      <JsonLd
        data={itemListJsonLd(
          states.map((state) => ({ name: state.state, path: `/states/${slugify(state.state)}` }))
        )}
      />
      <div className="sm:hidden">
        <MobileBackButton fallbackHref="/" />
      </div>
      <div className="hidden sm:block">
        <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "States" }]} />
      </div>
      <div className="mt-4 flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="font-mono text-[11px] font-medium uppercase tracking-[0.15em] text-meta-2">
            Geographic intelligence
          </p>
          <h1 className="mt-2">India, by suspicion</h1>
          <p className="mt-3 max-w-xl text-text-muted">
            A living view of reports and public attention across the country. Select any signal to explore deeper.
          </p>
        </div>
        <div className="grid grid-cols-3 gap-2 sm:min-w-[290px]">
          <div className="rounded-2xl border border-border-2 bg-white px-3 py-3">
            <p className="text-lg font-semibold leading-none text-ink">{formatCount(totalPosts)}</p>
            <p className="mt-1 font-mono text-[10px] uppercase tracking-wide text-meta-2">reports</p>
          </div>
          <div className="rounded-2xl border border-border-2 bg-white px-3 py-3">
            <p className="text-lg font-semibold leading-none text-ink">{formatCount(totalVotes)}</p>
            <p className="mt-1 font-mono text-[10px] uppercase tracking-wide text-meta-2">votes</p>
          </div>
          <div className="rounded-2xl border border-red/30 bg-red-tint/50 px-3 py-3">
            <p className="text-lg font-semibold leading-none text-red">{states.length}</p>
            <p className="mt-1 font-mono text-[10px] uppercase tracking-wide text-meta-2">states</p>
          </div>
        </div>
      </div>

      <div className="lg:mt-9 lg:flex lg:items-start lg:gap-7">
      <div className="min-w-0 max-w-5xl flex-1">
      {cities.items.length > 0 && (
        <div className="mt-7 lg:mt-0">
          <MapLoader cities={cities.items} />
        </div>
      )}

      <section className="mt-9">
        <div className="flex items-end justify-between gap-4">
          <div>
            <p className="font-mono text-[10px] font-medium uppercase tracking-[0.15em] text-meta-2">Browse by state</p>
            <h2 className="mt-1">Regional signals</h2>
          </div>
          {topState && <p className="hidden text-xs text-meta-2 sm:block">Most active: {topState.state}</p>}
        </div>
      <ul className="mt-4 grid gap-2 sm:grid-cols-2">
        {states.length === 0 && (
          <EmptyState title="No posts here yet." subtitle="Suspiciously clean around here." />
        )}
        {states.map((state) => (
          <li key={state.state}>
            <Link
              href={`/states/${slugify(state.state)}`}
              className="group flex items-center justify-between rounded-card border border-border-2 bg-white px-4 py-3.5 transition-all hover:-translate-y-0.5 hover:border-red/40 hover:shadow-[0_8px_18px_rgba(19,19,18,0.06)]"
            >
              <span>
                <span className="block font-medium text-ink">{state.state}</span>
                <span className="mt-1 block font-mono text-[10px] uppercase tracking-wide text-meta-2">
                  {formatCount(state.postCount)} reports
                </span>
              </span>
              <span className="flex items-center gap-2">
                <span className="font-mono text-xs text-meta-2">{formatCount(state.voteCount)} votes</span>
                <span className="text-meta-3 transition-transform group-hover:translate-x-0.5 group-hover:text-red">→</span>
              </span>
            </Link>
          </li>
        ))}
      </ul>
      </section>
      </div>

      <RightRail />
      </div>
    </div>
  );
}
