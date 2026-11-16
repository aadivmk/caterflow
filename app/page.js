import {
  BookOpenText,
  CalendarCheck,
  Calculator,
  IndianRupee,
  ShieldAlert,
  Users,
} from "lucide-react";
import Link from "next/link";
import { MiniCalculator } from "@/components/landing/mini-calculator";
import { Logo } from "@/components/layout/logo";
import { DietBadge, StatusBadge } from "@/components/shared/badges";
import { Button } from "@/components/ui/button";
import { STATUS_STYLES } from "@/lib/constants";
import { isMongoConfigured } from "@/lib/mongodb/config";
import { cn, formatCurrency } from "@/lib/utils";

/**
 * Landing page. A Server Component: everything here is static and prerendered,
 * except <MiniCalculator />, the one interactive island.
 */

const FEATURES = [
  {
    icon: Calculator,
    title: "Guest calculator",
    text: "Turn a guest count into servings, rice, meat, vegetables, water, staff and a food budget. You set the assumptions.",
  },
  {
    icon: BookOpenText,
    title: "Menu builder",
    text: "Keep your food items in one list, group them into packages and see the price per guest update as you pick.",
  },
  {
    icon: CalendarCheck,
    title: "Booking calendar",
    text: "See every event by month, week or day. Each status has its own colour, so a busy week reads at a glance.",
  },
  {
    icon: ShieldAlert,
    title: "Double-booking warnings",
    text: "CaterFlow checks date, time, venue, team availability and kitchen capacity before a booking is saved.",
  },
  {
    icon: IndianRupee,
    title: "Pricing and payments",
    text: "Totals are worked out from guests and menu price. Record advances and watch the balance come down.",
  },
  {
    icon: Users,
    title: "Customer history",
    text: "Customers are created from bookings automatically, with their events and total spend in one place.",
  },
];

const RUN_SHEET = [
  {
    day: "Sat",
    date: "14",
    name: "Priya and Karan Reception",
    meta: "500 guests, Mumbai",
    status: "Confirmed",
  },
  {
    day: "Sun",
    date: "15",
    name: "Infosys Product Launch Lunch",
    meta: "120 guests, Hyderabad",
    status: "In Progress",
  },
  {
    day: "Tue",
    date: "17",
    name: "Kunal's Housewarming",
    meta: "50 guests, Ahmedabad",
    status: "Confirmed",
  },
  {
    day: "Sat",
    date: "21",
    name: "Lakshmi and Ashok Engagement",
    meta: "200 guests, Jaipur",
    status: "Pending",
  },
];

const MENU_PREVIEW = [
  { category: "Welcome Drinks", items: [["Masala Chaas", "Veg", 25]] },
  { category: "Starters", items: [["Chicken Tikka", "Non-Veg", 95]] },
  {
    category: "Main Course",
    items: [
      ["Butter Chicken", "Non-Veg", 130],
      ["Paneer Butter Masala", "Veg", 95],
    ],
  },
  {
    category: "Rice and Biryani",
    items: [
      ["Hyderabadi Dum Biryani", "Non-Veg", 170],
      ["Veg Pulao", "Veg", 65],
    ],
  },
  { category: "Breads", items: [["Butter Naan", "Veg", 30]] },
  { category: "Desserts", items: [["Gulab Jamun", "Veg", 40]] },
];

const MENU_PRICE = MENU_PREVIEW.flatMap((c) => c.items).reduce((sum, item) => sum + item[2], 0);
const MENU_GUESTS = 300;

const CALENDAR_EVENTS = {
  3: [["Baby Shower, 60", "Completed"]],
  7: [["Wedding, 450", "Completed"]],
  12: [["Nikah, 250", "Cancelled"]],
  14: [["Reception, 500", "Confirmed"]],
  15: [["Launch lunch, 120", "In Progress"]],
  17: [["Housewarming, 50", "Confirmed"]],
  21: [["Engagement, 200", "Pending"]],
  27: [["Birthday, 80", "Pending"]],
  29: [["Wedding, 400", "Confirmed"]],
};

