"use client";

import { useMemo } from "react";
import { useAppData } from "@/components/providers/data-provider";

/** Customers with their booking history and spend, derived from booking records. */
export function useCustomers() {
  const { data, loading, error, saveCustomer } = useAppData();

  const customers = useMemo(() => {
    if (!data) return [];
    return data.customers
      .map((customer) => {
        const bookings = data.bookings
          .filter((b) => b.customerId === customer.id)
          .sort((a, b) => b.eventDate.localeCompare(a.eventDate));
        const live = bookings.filter((b) => b.status !== "Cancelled");
        return {
          ...customer,
          bookings,
          eventCount: live.length,
          totalSpent: live.reduce((sum, b) => sum + b.totalPrice, 0),
        };
      })
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [data]);

  return { customers, loading, error, saveCustomer };
}
