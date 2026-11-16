"use server";

import { cookies } from "next/headers";
import { DEMO_NOTICE_COOKIE } from "@/lib/constants";

/**
 * Server Action: remembers that the data-mode notice was dismissed.
 * Setting a cookie in a Server Action makes Next.js re-render the layout on
 * the server, so the notice disappears without any client state.
 */
export async function dismissDemoNoticeAction() {
  const store = await cookies();
  store.set(DEMO_NOTICE_COOKIE, "dismissed", {
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
    sameSite: "lax",
  });
}
