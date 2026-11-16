"use client";

import {
  addDays,
  addMonths,
  addWeeks,
  eachDayOfInterval,
  endOfMonth,
  endOfWeek,
  format,
  isSameMonth,
  parseISO,
  startOfMonth,
  startOfWeek,
} from "date-fns";
import { CalendarDays, CalendarPlus, ChevronLeft, ChevronRight, Search } from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useState } from "react";
import { DemoTag, StatusBadge } from "@/components/shared/badges";
import { DataBoundary } from "@/components/shared/data-boundary";
import { EmptyState } from "@/components/shared/states";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input, Select } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useBookings } from "@/hooks/use-bookings";
import { useCurrency } from "@/hooks/use-settings";
import { BOOKING_STATUSES, EVENT_TYPES, STATUS_STYLES } from "@/lib/constants";
import { cn, formatDate, formatTime, formatTimeRange, todayISO } from "@/lib/utils";

const key = (date) => format(date, "yyyy-MM-dd");
const byTime = (a, b) => a.startTime.localeCompare(b.startTime);

/** One booking as a clickable card. Used by the week and day views and the date panel. */
function BookingCard({ booking, showDate }) {
  return (
    <Link
      href={`/dashboard/bookings/${booking.id}`}
      className={cn(
        "block rounded-md border px-3 py-2 text-sm transition-shadow hover:shadow-card focus-visible:outline-2",
        STATUS_STYLES[booking.status].chip,
        booking.status === "Cancelled" && "opacity-70",
      )}
    >
      <p className={cn("font-semibold", booking.status === "Cancelled" && "line-through")}>
        {booking.eventName}
      </p>
      <p className="tabular text-xs opacity-90">
        {showDate && `${formatDate(booking.eventDate, "d MMM")}, `}
        {formatTimeRange(booking.startTime, booking.endTime)}
      </p>
      <p className="truncate text-xs opacity-90">
        {booking.guestCount} guests, {booking.location}
      </p>
      <p className="mt-1 text-xs font-medium">{booking.status}</p>
    </Link>
  );
}

