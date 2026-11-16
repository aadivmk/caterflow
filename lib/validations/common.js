import { z } from "zod";

/** Number field that gives a readable message when the input is left empty. */
export const requiredNumber = (label) => z.number({ error: `${label} is required` });

export const money = (label) =>
  requiredNumber(label)
    .min(0, `${label} cannot be negative`)
    .max(100000000, `${label} is too large`);

/** Accepts 10-digit Indian mobile numbers, with or without +91, spaces or dashes. */
export const phoneNumber = z
  .string()
  .trim()
  .min(1, "Phone number is required")
  .refine(
    (value) => /^(\+?91)?[6-9]\d{9}$/.test(value.replace(/[\s-]/g, "")),
    "Enter a valid 10-digit mobile number",
  );

export const emailAddress = z
  .string()
  .trim()
  .min(1, "Email address is required")
  .pipe(z.email("Enter a valid email address"));

/** Turns Zod issues into a { fieldName: message } map for forms and APIs. */
export function fieldErrorsFrom(error) {
  const out = {};
  for (const issue of error.issues) {
    const key = issue.path.join(".") || "form";
    if (!out[key]) out[key] = issue.message;
  }
  return out;
}
