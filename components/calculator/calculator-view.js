"use client";

import { formatDistanceToNow, parseISO } from "date-fns";
import {
  Beef,
  Calculator,
  Carrot,
  ChevronDown,
  Droplets,
  IndianRupee,
  RotateCcw,
  Save,
  Scale,
  Trash2,
  Users,
  UtensilsCrossed,
  Wheat,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { useAppData } from "@/components/providers/data-provider";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { DataBoundary } from "@/components/shared/data-boundary";
import { Field } from "@/components/shared/field";
import { EmptyState } from "@/components/shared/states";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input, Select } from "@/components/ui/input";
import { useCurrency } from "@/hooks/use-settings";
import { calculateRequirements } from "@/lib/calculations/guest-calculator";
import { EVENT_TYPES, MEAL_TYPES, SERVICE_STYLES } from "@/lib/constants";
import { cn, errorMessage, formatNumber } from "@/lib/utils";
import { fieldErrorsFrom } from "@/lib/validations/common";
import { assumptionsSchema, calculatorInputSchema } from "@/lib/validations/settings";

const num = (value) => (Number.isNaN(value) ? "" : value);

function CalculatorTool({ data }) {
  const { saveCalculation, deleteCalculation } = useAppData();
  const money = useCurrency();
  const settings = data.settings;

  const defaultInput = {
    guests: 100,
    eventType: "Wedding",
    mealType: "Lunch",
    serviceStyle: "Buffet",
    budgetPerGuest: settings.defaultPricePerGuest,
  };

  const [input, setInput] = useState(defaultInput);
  const [assumptions, setAssumptions] = useState(settings.calculatorAssumptions);
  const [showAssumptions, setShowAssumptions] = useState(false);
  const [name, setName] = useState("");
  const [saving, setSaving] = useState(false);
  const [toDelete, setToDelete] = useState(null);

  const inputCheck = calculatorInputSchema.safeParse(input);
  const assumptionCheck = assumptionsSchema.safeParse(assumptions);
  const inputErrors = inputCheck.success ? {} : fieldErrorsFrom(inputCheck.error);
  const assumptionErrors = assumptionCheck.success ? {} : fieldErrorsFrom(assumptionCheck.error);
  const valid = inputCheck.success && assumptionCheck.success;

  // Derived on every render from the two pieces of state above.
  const result = valid ? calculateRequirements(input, assumptions) : null;

  const set = (key, value) => setInput((prev) => ({ ...prev, [key]: value }));

  const setAssumption = (key, value) => setAssumptions((prev) => ({ ...prev, [key]: value }));

  function reset() {
    setInput(defaultInput);
    setAssumptions(settings.calculatorAssumptions);
    setName("");
    toast.info("Calculator reset to your default assumptions");
  }

  async function save() {
    if (!result) return;
    setSaving(true);
    try {
      await saveCalculation({
        name: name.trim() || `${input.eventType}, ${input.guests} guests`,
        input,
        assumptions,
        result,
      });
      setName("");
      toast.success("Calculation saved");
    } catch (e) {
      toast.error(errorMessage(e));
    } finally {
      setSaving(false);
    }
  }

  function load(calc) {
    setInput(calc.input);
    setAssumptions(calc.assumptions);
    setName(calc.name);
    window.scrollTo({ top: 0, behavior: "smooth" });
    toast.info(`Loaded "${calc.name}"`);
  }

  const tiles = result
    ? [
        {
          label: "Servings",
          value: formatNumber(result.servings, 0),
          unit: `incl. ${result.bufferPercent}% buffer`,
          icon: UtensilsCrossed,
        },
        { label: "Total food", value: formatNumber(result.foodKg), unit: "kg", icon: Scale },
        { label: "Rice", value: formatNumber(result.riceKg), unit: "kg", icon: Wheat },
        { label: "Meat", value: formatNumber(result.meatKg), unit: "kg", icon: Beef },
        { label: "Vegetables", value: formatNumber(result.vegKg), unit: "kg", icon: Carrot },
        { label: "Water", value: formatNumber(result.waterL), unit: "litres", icon: Droplets },
        {
          label: "Service staff",
          value: formatNumber(result.staff, 0),
          unit: "people",
          icon: Users,
        },
        {
          label: "Food budget",
          value: money(result.budget),
          unit: `${money(input.budgetPerGuest)} per guest`,
          icon: IndianRupee,
        },
      ]
    : [];

  const assumptionFields = [
    { key: "bufferPercent", label: "Buffer (%)", step: 1 },
    { key: "foodPerServingG", label: "Total food per serving (g)", step: 10 },
    { key: "ricePerServingG", label: "Rice per serving (g)", step: 10 },
    { key: "meatPerServingG", label: "Meat per serving (g)", step: 10 },
    { key: "vegPerServingG", label: "Vegetables per serving (g)", step: 10 },
    { key: "waterPerServingL", label: "Water per serving (L)", step: 0.05 },
  ];

  return (
    <div className="space-y-6">
      <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)]">
        {/* Inputs */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Event details</CardTitle>
              <CardDescription>Results update as you type.</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4 sm:grid-cols-2">
              <Field label="Number of guests" required error={inputErrors.guests}>
                <Input
                  id="guests"
                  type="number"
                  inputMode="numeric"
                  min={1}
                  value={num(input.guests)}
                  aria-invalid={!!inputErrors.guests}
                  onChange={(e) => set("guests", e.target.valueAsNumber)}
                />
              </Field>
              <Field
                label="Budget per guest"
                required
                error={inputErrors.budgetPerGuest}
                hint={`In ${settings.currency}`}
              >
                <Input
                  id="budget"
                  type="number"
                  inputMode="decimal"
                  min={0}
                  value={num(input.budgetPerGuest)}
                  aria-invalid={!!inputErrors.budgetPerGuest}
                  onChange={(e) => set("budgetPerGuest", e.target.valueAsNumber)}
                />
              </Field>
              <Field label="Event type">
                <Select
                  id="eventType"
                  value={input.eventType}
                  onChange={(e) => set("eventType", e.target.value)}
                >
                  {EVENT_TYPES.map((t) => (
                    <option key={t}>{t}</option>
                  ))}
                </Select>
              </Field>
              <Field label="Meal type">
                <Select
                  id="mealType"
                  value={input.mealType}
                  onChange={(e) => set("mealType", e.target.value)}
                >
                  {MEAL_TYPES.map((t) => (
                    <option key={t}>{t}</option>
                  ))}
                </Select>
              </Field>
              <Field label="Service style" className="sm:col-span-2">
                <Select
                  id="serviceStyle"
                  value={input.serviceStyle}
                  onChange={(e) => set("serviceStyle", e.target.value)}
                >
                  {SERVICE_STYLES.map((t) => (
                    <option key={t}>{t}</option>
                  ))}
                </Select>
              </Field>
            </CardContent>
          </Card>

          <Card>
            <button
              type="button"
              className="flex w-full items-center justify-between gap-3 rounded-lg p-5 text-left outline-none focus-visible:ring-2 focus-visible:ring-ring"
              aria-expanded={showAssumptions}
              onClick={() => setShowAssumptions((open) => !open)}
            >
              <span>
                <span className="block font-display font-semibold">Assumptions</span>
                <span className="block text-sm text-muted-foreground">
                  Estimates, not catering standards. Change any of them for this calculation.
                </span>
              </span>
              <ChevronDown
                className={cn(
                  "size-5 shrink-0 transition-transform",
                  showAssumptions && "rotate-180",
                )}
              />
            </button>
            {showAssumptions && (
              <CardContent className="grid gap-4 border-t pt-5 sm:grid-cols-2">
                {assumptionFields.map(({ key, label, step }) => (
                  <Field key={key} label={label} error={assumptionErrors[key]}>
                    <Input
                      id={key}
                      type="number"
                      inputMode="decimal"
                      min={0}
                      step={step}
                      value={num(assumptions[key])}
                      aria-invalid={!!assumptionErrors[key]}
                      onChange={(e) => setAssumption(key, e.target.valueAsNumber)}
                    />
                  </Field>
                ))}
                <Field
                  label={`Quantity multiplier for ${input.mealType}`}
                  error={assumptionErrors[`mealMultipliers.${input.mealType}`]}
                  hint="1 means a full meal"
                >
                  <Input
                    id="mealMultiplier"
                    type="number"
                    inputMode="decimal"
                    min={0}
                    step={0.1}
                    value={num(assumptions.mealMultipliers[input.mealType])}
                    onChange={(e) =>
                      setAssumptions((prev) => ({
                        ...prev,
                        mealMultipliers: {
                          ...prev.mealMultipliers,
                          [input.mealType]: e.target.valueAsNumber,
                        },
                      }))
                    }
                  />
                </Field>
                <Field
                  label={`Guests per staff for ${input.serviceStyle}`}
                  error={assumptionErrors[`guestsPerStaff.${input.serviceStyle}`]}
                  hint="Staff-to-guest ratio"
                >
                  <Input
                    id="guestsPerStaff"
                    type="number"
                    inputMode="numeric"
                    min={1}
                    value={num(assumptions.guestsPerStaff[input.serviceStyle])}
                    onChange={(e) =>
                      setAssumptions((prev) => ({
                        ...prev,
                        guestsPerStaff: {
                          ...prev.guestsPerStaff,
                          [input.serviceStyle]: e.target.valueAsNumber,
                        },
                      }))
                    }
                  />
                </Field>
                <Field
                  label={`Extra buffer for ${input.eventType} (%)`}
                  className="sm:col-span-2"
                  error={assumptionErrors[`eventBufferPercent.${input.eventType}`]}
                  hint="Added on top of the base buffer"
                >
                  <Input
                    id="eventBuffer"
                    type="number"
                    inputMode="numeric"
                    min={0}
                    value={num(assumptions.eventBufferPercent[input.eventType])}
                    onChange={(e) =>
                      setAssumptions((prev) => ({
                        ...prev,
                        eventBufferPercent: {
                          ...prev.eventBufferPercent,
                          [input.eventType]: e.target.valueAsNumber,
                        },
                      }))
                    }
                  />
                </Field>
                <p className="text-xs text-muted-foreground sm:col-span-2">
                  Your business defaults are set in Settings. Changes here apply to this calculation
                  only and are stored with it when you save.
                </p>
              </CardContent>
            )}
          </Card>
        </div>

        {/* Results */}
        <Card>
          <CardHeader>
            <CardTitle>Estimated requirements</CardTitle>
            <CardDescription>
              {input.eventType}, {input.mealType.toLowerCase()}, {input.serviceStyle.toLowerCase()}{" "}
              service
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {!result ? (
              <EmptyState
                icon={Calculator}
                title="Fix the highlighted fields"
                description="The calculator needs a valid guest count, budget and assumptions to work out quantities."
              />
            ) : (
              <>
                <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
                  {tiles.map(({ label, value, unit, icon: Icon }) => (
                    <div key={label} className="rounded-md border bg-background/60 p-3.5">
                      <p className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
                        <Icon className="size-3.5" /> {label}
                      </p>
                      <p className="tabular mt-1 font-display text-2xl font-semibold">{value}</p>
                      <p className="text-xs text-muted-foreground">{unit}</p>
                    </div>
                  ))}
                </div>

                <div>
                  <h3 className="mb-2 text-sm font-semibold">How this was calculated</h3>
                  <div className="overflow-x-auto rounded-md border">
                    <table className="w-full text-sm">
                      <tbody className="divide-y">
                        {result.breakdown.map((line) => (
                          <tr key={line.label}>
                            <th
                              scope="row"
                              className="whitespace-nowrap px-3 py-2 text-left font-medium"
                            >
                              {line.label}
                            </th>
                            <td className="px-3 py-2 text-muted-foreground">{line.formula}</td>
                            <td className="tabular whitespace-nowrap px-3 py-2 text-right font-semibold">
                              {line.label === "Food budget" ? money(result.budget) : line.value}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </>
            )}

            <div className="flex flex-col gap-3 border-t pt-5 sm:flex-row sm:items-end">
              <Field label="Name this calculation" className="flex-1" hint="Optional">
                <Input
                  id="calcName"
                  value={name}
                  maxLength={80}
                  placeholder={`${input.eventType}, ${num(input.guests) || 0} guests`}
                  onChange={(e) => setName(e.target.value)}
                />
              </Field>
              <div className="flex gap-2 sm:pb-[22px]">
                <Button type="button" variant="outline" onClick={reset}>
                  <RotateCcw /> Reset
                </Button>
                <Button type="button" onClick={save} disabled={!result || saving}>
                  <Save /> {saving ? "Saving" : "Save Calculation"}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Saved calculations */}
      <Card>
        <CardHeader>
          <CardTitle>Saved calculations</CardTitle>
          <CardDescription>Load one to reuse its inputs and assumptions.</CardDescription>
        </CardHeader>
        <CardContent>
          {data.calculations.length === 0 ? (
            <EmptyState
              icon={Save}
              title="No saved calculations yet"
              description="Save a calculation to keep its quantities for an enquiry or a booking."
            />
          ) : (
            <ul className="divide-y">
              {data.calculations.map((calc) => (
                <li
                  key={calc.id}
                  className="flex flex-col gap-3 py-3 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="min-w-0">
                    <p className="truncate font-medium">{calc.name}</p>
                    <p className="tabular text-sm text-muted-foreground">
                      {calc.input.guests} guests, {calc.input.mealType}, {calc.input.serviceStyle}.{" "}
                      {calc.result.servings} servings, {calc.result.riceKg} kg rice,{" "}
                      {calc.result.staff} staff, {money(calc.result.budget)}. Saved{" "}
                      {formatDistanceToNow(parseISO(calc.createdAt), { addSuffix: true })}.
                    </p>
                  </div>
                  <div className="flex shrink-0 gap-2">
                    <Button variant="outline" size="sm" onClick={() => load(calc)}>
                      Load
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-destructive hover:bg-rose-50"
                      onClick={() => setToDelete(calc)}
                    >
                      <Trash2 /> Delete
                    </Button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>

      <ConfirmDialog
        open={!!toDelete}
        onOpenChange={(open) => !open && setToDelete(null)}
        title="Delete this calculation?"
        description={`"${toDelete?.name ?? ""}" will be removed from your saved calculations.`}
        confirmLabel="Delete calculation"
        cancelLabel="Keep it"
        onConfirm={() => {
          if (!toDelete) return;
          deleteCalculation(toDelete.id)
            .then(() => toast.success("Calculation deleted"))
            .catch((e) => toast.error(errorMessage(e)));
          setToDelete(null);
        }}
      />
    </div>
  );
}

export function CalculatorView() {
  return <DataBoundary>{(data) => <CalculatorTool data={data} />}</DataBoundary>;
}
