import { addDays, format } from "date-fns";
import { computePricing } from "@/lib/calculations/pricing";
import { bookingFormSchema } from "@/lib/validations/booking";
import { fieldErrorsFrom } from "@/lib/validations/common";

/**
 * Validates raw booking input and computes the money figures (total, balance,
 * payment status). Shared by the Server Action and the /api/bookings Route
 * Handler so both entry points apply exactly the same rules.
 */
export function prepareBooking(raw, mode) {
  const parsed = bookingFormSchema.safeParse(raw);
  if (!parsed.success) {
    return {
      ok: false,
      message: "Some details need attention. Check the highlighted fields.",
      fieldErrors: fieldErrorsFrom(parsed.error),
    };
  }

  const values = parsed.data;

  // New events cannot be created in the past. One day of slack covers the
  // difference between the server's clock (UTC) and the user's time zone.
  if (mode === "create") {
    const earliest = format(addDays(new Date(), -1), "yyyy-MM-dd");
    if (values.eventDate < earliest) {
      return {
        ok: false,
        message: "The event date is in the past.",
        fieldErrors: { eventDate: "Event date cannot be in the past" },
      };
    }
  }

  const { totalPrice, remainingBalance, paymentStatus } = computePricing(values);
  return { ok: true, data: { ...values, totalPrice, remainingBalance, paymentStatus } };
}
