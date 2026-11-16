"use client";

import { SearchX } from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { DataBoundary } from "@/components/shared/data-boundary";
import { EmptyState } from "@/components/shared/states";
import { Button } from "@/components/ui/button";
import { useBooking } from "@/hooks/use-bookings";

import { BookingForm } from "./booking-form";

export function BookingNotFound() {
  return (
    <EmptyState
      icon={SearchX}
      title="Booking not found"
      description="This booking does not exist or was removed when the data was reset."
      action={
        <Button asChild>
          <Link href="/dashboard/bookings">Back to bookings</Link>
        </Button>
      }
    />
  );
}

function EditForm({ data, id }) {
  const { booking } = useBooking(id);
  if (!booking) return <BookingNotFound />;
  // The key remounts the form if the booking changes, so it never shows stale values.
  return <BookingForm key={booking.updatedAt} data={data} booking={booking} />;
}

function NewForm({ data }) {
  const date = useSearchParams().get("date") ?? "";
  return <BookingForm key={date} data={data} />;
}

/** Waits for data, then renders the booking form in create or edit mode. */
export function BookingFormLoader({ id }) {
  return (
    <DataBoundary>
      {(data) => (id ? <EditForm data={data} id={id} /> : <NewForm data={data} />)}
    </DataBoundary>
  );
}
