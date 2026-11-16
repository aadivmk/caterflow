import { z } from "zod";
import { CURRENCIES, EVENT_TYPES, MEAL_TYPES, SERVICE_STYLES } from "@/lib/constants";
import { emailAddress, money, phoneNumber, requiredNumber } from "./common";

const positive = (label, max) =>
  requiredNumber(label).positive(`${label} must be more than 0`).max(max, `${label} is too large`);

const nonNegative = (label, max) =>
  requiredNumber(label).min(0, `${label} cannot be negative`).max(max, `${label} is too large`);

const recordOf = (keys, field) => z.object(Object.fromEntries(keys.map((k) => [k, field(k)])));

export const assumptionsSchema = z.object({
  bufferPercent: nonNegative("Buffer", 100),
  foodPerServingG: positive("Food per serving", 5000),
  ricePerServingG: nonNegative("Rice per serving", 2000),
  meatPerServingG: nonNegative("Meat per serving", 2000),
  vegPerServingG: nonNegative("Vegetables per serving", 2000),
  waterPerServingL: nonNegative("Water per serving", 10),
  mealMultipliers: recordOf(MEAL_TYPES, (k) => positive(`${k} multiplier`, 10)),
  guestsPerStaff: recordOf(SERVICE_STYLES, (k) => positive(`${k} ratio`, 500)),
  eventBufferPercent: recordOf(EVENT_TYPES, (k) => nonNegative(`${k} buffer`, 100)),
});

export const settingsSchema = z.object({
  businessName: z.string().trim().min(2, "Business name is required").max(80),
  ownerName: z.string().trim().max(80),
  phone: phoneNumber,
  email: emailAddress,
  address: z.string().trim().max(200, "Keep this under 200 characters"),
  gstNumber: z.string().trim().max(20, "Keep this under 20 characters"),
  currency: z.enum(CURRENCIES),
  defaultPricePerGuest: money("Default price per guest"),
  cateringTeams: requiredNumber("Catering teams")
    .int("Use a whole number")
    .min(1, "You need at least 1 team")
    .max(50, "That is too many teams"),
  dailyGuestCapacity: requiredNumber("Daily guest capacity")
    .int("Use a whole number")
    .min(1, "Capacity must be at least 1")
    .max(100000, "Capacity is too large"),
  calculatorAssumptions: assumptionsSchema,
});

export const calculatorInputSchema = z.object({
  guests: requiredNumber("Number of guests")
    .int("Guests must be a whole number")
    .positive("Guests must be more than 0")
    .max(20000, "Guest count is too large"),
  eventType: z.enum(EVENT_TYPES),
  mealType: z.enum(MEAL_TYPES),
  serviceStyle: z.enum(SERVICE_STYLES),
  budgetPerGuest: money("Budget per guest"),
});
