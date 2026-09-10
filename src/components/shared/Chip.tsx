import Link from "next/link";

export function Chip({
  href,
  active,
  children,
}: {
  href: string;
  active?: boolean;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className={`rounded-pill border px-3 py-1.5 text-xs font-bold transition-colors ${
        active
          ? "border-red bg-red text-white"
          : "border-border-5 text-text-muted hover:border-red/40 hover:bg-red-tint"
      }`}
    >
      {children}
    </Link>
  );
}
