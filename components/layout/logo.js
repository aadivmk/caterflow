import Link from "next/link";
import { cn } from "@/lib/utils";

/** Cloche mark and wordmark. */
export function Logo({ href = "/", className }) {
  return (
    <Link
      href={href}
      className={cn(
        "inline-flex items-center gap-2.5 rounded-md outline-none focus-visible:ring-2 focus-visible:ring-ring",
        className,
      )}
    >
      <span className="flex size-8 items-center justify-center rounded-md bg-primary text-primary-foreground">
        <svg
          viewBox="0 0 24 24"
          className="size-5"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          aria-hidden="true"
        >
          <path d="M4 16a8 8 0 0 1 16 0" />
          <path d="M2.5 19h19" />
          <path d="M12 8V5.5" />
        </svg>
      </span>
      <span className="font-display text-lg font-semibold tracking-tight">CaterFlow</span>
    </Link>
  );
}
