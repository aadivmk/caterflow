"use client";

import Link from "next/link";
import { useEffect } from "react";
import { ErrorState } from "@/components/shared/states";
import { Button } from "@/components/ui/button";

/**
 * Route-level error boundary for the dashboard segment. The sidebar and top
 * bar stay on screen because they live in the layout above this boundary.
 */
export default function DashboardError({ error, retry }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <ErrorState
      title="This section stopped working"
      message="An unexpected error interrupted the page. Your saved data is not affected."
      action={
        <div className="flex flex-wrap justify-center gap-2">
          <Button onClick={() => retry()}>Try again</Button>
          <Button asChild variant="outline">
            <Link href="/dashboard">Back to dashboard</Link>
          </Button>
        </div>
      }
    />
  );
}