function Calendar() {
  const { bookings } = useBookings();
  const money = useCurrency();
  const params = useSearchParams();
  const requested = params.get("date");
  const initial = requested && /^\d{4}-\d{2}-\d{2}$/.test(requested) ? requested : todayISO();

  const [view, setView] = useState("month");
  const [cursor, setCursor] = useState(() => parseISO(initial));
  const [selected, setSelected] = useState(initial);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("All");
  const [type, setType] = useState("All");

  const today = todayISO();
  const query = search.trim().toLowerCase();
  const filtered = bookings.filter(
    (b) =>
      (status === "All" || b.status === status) &&
      (type === "All" || b.eventType === type) &&
      (query === "" ||
        [b.eventName, b.location, b.customer?.name ?? "", b.customer?.phone ?? ""].some((text) =>
          text.toLowerCase().includes(query),
        )),
  );
  const on = (day) => filtered.filter((b) => b.eventDate === day).sort(byTime);
  const filtersActive = status !== "All" || type !== "All" || query !== "";

  function move(direction) {
    const next =
      view === "month"
        ? addMonths(cursor, direction)
        : view === "week"
          ? addWeeks(cursor, direction)
          : addDays(cursor, direction);
    setCursor(next);
    if (view === "day") setSelected(key(next));
  }

  function goToday() {
    setCursor(new Date());
    setSelected(today);
  }

  function pick(day) {
    setSelected(key(day));
    setCursor(day);
  }

  const weekDays = eachDayOfInterval({ start: startOfWeek(cursor), end: endOfWeek(cursor) });
  const title =
    view === "month"
      ? format(cursor, "MMMM yyyy")
      : view === "week"
        ? `${format(weekDays[0], "d MMM")} to ${format(weekDays[6], "d MMM yyyy")}`
        : view === "day"
          ? format(cursor, "EEEE, d MMMM yyyy")
          : `${filtered.length} ${filtered.length === 1 ? "booking" : "bookings"}`;

  const selectedBookings = on(selected);

  return (
    <div className="space-y-4">
      {/* Search and filters */}
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="search"
            aria-label="Search bookings"
            placeholder="Search by event, customer, phone or venue"
            className="pl-9"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="flex flex-wrap gap-3">
          <Select
            aria-label="Filter by status"
            className="w-auto min-w-36"
            value={status}
            onChange={(e) => setStatus(e.target.value)}
          >
            <option value="All">All statuses</option>
            {BOOKING_STATUSES.map((s) => (
              <option key={s}>{s}</option>
            ))}
          </Select>
          <Select
            aria-label="Filter by event type"
            className="w-auto min-w-40"
            value={type}
            onChange={(e) => setType(e.target.value)}
          >
            <option value="All">All event types</option>
            {EVENT_TYPES.map((t) => (
              <option key={t}>{t}</option>
            ))}
          </Select>
          {filtersActive && (
            <Button
              variant="ghost"
              onClick={() => {
                setSearch("");
                setStatus("All");
                setType("All");
              }}
            >
              Clear filters
            </Button>
          )}
        </div>
      </div>

      {/* View switch and date navigation */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2">
          {view !== "list" && (
            <>
              <Button variant="outline" size="icon" aria-label="Previous" onClick={() => move(-1)}>
                <ChevronLeft />
              </Button>
              <Button variant="outline" size="icon" aria-label="Next" onClick={() => move(1)}>
                <ChevronRight />
              </Button>
              <Button variant="outline" onClick={goToday}>
                Today
              </Button>
            </>
          )}
          <h2 className="ml-1 text-lg font-semibold sm:text-xl" aria-live="polite">
            {title}
          </h2>
        </div>
        <Tabs value={view} onValueChange={(v) => setView(v)}>
          <TabsList>
            <TabsTrigger value="month">Month</TabsTrigger>
            <TabsTrigger value="week">Week</TabsTrigger>
            <TabsTrigger value="day">Day</TabsTrigger>
            <TabsTrigger value="list">List</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* Status colour key */}
      {view !== "list" && (
        <ul className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
          {BOOKING_STATUSES.map((s) => (
            <li key={s} className="flex items-center gap-1.5">
              <span className={cn("size-2.5 rounded-full", STATUS_STYLES[s].dot)} /> {s}
            </li>
          ))}
        </ul>
      )}

      {view === "month" && (
        <div className="grid items-start gap-4 xl:grid-cols-[minmax(0,1fr)_20rem]">
          <Card className="overflow-hidden">
            <div className="grid grid-cols-7 border-b bg-muted/60 text-center text-xs font-semibold text-muted-foreground">
              {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => (
                <div key={d} className="py-2">
                  <span className="sm:hidden">{d[0]}</span>
                  <span className="hidden sm:inline">{d}</span>
                </div>
              ))}
            </div>
            <div className="grid grid-cols-7">
              {eachDayOfInterval({
                start: startOfWeek(startOfMonth(cursor)),
                end: endOfWeek(endOfMonth(cursor)),
              }).map((day) => {
                const dayKey = key(day);
                const events = on(dayKey);
                return (
                  <button
                    key={dayKey}
                    type="button"
                    onClick={() => pick(day)}
                    aria-pressed={selected === dayKey}
                    aria-label={`${format(day, "d MMMM")}, ${events.length} ${events.length === 1 ? "booking" : "bookings"}`}
                    className={cn(
                      "flex min-h-16 flex-col gap-1 border-b border-r p-1 text-left align-top transition-colors outline-none hover:bg-muted/60 focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring sm:min-h-28 sm:p-1.5 [&:nth-child(7n)]:border-r-0",
                      !isSameMonth(day, cursor) && "bg-muted/40 text-muted-foreground/60",
                      selected === dayKey && "bg-accent/70 hover:bg-accent/70",
                    )}
                  >
                    <span
                      className={cn(
                        "tabular flex size-6 items-center justify-center rounded-full text-xs font-medium",
                        dayKey === today && "bg-primary text-primary-foreground",
                      )}
                    >
                      {format(day, "d")}
                    </span>
                    {/* Chips on larger screens, dots on phones */}
                    <span className="hidden w-full flex-col gap-1 sm:flex">
                      {events.slice(0, 2).map((b) => (
                        <span
                          key={b.id}
                          className={cn(
                            "truncate rounded border px-1 py-0.5 text-[11px] font-medium leading-tight",
                            STATUS_STYLES[b.status].chip,
                            b.status === "Cancelled" && "line-through opacity-70",
                          )}
                        >
                          {formatTime(b.startTime).replace(":00", "")} {b.eventName}
                        </span>
                      ))}
                      {events.length > 2 && (
                        <span className="px-1 text-[11px] text-muted-foreground">
                          +{events.length - 2} more
                        </span>
                      )}
                    </span>
                    <span className="flex flex-wrap gap-0.5 sm:hidden">
                      {events.slice(0, 4).map((b) => (
                        <span
                          key={b.id}
                          className={cn("size-1.5 rounded-full", STATUS_STYLES[b.status].dot)}
                        />
                      ))}
                    </span>
                  </button>
                );
              })}
            </div>
          </Card>

          {/* Bookings on the selected date */}
          <Card className="p-4">
            <p className="font-display text-base font-semibold">{formatDate(selected)}</p>
            <p className="mb-3 text-sm text-muted-foreground">
              {selectedBookings.length === 0
                ? "No bookings on this date."
                : `${selectedBookings.length} ${selectedBookings.length === 1 ? "booking" : "bookings"}, ${selectedBookings.reduce((sum, b) => sum + (b.status === "Cancelled" ? 0 : b.guestCount), 0)} guests`}
            </p>
            <div className="space-y-2">
              {selectedBookings.map((b) => (
                <BookingCard key={b.id} booking={b} />
              ))}
            </div>
            <Button asChild variant="outline" className="mt-3 w-full">
              <Link href={`/dashboard/bookings/new?date=${selected}`}>
                <CalendarPlus /> New booking on this date
              </Link>
            </Button>
          </Card>
        </div>
      )}

      {view === "week" && (
        <div className="grid gap-3 md:grid-cols-4 xl:grid-cols-7">
          {weekDays.map((day) => {
            const dayKey = key(day);
            const events = on(dayKey);
            return (
              <Card key={dayKey} className={cn("p-3", dayKey === today && "border-primary")}>
                <button
                  type="button"
                  className="mb-2 flex w-full items-baseline justify-between rounded text-left outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  onClick={() => {
                    pick(day);
                    setView("day");
                  }}
                  aria-label={`Open ${format(day, "EEEE d MMMM")}`}
                >
                  <span className="text-xs font-semibold text-muted-foreground">
                    {format(day, "EEE")}
                  </span>
                  <span
                    className={cn(
                      "tabular font-display text-lg font-semibold",
                      dayKey === today && "text-primary",
                    )}
                  >
                    {format(day, "d")}
                  </span>
                </button>
                <div className="space-y-2">
                  {events.length === 0 ? (
                    <p className="py-3 text-center text-xs text-muted-foreground">No events</p>
                  ) : (
                    events.map((b) => <BookingCard key={b.id} booking={b} />)
                  )}
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {view === "day" && (
        <Card className="p-4 sm:p-5">
          {on(key(cursor)).length === 0 ? (
            <EmptyState
              icon={CalendarDays}
              title="Nothing booked on this day"
              description={
                filtersActive
                  ? "No bookings match your filters on this date."
                  : "The kitchen is free. Add a booking for this date."
              }
              action={
                <Button asChild size="sm">
                  <Link href={`/dashboard/bookings/new?date=${key(cursor)}`}>
                    <CalendarPlus /> New booking
                  </Link>
                </Button>
              }
            />
          ) : (
            <ol className="space-y-3">
              {on(key(cursor)).map((b) => (
                <li key={b.id} className="grid gap-2 sm:grid-cols-[7rem_1fr] sm:gap-4">
                  <p className="tabular pt-2 text-sm font-semibold text-muted-foreground">
                    {formatTime(b.startTime)}
                    <span className="block text-xs font-normal">until {formatTime(b.endTime)}</span>
                  </p>
                  <BookingCard booking={b} />
                </li>
              ))}
            </ol>
          )}
        </Card>
      )}

      {view === "list" &&
        (filtered.length === 0 ? (
          <EmptyState
            icon={CalendarDays}
            title={bookings.length === 0 ? "No bookings yet" : "No bookings match"}
            description={
              bookings.length === 0
                ? "Create your first booking to see it here and on the calendar."
                : "Try a different search or clear the filters."
            }
            action={
              bookings.length === 0 ? (
                <Button asChild size="sm">
                  <Link href="/dashboard/bookings/new">New booking</Link>
                </Button>
              ) : undefined
            }
          />
        ) : (
          <Card className="overflow-hidden">
            <Table className="min-w-[760px]">
              <TableHeader>
                <tr>
                  <TableHead>Event</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Date and time</TableHead>
                  <TableHead className="text-right">Guests</TableHead>
                  <TableHead className="text-right">Total</TableHead>
                  <TableHead>Status</TableHead>
                </tr>
              </TableHeader>
              <TableBody>
                {[...filtered]
                  .sort((a, b) => b.eventDate.localeCompare(a.eventDate) || byTime(a, b))
                  .map((b) => (
                    <TableRow key={b.id}>
                      <TableCell>
                        <Link
                          href={`/dashboard/bookings/${b.id}`}
                          className="font-medium underline-offset-4 hover:underline"
                        >
                          {b.eventName}
                        </Link>
                        <span className="flex items-center gap-2 text-xs text-muted-foreground">
                          {b.eventType} {b.isDemo && <DemoTag />}
                        </span>
                      </TableCell>
                      <TableCell>
                        {b.customer?.name ?? "Unknown"}
                        <span className="tabular block text-xs text-muted-foreground">
                          {b.customer?.phone}
                        </span>
                      </TableCell>
                      <TableCell className="tabular whitespace-nowrap">
                        {formatDate(b.eventDate, "d MMM yyyy")}
                        <span className="block text-xs text-muted-foreground">
                          {formatTimeRange(b.startTime, b.endTime)}
                        </span>
                      </TableCell>
                      <TableCell className="tabular text-right">{b.guestCount}</TableCell>
                      <TableCell className="tabular text-right font-medium">
                        {money(b.totalPrice)}
                      </TableCell>
                      <TableCell>
                        <StatusBadge status={b.status} />
                      </TableCell>
                    </TableRow>
                  ))}
              </TableBody>
            </Table>
          </Card>
        ))}
    </div>
  );
}

export function BookingsView() {
  return <DataBoundary>{() => <Calendar />}</DataBoundary>;
}
