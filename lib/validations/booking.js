import { isValid, parseISO } from "date-fns";
import { z } from "zod";
import { computePricing } from "@/lib/calculations/pricing";
import { BOOKING_STATUSES, EVENT_TYPES, SERVICE_STYLES } from "@/lib/constants";
import { emailAddress, money, phoneNumber, requiredNumber } from "./common";

const time = (label) => z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/, `${label} is required`);

export const bookingFormSchema = z
  .object({
    customerName: z.string().trim().min(2, "Customer name is required").max(80),
    customerPhone: phoneNumber,
    customerEmail: emailAddress,

    eventName: z.string().trim().min(2, "Event name is required").max(120),
    eventType: z.enum(EVENT_TYPES, { error: "Select an event type" }),
    eventDate: z
      .string()
      .regex(/^\d{4}-\d{2}-\d{2}$/, "Event date is required")
      .refine((value) => isValid(parseISO(value)), "Enter a valid date"),
    startTime: time("Start time"),
    endTime: time("End time"),
    location: z.string().trim().min(3, "Event location is required").max(200),
    guestCount: requiredNumber("Number of guests")
      .int("Guests must be a whole number")
      .positive("Guests must be more than 0")
      .max(20000, "Guest count is too large"),

    /** Empty string means "custom, no package". */
    menuId: z.string(),
    serviceType: z.enum(SERVICE_STYLES, { error: "Select a service type" }),
    dietaryRequirements: z.string().trim().max(500, "Keep this under 500 characters"),
    instructions: z.string().trim().max(1000, "Keep this under 1000 characters"),

    pricePerPerson: money("Price per person"),
    additionalCharges: money("Additional charges"),
    discount: money("Discount"),
    advanceAmount: money("Advance payment"),
    status: z.enum(BOOKING_STATUSES),
  })
  .superRefine((values, ctx) => {
    if (values.startTime && values.endTime && values.endTime <= values.startTime) {
      ctx.addIssue({
        code: "custom",
        path: ["endTime"],
        message: "End time must be after start time",
      });
    }
    const subtotal = values.guestCount * values.pricePerPerson;
    if (values.discount > subtotal + values.additionalCharges) {
      ctx.addIssue({
        code: "custom",
        path: ["discount"],
        message: "Discount cannot be more than the booking amount",
      });
      return;
    }
    const { totalPrice } = computePricing(values);
    if (values.advanceAmount > totalPrice) {
      ctx.addIssue({
        code: "custom",
        path: ["advanceAmount"],
        message: "Advance cannot exceed the total booking amount",
      });
    }
  });

/** Validated form values plus the pricing figures computed on the server. */
