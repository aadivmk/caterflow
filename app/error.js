"use client";

import { useEffect } from "react";
import { ErrorState } from "@/components/shared/states";
import { Button } from "@/components/ui/button";

/** Root error boundary for routes outside the dashboard. */
export default function RootError({ error, retry }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <main className="mx-auto flex w-full max-w-xl flex-1 flex-col justify-center px-6 py-24">
      <ErrorState
        title="Something went wrong"
        message="The page hit an unexpected error. Try loading it again."
        action={<Button onClick={() => retry()}>Try again</Button>}
      />
    </main>
  );
}
