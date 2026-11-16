/**
 * Starting assumptions for the guest calculator.
 *
 * These are planning estimates, not catering standards. Every value can be
 * changed in Settings (saved as the business default) or adjusted for a single
 * calculation on the calculator page.
 */
export const DEFAULT_ASSUMPTIONS = {
  bufferPercent: 10,
  foodPerServingG: 550,
  ricePerServingG: 150,
  meatPerServingG: 180,
  vegPerServingG: 150,
  waterPerServingL: 0.75,
  mealMultipliers: {
    Breakfast: 0.6,
    Lunch: 1,
    Dinner: 1,
    Snacks: 0.4,
    "Full Day Catering": 2.2,
  },
  guestsPerStaff: {
    Buffet: 25,
    Plated: 12,
    Traditional: 15,
    "Live Counters": 20,
  },
  eventBufferPercent: {
    Wedding: 0,
    Birthday: 0,
    "Corporate Event": 0,
    Engagement: 0,
    "House Party": 0,
    Other: 0,
  },
};

const round1 = (n) => Math.round(n * 10) / 10;

/** Pure function: same input and assumptions always give the same result. */
export function calculateRequirements(input, a) {
  const guests = Math.max(0, Math.floor(input.guests || 0));
  const eventBuffer = a.eventBufferPercent[input.eventType] ?? 0;
  const bufferPercent = a.bufferPercent + eventBuffer;
  // Rounded first so floating point noise (100 x 1.1 = 110.00000000000001) cannot add a serving.
  const servings = Math.ceil(Number(((guests * (100 + bufferPercent)) / 100).toFixed(6)));
  const meal = a.mealMultipliers[input.mealType] ?? 1;
  const perStaff = Math.max(1, a.guestsPerStaff[input.serviceStyle] ?? 20);

  const foodKg = round1((servings * a.foodPerServingG * meal) / 1000);
  const riceKg = round1((servings * a.ricePerServingG * meal) / 1000);
  const meatKg = round1((servings * a.meatPerServingG * meal) / 1000);
  const vegKg = round1((servings * a.vegPerServingG * meal) / 1000);
  const waterL = round1(servings * a.waterPerServingL * meal);
  const staff = guests === 0 ? 0 : Math.ceil(guests / perStaff);
  const budget = guests * Math.max(0, input.budgetPerGuest || 0);

  const qty = (grams, unit = "g") =>
    `${servings} servings x ${grams}${unit} x ${meal} (${input.mealType})`;

  return {
    servings,
    bufferPercent,
    foodKg,
    riceKg,
    meatKg,
    vegKg,
    waterL,
    staff,
    budget,
    breakdown: [
      {
        label: "Servings",
        formula: `${guests} guests + ${bufferPercent}% buffer (${a.bufferPercent}% base + ${eventBuffer}% for ${input.eventType})`,
        value: `${servings}`,
      },
      { label: "Total food", formula: qty(a.foodPerServingG), value: `${foodKg} kg` },
      { label: "Rice", formula: qty(a.ricePerServingG), value: `${riceKg} kg` },
      { label: "Meat", formula: qty(a.meatPerServingG), value: `${meatKg} kg` },
      { label: "Vegetables", formula: qty(a.vegPerServingG), value: `${vegKg} kg` },
      { label: "Water", formula: qty(a.waterPerServingL, " L"), value: `${waterL} L` },
      {
        label: "Service staff",
        formula: `${guests} guests / ${perStaff} guests per staff (${input.serviceStyle}), rounded up`,
        value: `${staff}`,
      },
      {
        label: "Food budget",
        formula: `${guests} guests x ${input.budgetPerGuest || 0} per guest`,
        value: `${budget}`,
      },
    ],
  };
}
