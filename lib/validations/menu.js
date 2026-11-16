import { z } from "zod";
import { DIETARY_TYPES, MENU_CATEGORIES } from "@/lib/constants";
import { money, requiredNumber } from "./common";

export const menuItemSchema = z.object({
  name: z.string().trim().min(2, "Food item name is required").max(80),
  category: z.enum(MENU_CATEGORIES, { error: "Select a category" }),
  description: z.string().trim().max(300, "Keep this under 300 characters"),
  pricePerPerson: money("Price per person"),
  dietaryType: z.enum(DIETARY_TYPES, { error: "Select a dietary type" }),
  imageUrl: z
    .string()
    .trim()
    .refine(
      (value) => value === "" || /^https?:\/\/\S+$/i.test(value),
      "Enter a full image link starting with http:// or https://",
    ),
  isAvailable: z.boolean(),
});

export const menuSchema = z.object({
  name: z.string().trim().min(2, "Package name is required").max(80),
  description: z.string().trim().max(300, "Keep this under 300 characters"),
  itemIds: z.array(z.string()).min(1, "Select at least one food item"),
  defaultGuestCount: requiredNumber("Guest count")
    .int("Guests must be a whole number")
    .positive("Guests must be more than 0")
    .max(20000, "Guest count is too large"),
});
