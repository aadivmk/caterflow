import { CalendarPlus } from "lucide-react";
import Link from "next/link";
import { Suspense } from "react";
import { BookingsView } from "@/components/bookings/bookings-view";
import { PageHeader } from "@/components/layout/page-header";
import { PageSkeleton } from "@/components/shared/states";
import { Button } from "@/components/ui/button";

export const metadata = { title: "Bookings" };

export default function BookingsPage() {
  return (
    <>
      <PageHeader
        title="Booking Calendar"
        description="Every catering event by month, week or day. Select a date to see its bookings."
        actions={
          <Button asChild>
            <Link href="/dashboard/bookings/new">
              <CalendarPlus /> New booking
            </Link>
          </Button>
        }
      />
      {/* The calendar reads ?date= from the URL, which is only known at request time. */}
      <Suspense fallback={<PageSkeleton />}>
        <BookingsView />
      </Suspense>
    </>
  );
}
