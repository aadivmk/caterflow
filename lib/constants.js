export const APP_NAME = "CaterFlow";

export const EVENT_TYPES = [
  "Wedding",
  "Birthday",
  "Corporate Event",
  "Engagement",
  "House Party",
  "Other",
];

export const MEAL_TYPES = ["Breakfast", "Lunch", "Dinner", "Snacks", "Full Day Catering"];

export const SERVICE_STYLES = ["Buffet", "Plated", "Traditional", "Live Counters"];

export const BOOKING_STATUSES = ["Pending", "Confirmed", "In Progress", "Completed", "Cancelled"];

export const PAYMENT_STATUSES = ["Unpaid", "Advance Paid", "Paid"];

export const MENU_CATEGORIES = [
  "Welcome Drinks",
  "Starters",
  "Main Course",
  "Rice and Biryani",
  "Breads",
  "Side Dishes",
  "Desserts",
  "Beverages",
];

export const DIETARY_TYPES = ["Veg", "Non-Veg", "Vegan"];

export const CURRENCIES = ["INR", "USD", "GBP", "EUR", "AED"];

/** Statuses that still need the kitchen: used for "upcoming" lists and conflict checks. */
export const ACTIVE_STATUSES = ["Pending", "Confirmed", "In Progress"];

/**
 * One colour per booking status, used by badges, calendar chips and the
 * dashboard status chart so a status always looks the same everywhere.
 */
export const STATUS_STYLES = {
  Pending: {
    dot: "bg-amber-500",
    chip: "bg-amber-50 text-amber-900 border-amber-200",
    hex: "#d97706",
  },
  Confirmed: {
    dot: "bg-emerald-600",
    chip: "bg-emerald-50 text-emerald-900 border-emerald-200",
    hex: "#059669",
  },
  "In Progress": {
    dot: "bg-sky-600",
    chip: "bg-sky-50 text-sky-900 border-sky-200",
    hex: "#0284c7",
  },
  Completed: {
    dot: "bg-stone-500",
    chip: "bg-stone-100 text-stone-800 border-stone-300",
    hex: "#78716c",
  },
  Cancelled: {
    dot: "bg-rose-600",
    chip: "bg-rose-50 text-rose-900 border-rose-200",
    hex: "#e11d48",
  },
};

export const DEMO_NOTICE_COOKIE = "caterflow_demo_notice";
export const LOCAL_STORAGE_KEY = "caterflow:data:v1";
