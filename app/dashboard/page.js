import { CalendarPlus } from "lucide-react";
import Link from "next/link";
import { DashboardView } from "@/components/dashboard/dashboard-view";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";

export const metadata = { title: "Dashboard" };

/** Server Component page: static header on the server, live figures in a Client Component. */
export default function DashboardPage() {
  return (
    <>
      <PageHeader
        title="Dashboard"
        description="Your bookings, customers and revenue at a glance."
        actions={
          <Button asChild>
            <Link href="/dashboard/bookings/new">
              <CalendarPlus /> New booking
            </Link>
          </Button>
        }
      />
      <DashboardView />
    </>
  );
}
