"use client";

import Link from "next/link";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { DEFAULT_ASSUMPTIONS, calculateRequirements } from "@/lib/calculations/guest-calculator";
import { SERVICE_STYLES } from "@/lib/constants";
import { cn, formatCurrency, formatNumber } from "@/lib/utils";

const BUDGET_PER_GUEST = 250;

/** Live preview of the guest calculator, using the same function as the dashboard. */
export function MiniCalculator() {
  const [guests, setGuests] = useState(100);
  const [style, setStyle] = useState("Buffet");

  const result = calculateRequirements(
    {
      guests,
      eventType: "Wedding",
      mealType: "Lunch",
      serviceStyle: style,
      budgetPerGuest: BUDGET_PER_GUEST,
    },
    DEFAULT_ASSUMPTIONS,
  );

  const rows = [
    ["Servings to prepare", formatNumber(result.servings, 0)],
    ["Rice", `${formatNumber(result.riceKg)} kg`],
    ["Meat", `${formatNumber(result.meatKg)} kg`],
    ["Vegetables", `${formatNumber(result.vegKg)} kg`],
    ["Drinking water", `${formatNumber(result.waterL)} L`],
    ["Service staff", formatNumber(result.staff, 0)],
  ];

  return (
    <div className="rounded-xl border bg-card p-5 shadow-card sm:p-7">
      <div className="flex items-baseline justify-between gap-4">
        <label htmlFor="mini-guests" className="text-sm font-medium">
          Guests
        </label>
        <output
          htmlFor="mini-guests"
          className="tabular font-display text-4xl font-semibold text-primary"
        >
          {guests}
        </output>
      </div>
      <input
        id="mini-guests"
        type="range"
        min={20}
        max={1000}
        step={10}
        value={guests}
        onChange={(e) => setGuests(Number(e.target.value))}
        className="mt-3 w-full accent-emerald-700"
      />

      <fieldset className="mt-5">
        <legend className="mb-2 text-sm font-medium">Service style</legend>
        <div className="grid grid-cols-2 gap-1.5 sm:grid-cols-4">
          {SERVICE_STYLES.map((option) => (
            <button
              key={option}
              type="button"
              aria-pressed={style === option}
              onClick={() => setStyle(option)}
              className={cn(
                "rounded-md border px-2 py-1.5 text-sm font-medium transition-colors outline-none focus-visible:ring-2 focus-visible:ring-ring",
                style === option
                  ? "border-primary bg-accent text-accent-foreground"
                  : "bg-card text-muted-foreground hover:bg-muted",
              )}
            >
              {option}
            </button>
          ))}
        </div>
      </fieldset>

      <dl className="mt-6 divide-y border-y text-sm">
        {rows.map(([label, value]) => (
          <div key={label} className="flex items-center justify-between py-2.5">
            <dt className="text-muted-foreground">{label}</dt>
            <dd className="tabular font-semibold">{value}</dd>
          </div>
        ))}
      </dl>

      <div className="mt-5 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-sm text-muted-foreground">
            Food budget at {formatCurrency(BUDGET_PER_GUEST)} per guest
          </p>
          <p className="tabular font-display text-2xl font-semibold">
            {formatCurrency(result.budget)}
          </p>
        </div>
        <Button asChild variant="outline">
          <Link href="/dashboard/guest-calculator">Open the full calculator</Link>
        </Button>
      </div>
      <p className="mt-4 text-xs text-muted-foreground">
        Estimate for a wedding lunch with a {result.bufferPercent}% buffer. Every assumption can be
        edited in the app.
      </p>
    </div>
  );
}
