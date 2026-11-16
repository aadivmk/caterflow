import { ChevronLeft } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { BookingDetailsView } from "@/components/bookings/booking-details-view";
import { PageSkeleton } from "@/components/shared/states";
import { isUuid } from "@/lib/utils";

export const metadata = { title: "Booking Details" };

/**
 * Dynamic route: /dashboard/bookings/[id].
 * `params` is a Promise that resolves at request time, so the part that awaits
 * it sits inside <Suspense> and streams in after the static shell.
 */
async function BookingDetails({ params }) {
  const { id } = await params;
  // Booking ids are UUIDs. Anything else cannot exist, so show the 404 page.
  if (!isUuid(id)) notFound();
  return <BookingDetailsView id={id} />;
}

export default function BookingDetailsPage({ params }) {
  return (
    <>
      <Link
        href="/dashboard/bookings"
        className="mb-4 inline-flex items-center gap-1 text-sm font-medium text-muted-foreground hover:text-foreground"
      >
        <ChevronLeft className="size-4" /> All bookings
      </Link>
      <Suspense fallback={<PageSkeleton />}>
        <BookingDetails params={params} />
      </Suspense>
    </>
  );
}
