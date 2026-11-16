import { addMonths, format, startOfMonth } from "date-fns";
import { ACTIVE_STATUSES, BOOKING_STATUSES } from "@/lib/constants";

const isActive = (b) => ACTIVE_STATUSES.includes(b.status);

export function upcomingBookings(bookings, today) {
  return bookings
    .filter((b) => isActive(b) && b.eventDate >= today)
    .sort((a, b) => `${a.eventDate}${a.startTime}`.localeCompare(`${b.eventDate}${b.startTime}`));
}

export function dashboardStats(data, today) {
  const monthKey = today.slice(0, 7);
  const live = data.bookings.filter((b) => b.status !== "Cancelled");
  const thisMonth = live.filter((b) => b.eventDate.startsWith(monthKey));
  return {
    totalBookings: data.bookings.length,
    cancelledBookings: data.bookings.length - live.length,
    upcomingEvents: upcomingBookings(data.bookings, today).length,
    totalCustomers: data.customers.length,
    monthlyRevenue: thisMonth.reduce((sum, b) => sum + b.totalPrice, 0),
    monthlyEvents: thisMonth.length,
  };
}

/** Bookings per month for a window around the current month (cancelled excluded). */
export function monthlyBookingSeries(bookings, today, back = 4, forward = 1) {
  const start = startOfMonth(addMonths(today, -back));
  return Array.from({ length: back + forward + 1 }, (_, i) => {
    const month = addMonths(start, i);
    const key = format(month, "yyyy-MM");
    const inMonth = bookings.filter((b) => b.status !== "Cancelled" && b.eventDate.startsWith(key));
    return {
      key,
      label: format(month, "MMM"),
      fullLabel: format(month, "MMMM yyyy"),
      bookings: inMonth.length,
      revenue: inMonth.reduce((sum, b) => sum + b.totalPrice, 0),
      isCurrent: key === format(today, "yyyy-MM"),
    };
  });
}

export function statusDistribution(bookings) {
  return BOOKING_STATUSES.map((status) => ({
    status,
    count: bookings.filter((b) => b.status === status).length,
  }));
}

export function recentActivity(bookings, limit = 6) {
  return [...bookings]
    .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))
    .slice(0, limit)
    .map((b) => ({
      booking: b,
      action: b.updatedAt === b.createdAt ? "Booking created" : "Booking updated",
    }));
}
