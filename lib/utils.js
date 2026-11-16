import { clsx } from "clsx";
import { format, parseISO } from "date-fns";
import { twMerge } from "tailwind-merge";

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

export function createId() {
  return crypto.randomUUID();
}

export function nowISO() {
  return new Date().toISOString();
}

/** Today's date in the browser's time zone, as yyyy-MM-dd. */
export function todayISO() {
  return format(new Date(), "yyyy-MM-dd");
}

export function formatCurrency(amount, currency = "INR") {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(Number.isFinite(amount) ? amount : 0);
}

export function formatNumber(value, digits = 1) {
  return new Intl.NumberFormat("en-IN", { maximumFractionDigits: digits }).format(value);
}

export function formatDate(isoDate, pattern = "EEE, d MMM yyyy") {
  try {
    return format(parseISO(isoDate), pattern);
  } catch {
    return isoDate;
  }
}

/** "14:30" -> "2:30 PM" */
export function formatTime(time) {
  const [h, m] = time.split(":").map(Number);
  if (Number.isNaN(h) || Number.isNaN(m)) return time;
  const period = h >= 12 ? "PM" : "AM";
  const hour = h % 12 === 0 ? 12 : h % 12;
  return `${hour}:${String(m).padStart(2, "0")} ${period}`;
}

export function formatTimeRange(start, end) {
  return `${formatTime(start)} to ${formatTime(end)}`;
}

/** Compares phone numbers ignoring spaces, dashes and the +91 prefix. */
export function normalizePhone(phone) {
  const digits = phone.replace(/\D/g, "");
  return digits.length > 10 ? digits.slice(-10) : digits;
}

export function isUuid(value) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);
}

export function errorMessage(error, fallback = "Something went wrong. Try again.") {
  return error instanceof Error && error.message ? error.message : fallback;
}
