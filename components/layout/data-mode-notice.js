import { cookies } from "next/headers";
import { Info, X } from "lucide-react";
import { dismissDemoNoticeAction } from "@/lib/actions/preferences";
import { DEMO_NOTICE_COOKIE } from "@/lib/constants";
import { isMongoConfigured } from "@/lib/mongodb/config";

/**
 * Async Server Component. Reads a cookie at request time, so the layout wraps
 * it in <Suspense> and the rest of the shell can be prerendered. The dismiss
 * button is a plain <form> bound to a Server Action.
 */
export async function DataModeNotice() {
  const store = await cookies();
  if (store.get(DEMO_NOTICE_COOKIE)?.value === "dismissed") return null;

  return (
    <div className="flex items-start gap-3 border-b bg-accent/60 px-4 py-2.5 text-sm text-accent-foreground sm:px-6">
      <Info className="mt-0.5 size-4 shrink-0" />
      <p className="flex-1">
        {isMongoConfigured
          ? "Connected to MongoDB. Records are saved to your MongoDB database."
          : "Local mode: records are saved in this browser. Sample records are tagged Demo and can be reset in Settings."}
      </p>
      <form action={dismissDemoNoticeAction}>
        <button
          type="submit"
          className="rounded p-0.5 hover:bg-emerald-200/60 focus-visible:outline-2"
          aria-label="Dismiss notice"
        >
          <X className="size-4" />
        </button>
      </form>
    </div>
  );
}
