import { Chip } from "./Chip";
import type { FeedSort } from "@/lib/api/types";

export function FeedChips({
  basePath,
  activeSort,
}: {
  basePath: string;
  activeSort: FeedSort;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      <Chip href={`${basePath}?sort=latest`} active={activeSort === "latest"}>
        Latest
      </Chip>
      <Chip href={`${basePath}?sort=popular`} active={activeSort === "popular"}>
        Most voted
      </Chip>
      <Chip href={`${basePath}?sort=discussed`} active={activeSort === "discussed"}>
        Most discussed
      </Chip>
      {/* "Near you" needs real coordinates on posts/people, which the backend
          doesn't store (only free-text state/city) — left as a plain link to
          the unfiltered feed rather than faking a geo filter. */}
      <Chip href={basePath} active={false}>
        Near you
      </Chip>
    </div>
  );
}
