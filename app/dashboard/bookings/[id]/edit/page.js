import { notFound } from "next/navigation";
import { Suspense } from "react";
import { BookingFormLoader } from "@/components/bookings/booking-form-loader";
import { PageHeader } from "@/components/layout/page-header";
import { PageSkeleton } from "@/components/shared/states";
import { isUuid } from "@/lib/utils";

export const metadata = { title: "Edit Booking" };

async function EditBooking({ params }) {
  const { id } = await params;
  if (!isUuid(id)) notFound();
  return <BookingFormLoader id={id} />;
}

/** Nested dynamic route: /dashboard/bookings/[id]/edit. */
export default function EditBookingPage({ params }) {
  return (
    <>
      <PageHeader
        title="Edit Booking"
        description="Update the event, menu or payment details. Conflicts are checked again."
      />
      <Suspense fallback={<PageSkeleton />}>
        <EditBooking params={params} />
      </Suspense>
    </>
  );
}
