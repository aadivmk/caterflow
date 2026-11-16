"use server";

import { prepareBooking } from "@/lib/bookings/prepare";

/**
 * Server Action: the server-side gate every booking passes before it is saved.
 *
 * The browser validates for quick feedback, but browser checks can be bypassed,
 * so the same Zod schema runs again here and the money figures (total, balance,
 * payment status) are computed on the server instead of trusted from the form.
 * The caller then persists the returned draft through the Repository.
 */
export async function prepareBookingAction(raw, mode) {
  return prepareBooking(raw, mode);
}
