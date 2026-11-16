"use client";

import { RotateCcw } from "lucide-react";
import * as React from "react";
import { toast } from "sonner";
import { useAppData } from "@/components/providers/data-provider";
import { Button } from "@/components/ui/button";
import { errorMessage } from "@/lib/utils";

import { ErrorState, PageSkeleton } from "./states";

/**
 * Handles the three states every data page shares: loading, failed, ready.
 * Children are a render function so they only run once data exists.
 */
export function DataBoundary({ children, fallback }) {
  const { data, loading, error, reload, resetDemoData, mode } = useAppData();

  if (error) {
    return (
      <ErrorState
        message={error}
        action={
          <div className="flex flex-wrap justify-center gap-2">
            <Button variant="outline" onClick={() => void reload()}>
              <RotateCcw /> Try again
            </Button>
            {mode === "local" && (
              <Button
                variant="destructive"
                onClick={() =>
                  resetDemoData()
                    .then(() => toast.success("Demo data restored"))
                    .catch((e) => toast.error(errorMessage(e)))
                }
              >
                Reset demo data
              </Button>
            )}
          </div>
        }
      />
    );
  }

  if (loading || !data) return <>{fallback ?? <PageSkeleton />}</>;

  return <>{children(data)}</>;
}
