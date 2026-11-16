import { Suspense } from "react";
import { BookingFormLoader } from "@/components/bookings/booking-form-loader";
import { PageHeader } from "@/components/layout/page-header";
import { PageSkeleton } from "@/components/shared/states";

export const metadata = { title: "New Booking" };

export default function NewBookingPage() {
  return (
    <>
      <PageHeader
        title="New Booking"
        description="Record the customer, event and menu. The price is calculated as you type."
      />
      <Suspense fallback={<PageSkeleton />}>
        <BookingFormLoader />
      </Suspense>
    </>
  );
}
