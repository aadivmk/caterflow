import { z } from "zod";
import { emailAddress, phoneNumber } from "./common";

export const customerSchema = z.object({
  name: z.string().trim().min(2, "Customer name is required").max(80),
  phone: phoneNumber,
  email: emailAddress,
  address: z.string().trim().max(200, "Keep this under 200 characters"),
  notes: z.string().trim().max(500, "Keep this under 500 characters"),
});