export default function LandingPage() {
  const startHref = isMongoConfigured ? "/login" : "/dashboard";

  return (
    <div className="flex flex-1 flex-col">
      <header className="mx-auto flex w-full max-w-6xl items-center justify-between px-5 py-5 sm:px-8">
        <Logo />
        <nav
          aria-label="Sections"
          className="hidden items-center gap-7 text-sm font-medium text-muted-foreground md:flex"
        >
          <a href="#features" className="hover:text-foreground">
            Features
          </a>
          <a href="#calculator" className="hover:text-foreground">
            Calculator
          </a>
          <a href="#menus" className="hover:text-foreground">
            Menus
          </a>
          <a href="#calendar" className="hover:text-foreground">
            Calendar
          </a>
        </nav>
        <Button asChild variant="outline">
          <Link href={startHref}>Open dashboard</Link>
        </Button>
      </header>

      <main className="flex-1">
        {/* Hero */}
        <section className="mx-auto grid w-full max-w-6xl items-center gap-12 px-5 pb-20 pt-10 sm:px-8 lg:grid-cols-[1.05fr_0.95fr] lg:pb-28 lg:pt-16">
          <div>
            <h1 className="text-[2.5rem] font-semibold leading-[1.04] sm:text-6xl lg:text-[3.5rem] xl:text-6xl">
              <span className="sm:whitespace-nowrap">Manage Every Event.</span>
              <br />
              <span className="sm:whitespace-nowrap">Serve Every Guest.</span>
            </h1>
            <p className="mt-6 max-w-xl text-lg leading-relaxed text-muted-foreground">
              CaterFlow is the back office for a catering business. Work out how much to cook, price
              a menu per guest and keep every booking on one calendar, from the first enquiry to the
              final payment.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Button asChild size="lg">
                <Link href={startHref}>Get Started</Link>
              </Button>
              <Button asChild size="lg" variant="outline">
                <a href="#calculator">Try the calculator</a>
              </Button>
            </div>
          </div>

          {/* The week's run sheet: what a caterer actually looks at each morning. */}
          <div>
            <div className="rounded-xl border bg-card shadow-card">
              <div className="flex items-center justify-between border-b px-5 py-4">
                <p className="font-display text-lg font-semibold">This week&apos;s run sheet</p>
                <p className="tabular text-sm text-muted-foreground">4 events, 870 guests</p>
              </div>
              <ul className="divide-y">
                {RUN_SHEET.map((event) => (
                  <li key={event.name} className="flex items-center gap-4 px-5 py-3.5">
                    <div className="w-11 shrink-0 rounded-md bg-muted py-1 text-center">
                      <p className="text-[11px] font-medium text-muted-foreground">{event.day}</p>
                      <p className="tabular font-display text-lg font-semibold leading-tight">
                        {event.date}
                      </p>
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold">{event.name}</p>
                      <p className="truncate text-sm text-muted-foreground">{event.meta}</p>
                    </div>
                    <StatusBadge status={event.status} className="hidden sm:inline-flex" />
                  </li>
                ))}
              </ul>
            </div>
            <div className="ml-auto mt-4 flex w-fit items-baseline gap-4 rounded-lg border bg-card px-5 py-3 shadow-card">
              <p className="text-sm font-medium text-muted-foreground">Saturday kitchen prep</p>
              <p className="tabular font-display text-xl font-semibold">870 servings</p>
              <p className="tabular text-sm text-muted-foreground">130 kg rice, 42 staff</p>
            </div>
          </div>
        </section>

        {/* Features */}
        <section id="features" className="border-y bg-card">
          <div className="mx-auto w-full max-w-6xl px-5 py-20 sm:px-8">
            <h2 className="max-w-2xl text-3xl font-semibold sm:text-4xl">
              One place for enquiries, menus, quantities and dates
            </h2>
            <div className="mt-12 grid gap-x-12 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
              {FEATURES.map(({ icon: Icon, title, text }) => (
                <div key={title} className="border-t pt-5">
                  <Icon className="size-5 text-primary" />
                  <h3 className="mt-3 text-lg font-semibold">{title}</h3>
                  <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{text}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Guest calculator preview */}
        <section
          id="calculator"
          className="mx-auto grid w-full max-w-6xl items-start gap-10 px-5 py-20 sm:px-8 lg:grid-cols-[0.8fr_1.2fr]"
        >
          <div>
            <h2 className="text-3xl font-semibold sm:text-4xl">How much food for 100 guests?</h2>
            <p className="mt-4 leading-relaxed text-muted-foreground">
              Move the slider. The calculator adds a buffer, scales quantities for the meal and
              sizes the service team for the style of service. This preview runs the same
              calculation as the dashboard.
            </p>
            <p className="mt-4 leading-relaxed text-muted-foreground">
              The numbers are planning estimates built on assumptions you can change, such as grams
              of rice per serving or guests per staff member.
            </p>
          </div>
          <MiniCalculator />
        </section>

        {/* Menu management preview */}
        <section id="menus" className="border-y bg-card">
          <div className="mx-auto grid w-full max-w-6xl items-start gap-10 px-5 py-20 sm:px-8 lg:grid-cols-[1.2fr_0.8fr]">
            <div className="order-2 rounded-xl border bg-background p-5 sm:p-7 lg:order-1">
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <p className="font-display text-xl font-semibold">Malabar Wedding Feast</p>
                <p className="text-sm text-muted-foreground">8 items</p>
              </div>
              <div className="mt-5 grid gap-x-8 gap-y-5 sm:grid-cols-2">
                {MENU_PREVIEW.map((group) => (
                  <div key={group.category}>
                    <p className="border-b pb-1.5 text-xs font-semibold text-muted-foreground">
                      {group.category}
                    </p>
                    <ul className="mt-2 space-y-2">
                      {group.items.map(([name, diet, price]) => (
                        <li key={name} className="flex items-center justify-between gap-3 text-sm">
                          <span className="flex min-w-0 items-center gap-2">
                            <span className="truncate font-medium">{name}</span>
                            <DietBadge type={diet} />
                          </span>
                          <span className="tabular text-muted-foreground">
                            {formatCurrency(price)}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
              <div className="mt-6 flex flex-wrap items-end justify-between gap-4 border-t pt-4">
                <div>
                  <p className="text-sm text-muted-foreground">Price per guest</p>
                  <p className="tabular font-display text-2xl font-semibold text-primary">
                    {formatCurrency(MENU_PRICE)}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-muted-foreground">For {MENU_GUESTS} guests</p>
                  <p className="tabular font-display text-2xl font-semibold">
                    {formatCurrency(MENU_PRICE * MENU_GUESTS)}
                  </p>
                </div>
              </div>
            </div>
            <div className="order-1 lg:order-2">
              <h2 className="text-3xl font-semibold sm:text-4xl">Menus that price themselves</h2>
              <p className="mt-4 leading-relaxed text-muted-foreground">
                Add each dish once with its price per guest, category and dietary type. Pick dishes
                to build a package, save it and reuse it for the next booking. Duplicate a package
                when a customer wants a small change.
              </p>
            </div>
          </div>
        </section>

        {/* Booking calendar preview */}
        <section
          id="calendar"
          className="mx-auto grid w-full max-w-6xl items-start gap-10 px-5 py-20 sm:px-8 lg:grid-cols-[0.8fr_1.2fr]"
        >
          <div>
            <h2 className="text-3xl font-semibold sm:text-4xl">
              A calendar that knows your capacity
            </h2>
            <p className="mt-4 leading-relaxed text-muted-foreground">
              Every booking sits on the calendar in its status colour. Switch between month, week
              and day, search by customer and filter by status or event type.
            </p>
            <ul className="mt-6 flex flex-wrap gap-2">
              {Object.keys(STATUS_STYLES).map((status) => (
                <li key={status}>
                  <StatusBadge status={status} />
                </li>
              ))}
            </ul>
          </div>
          <div className="overflow-hidden rounded-xl border bg-card shadow-card">
            <div className="flex items-center justify-between border-b px-5 py-3.5">
              <p className="font-display text-lg font-semibold">November</p>
              <p className="text-sm text-muted-foreground">9 events</p>
            </div>
            <div className="grid grid-cols-7 border-b bg-muted/60 text-center text-xs font-semibold text-muted-foreground">
              {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => (
                <div key={d} className="py-2">
                  {d}
                </div>
              ))}
            </div>
            <div className="grid grid-cols-7">
              {Array.from({ length: 35 }, (_, i) => {
                const day = i + 1 <= 30 ? i + 1 : null;
                const events = day ? (CALENDAR_EVENTS[day] ?? []) : [];
                return (
                  <div
                    key={i}
                    className={cn(
                      "min-h-14 border-b border-r p-1 sm:min-h-20 sm:p-1.5 [&:nth-child(7n)]:border-r-0",
                      !day && "bg-muted/40",
                    )}
                  >
                    {day && <p className="tabular text-xs text-muted-foreground">{day}</p>}
                    {events.map(([label, status]) => (
                      <div key={label} className="mt-1">
                        <span
                          className={cn(
                            "hidden truncate rounded border px-1 py-0.5 text-[11px] font-medium sm:block",
                            STATUS_STYLES[status].chip,
                          )}
                        >
                          {label}
                        </span>
                        <span
                          className={cn(
                            "mx-auto block size-2 rounded-full sm:hidden",
                            STATUS_STYLES[status].dot,
                          )}
                        />
                      </div>
                    ))}
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* Closing call to action */}
        <section className="bg-foreground text-background">
          <div className="mx-auto flex w-full max-w-6xl flex-col items-start justify-between gap-6 px-5 py-14 sm:px-8 md:flex-row md:items-center">
            <div>
              <h2 className="text-3xl font-semibold">Start with the sample kitchen</h2>
              <p className="mt-2 max-w-xl text-stone-300">
                The dashboard opens with demo customers, menus and bookings so you can try every
                feature straight away.
              </p>
            </div>
            <Button asChild size="lg">
              <Link href={startHref}>Get Started</Link>
            </Button>
          </div>
        </section>
      </main>

      <footer className="border-t bg-card">
        <div className="mx-auto flex w-full max-w-6xl flex-col gap-4 px-5 py-8 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between sm:px-8">
          <Logo />
          <p>Catering booking and management platform. Built with Next.js for INT257.</p>
          <nav aria-label="Footer" className="flex gap-5">
            <Link href="/dashboard" className="hover:text-foreground">
              Dashboard
            </Link>
            <Link href="/dashboard/bookings" className="hover:text-foreground">
              Bookings
            </Link>
            <Link href="/login" className="hover:text-foreground">
              Sign in
            </Link>
          </nav>
        </div>
      </footer>
    </div>
  );
}
