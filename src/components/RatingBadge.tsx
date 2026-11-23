import { formatRating } from "@/lib/format";

export function RatingBadge({ voteAverage, voteCount }: { voteAverage: number; voteCount: number }) {
  return (
    <span className="inline-flex items-center gap-1 text-sm text-muted">
      {voteCount > 0 && <span aria-hidden className="text-accent">★</span>}
      <span>{formatRating(voteAverage, voteCount)}</span>
    </span>
  );
}
