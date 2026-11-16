"use client";

import { format, formatDistanceToNow, parseISO } from "date-fns";
import {
  BookOpenText,
  CalendarClock,
  CalendarPlus,
  Calculator,
  ClipboardList,
  IndianRupee,
  UserPlus,
  Users,
} from "lucide-react";
import Link from "next/link";
import { DataBoundary } from "@/components/shared/data-boundary";
import { StatusBadge } from "@/components/shared/badges";
import { EmptyState } from "@/components/shared/states";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useCurrency } from "@/hooks/use-settings";
import {
  dashboardStats,
  monthlyBookingSeries,
  recentActivity,
  statusDistribution,
  upcomingBookings,
} from "@/lib/calculations/dashboard";
import { formatDate, formatTimeRange, todayISO } from "@/lib/utils";

import { BookingsChart } from "./bookings-chart";
import { MiniCalendar } from "./mini-calendar";
import { StatCard } from "./stat-card";
import { StatusDistribution } from "./status-distribution";

const QUICK_ACTIONS = [
  { href: "/dashboard/bookings/new", label: "New booking", icon: CalendarPlus },
  { href: "/dashboard/guest-calculator", label: "Calculate quantities", icon: Calculator },
  { href: "/dashboard/menu-builder", label: "Build a menu", icon: BookOpenText },
  { href: "/dashboard/customers", label: "Add a customer", icon: UserPlus },
];

function Dashboard({ data }) {
  const money = useCurrency();
  const now = new Date();
  const today = todayISO();
  const stats = dashboardStats(data, today);
  const upcoming = upcomingBookings(data.bookings, today).slice(0, 5);
  const activity = recentActivity(data.bookings);
  const customers = new Map(data.customers.map((c) => [c.id, c]));

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Total bookings"
          value={String(stats.totalBookings)}
          detail={`${stats.cancelledBookings} cancelled`}
          icon={ClipboardList}
        />
        <StatCard
          label="Upcoming events"
          value={String(stats.upcomingEvents)}
          detail="Pending, confirmed or in progress"
          icon={CalendarClock}
        />
        <StatCard
          label="Total customers"
          value={String(stats.totalCustomers)}
          detail="Linked to bookings automatically"
          icon={Users}
        />
        <StatCard
          label="Estimated monthly revenue"
          value={money(stats.monthlyRevenue)}
          detail={`${stats.monthlyEvents} ${stats.monthlyEvents === 1 ? "event" : "events"} in ${format(now, "MMMM")}`}
          icon={IndianRupee}
        />
      </div>

      <Card>
        <CardContent className="flex flex-wrap items-center gap-2 p-4">
          <p className="mr-2 text-sm font-semibold">Quick actions</p>
          {QUICK_ACTIONS.map(({ href, label, icon: Icon }, i) => (
            <Button key={href} asChild variant={i === 0 ? "default" : "outline"} size="sm">
              <Link href={href}>
                <Icon /> {label}
              </Link>
            </Button>
          ))}
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Bookings per month</CardTitle>
            <CardDescription>
              Events by event date, cancelled bookings excluded. The darker bar is this month.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <BookingsChart data={monthlyBookingSeries(data.bookings, now)} formatMoney={money} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Booking status</CardTitle>
            <CardDescription>
              All {data.bookings.length} bookings by current status.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <StatusDistribution data={statusDistribution(data.bookings)} />
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader className="flex-row items-center justify-between">
            <CardTitle>Upcoming bookings</CardTitle>
            <Button asChild variant="link" className="h-auto p-0">
              <Link href="/dashboard/bookings">View all</Link>
            </Button>
          </CardHeader>
          <CardContent>
            {upcoming.length === 0 ? (
              <EmptyState
                icon={CalendarClock}
                title="No upcoming events"
                description="New bookings with a future date will show up here."
                action={
                  <Button asChild size="sm">
                    <Link href="/dashboard/bookings/new">New booking</Link>
                  </Button>
                }
              />
            ) : (
              <ul className="divide-y">
                {upcoming.map((b) => (
                  <li key={b.id}>
                    <Link
                      href={`/dashboard/bookings/${b.id}`}
                      className="-mx-2 flex items-center gap-4 rounded-md px-2 py-3 transition-colors hover:bg-muted/60 focus-visible:outline-2"
                    >
                      <div className="w-12 shrink-0 rounded-md bg-muted py-1 text-center">
                        <p className="text-[11px] font-medium text-muted-foreground">
                          {formatDate(b.eventDate, "MMM")}
                        </p>
                        <p className="tabular font-display text-lg font-semibold leading-tight">
                          {formatDate(b.eventDate, "d")}
                        </p>
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-semibold">{b.eventName}</p>
                        <p className="truncate text-sm text-muted-foreground">
                          {customers.get(b.customerId)?.name ?? "Unknown customer"}, {b.guestCount}{" "}
                          guests, {formatTimeRange(b.startTime, b.endTime)}
                        </p>
                      </div>
                      <div className="hidden text-right sm:block">
                        <p className="tabular text-sm font-semibold">{money(b.totalPrice)}</p>
                      </div>
                      <StatusBadge status={b.status} />
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex-row items-center justify-between">
            <CardTitle>{format(now, "MMMM yyyy")}</CardTitle>
            <Button asChild variant="link" className="h-auto p-0">
              <Link href="/dashboard/bookings">Open calendar</Link>
            </Button>
          </CardHeader>
          <CardContent>
            <MiniCalendar bookings={data.bookings} today={now} />
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent booking activity</CardTitle>
        </CardHeader>
        <CardContent>
          {activity.length === 0 ? (
            <p className="py-4 text-sm text-muted-foreground">
              Nothing yet. Activity appears when bookings are created or updated.
            </p>
          ) : (
            <ul className="divide-y">
              {activity.map(({ booking, action }) => (
                <li
                  key={booking.id}
                  className="flex flex-wrap items-center justify-between gap-x-4 gap-y-1 py-2.5 text-sm"
                >
                  <p className="min-w-0">
                    <span className="text-muted-foreground">{action}: </span>
                    <Link
                      href={`/dashboard/bookings/${booking.id}`}
                      className="font-medium underline-offset-4 hover:underline"
                    >
                      {booking.eventName}
                    </Link>
                  </p>
                  <div className="flex items-center gap-3">
                    <StatusBadge status={booking.status} />
                    <span className="text-muted-foreground">
                      {formatDistanceToNow(parseISO(booking.updatedAt), { addSuffix: true })}
                    </span>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export function DashboardView() {
  return <DataBoundary>{(data) => <Dashboard data={data} />}</DataBoundary>;
}
