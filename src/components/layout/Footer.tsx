import Link from "next/link";

const COLUMNS: { title: string; links: { href: string; label: string }[] }[] = [
  {
    title: "Browse",
    links: [
      { href: "/posts", label: "Latest reports" },
      { href: "/people", label: "People" },
      { href: "/leaderboard", label: "Leaderboard" },
    ],
  },
  {
    title: "By location",
    links: [
      { href: "/states", label: "States" },
      { href: "/cities", label: "Cities" },
    ],
  },
  {
    title: "Account",
    links: [
      { href: "/signup", label: "Get a citizen number" },
      { href: "/login", label: "Log in" },
      { href: "/create", label: "Post anonymously" },
    ],
  },
];

export function Footer() {
  return (
    <footer className="mt-16 hidden border-t-[3px] border-ink bg-white sm:block">
      <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
        <div className="flex items-baseline justify-between gap-4 border-b border-border-3 pb-6">
          <span className="font-serif text-2xl font-bold tracking-[-0.03em] text-ink">
            BilkulSaaf<span className="text-red">.</span>
          </span>
          <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-meta-3">
            Definitely, clean since Vol. I
          </span>
        </div>
        <div className="mt-8 grid grid-cols-2 gap-8 sm:grid-cols-3">
          {COLUMNS.map((col) => (
            <div key={col.title}>
              <h3 className="font-mono text-xs uppercase tracking-wide text-red">
                {col.title}
              </h3>
              <ul className="mt-3 space-y-2">
                {col.links.map((link) => (
                  <li key={link.href}>
                    <Link href={link.href} className="text-sm text-text-muted hover:text-ink">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <p className="mt-10 max-w-xl border-t border-dashed border-border-5 pt-5 font-mono text-[11px] leading-relaxed text-meta-3">
          Satire. Community-submitted, unverified, and meant to be read that way. Every
          public post is attributed only to an anonymous citizen number — never a real
          name, account, or email.
        </p>
      </div>
    </footer>
  );
}
