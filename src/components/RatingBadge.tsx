import { formatRating } from "@/lib/format";
import { PopcornBag } from "./PopcornBag";

export function RatingBadge({ voteAverage, voteCount, className = "text-muted" }: {
  voteAverage: number;
  voteCount: number;
  className?: string;
}) {
  return (
    <span className={`inline-flex items-end gap-1.5 text-sm ${className}`}>
      <PopcornBag voteAverage={voteAverage} voteCount={voteCount} className="w-5 shrink-0" />
      <span>{formatRating(voteAverage, voteCount)}</span>
    </span>
  );
}
