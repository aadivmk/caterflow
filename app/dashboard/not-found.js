import { SearchX } from "lucide-react";
import Link from "next/link";
import { EmptyState } from "@/components/shared/states";
import { Button } from "@/components/ui/button";

export default function DashboardNotFound() {
  return (
    <EmptyState
      icon={SearchX}
      title="Page not found"
      description="This page does not exist in the dashboard. Check the address or go back to your bookings."
      action={
        <Button asChild>
          <Link href="/dashboard/bookings">View bookings</Link>
        </Button>
      }
    />
  );
}
