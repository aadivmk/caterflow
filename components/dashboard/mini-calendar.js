import {
  eachDayOfInterval,
  endOfMonth,
  endOfWeek,
  format,
  isSameMonth,
  startOfMonth,
  startOfWeek,
} from "date-fns";
import Link from "next/link";
import { STATUS_STYLES } from "@/lib/constants";
import { cn } from "@/lib/utils";

/** Current month at a glance. Each day links to that date on the booking calendar. */
export function MiniCalendar({ bookings, today }) {
  const days = eachDayOfInterval({
    start: startOfWeek(startOfMonth(today)),
    end: endOfWeek(endOfMonth(today)),
  });
  const todayKey = format(today, "yyyy-MM-dd");

  return (
    <div>
      <div className="grid grid-cols-7 text-center text-xs font-medium text-muted-foreground">
        {["S", "M", "T", "W", "T", "F", "S"].map((d, i) => (
          <div key={i} className="py-1.5">
            {d}
          </div>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-y-1">
        {days.map((day) => {
          const key = format(day, "yyyy-MM-dd");
          const events = bookings.filter((b) => b.eventDate === key);
          const inMonth = isSameMonth(day, today);
          return (
            <Link
              key={key}
              href={`/dashboard/bookings?date=${key}`}
              aria-label={`${format(day, "d MMMM")}, ${events.length} ${events.length === 1 ? "booking" : "bookings"}`}
              className={cn(
                "mx-auto flex size-9 flex-col items-center justify-center rounded-md text-sm transition-colors hover:bg-muted focus-visible:outline-2",
                !inMonth && "text-muted-foreground/50",
                key === todayKey &&
                  "bg-primary font-semibold text-primary-foreground hover:bg-emerald-800",
              )}
            >
              <span className="tabular leading-none">{format(day, "d")}</span>
              <span className="mt-1 flex h-1.5 gap-0.5">
                {events.slice(0, 3).map((b) => (
                  <span
                    key={b.id}
                    className={cn(
                      "size-1.5 rounded-full",
                      key === todayKey ? "bg-white" : STATUS_STYLES[b.status].dot,
                    )}
                  />
                ))}
              </span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
