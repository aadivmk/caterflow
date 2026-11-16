"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

function ChartTooltip({ active, payload, formatMoney }) {
  if (!active || !payload?.length) return null;
  const point = payload[0].payload;
  return (
    <div className="rounded-md border bg-card px-3 py-2 text-sm shadow-card">
      <p className="font-semibold">{point.fullLabel}</p>
      <p className="tabular text-muted-foreground">
        {point.bookings} {point.bookings === 1 ? "booking" : "bookings"}
      </p>
      <p className="tabular text-muted-foreground">{formatMoney(point.revenue)} booked value</p>
    </div>
  );
}

/** Bookings per month. One series, so the card title names it and no legend is needed. */
export function BookingsChart({ data, formatMoney }) {
  return (
    <>
      <div className="h-64 w-full" aria-hidden="true">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 8, right: 4, bottom: 0, left: -24 }}>
            <CartesianGrid vertical={false} stroke="#e7e3da" />
            <XAxis
              dataKey="label"
              tickLine={false}
              axisLine={{ stroke: "#d6d1c5" }}
              tick={{ fill: "#5c635e", fontSize: 12 }}
            />
            <YAxis
              allowDecimals={false}
              tickLine={false}
              axisLine={false}
              tick={{ fill: "#5c635e", fontSize: 12 }}
            />
            <Tooltip
              cursor={{ fill: "#f4f1eb" }}
              content={<ChartTooltip formatMoney={formatMoney} />}
            />
            <Bar dataKey="bookings" radius={[4, 4, 0, 0]} maxBarSize={40} isAnimationActive={false}>
              {data.map((point) => (
                <Cell key={point.key} fill={point.isCurrent ? "#047857" : "#6fbf9f"} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
      {/* Same data as a table for screen readers. */}
      <table className="sr-only">
        <caption>Bookings per month</caption>
        <thead>
          <tr>
            <th>Month</th>
            <th>Bookings</th>
            <th>Booked value</th>
          </tr>
        </thead>
        <tbody>
          {data.map((point) => (
            <tr key={point.key}>
              <td>{point.fullLabel}</td>
              <td>{point.bookings}</td>
              <td>{formatMoney(point.revenue)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </>
  );
}
