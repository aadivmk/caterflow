import { StatusBadge } from "@/components/shared/badges";
import { STATUS_STYLES } from "@/lib/constants";

/** Share of bookings in each status, as labelled bars. */
export function StatusDistribution({ data }) {
  const max = Math.max(1, ...data.map((d) => d.count));
  return (
    <ul className="space-y-3.5">
      {data.map(({ status, count }) => (
        <li key={status} className="grid grid-cols-[7.5rem_1fr_1.5rem] items-center gap-3">
          <StatusBadge status={status} className="justify-self-start" />
          <div className="h-2 rounded-full bg-muted">
            <div
              className="h-2 rounded-full"
              style={{
                width: `${(count / max) * 100}%`,
                backgroundColor: STATUS_STYLES[status].hex,
              }}
            />
          </div>
          <span className="tabular text-right text-sm font-semibold">{count}</span>
        </li>
      ))}
    </ul>
  );
}
