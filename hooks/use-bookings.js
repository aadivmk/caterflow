"use client";

import { useMemo } from "react";
import { useAppData } from "@/components/providers/data-provider";

/** Bookings joined with their customer and menu, plus the booking mutations. */
export function useBookings() {
  const { data, loading, error, saveBooking, setBookingStatus, recordPayment } = useAppData();

  const bookings = useMemo(() => {
    if (!data) return [];
    const customers = new Map(data.customers.map((c) => [c.id, c]));
    const menus = new Map(data.menus.map((m) => [m.id, m]));
    return data.bookings.map((b) => ({
      ...b,
      customer: customers.get(b.customerId),
      menu: b.menuId ? menus.get(b.menuId) : undefined,
    }));
  }, [data]);

  return { bookings, loading, error, saveBooking, setBookingStatus, recordPayment };
}

export function useBooking(id) {
  const { bookings, loading, error } = useBookings();
  return { booking: bookings.find((b) => b.id === id), loading, error };
}
