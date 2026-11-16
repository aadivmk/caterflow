"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { RotateCcw, Save } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { DataBoundary } from "@/components/shared/data-boundary";
import { Field } from "@/components/shared/field";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input, Select, Textarea } from "@/components/ui/input";
import { useSettings } from "@/hooks/use-settings";
import { DEFAULT_ASSUMPTIONS } from "@/lib/calculations/guest-calculator";
import { CURRENCIES, EVENT_TYPES, MEAL_TYPES, SERVICE_STYLES } from "@/lib/constants";
import { errorMessage } from "@/lib/utils";
import { settingsSchema } from "@/lib/validations/settings";

function SettingsEditor({ data }) {
  const { saveSettings, resetDemoData, mode } = useSettings();
  const [confirmReset, setConfirmReset] = useState(false);
  const [resetting, setResetting] = useState(false);
  const counts = {
    customers: data.customers.filter((c) => c.isDemo).length,
    bookings: data.bookings.filter((b) => b.isDemo).length,
    items: data.menuItems.filter((i) => i.isDemo).length,
    menus: data.menus.filter((m) => m.isDemo).length,
  };

  const { register, handleSubmit, reset, setValue, getFieldState, formState } = useForm({
    resolver: zodResolver(settingsSchema),
    defaultValues: data.settings,
  });
  const { isSubmitting, isDirty } = formState;

  const error = (path) => getFieldState(path, formState).error?.message;

  /** A number input registered at any (possibly nested) path. */
  const numberField = (path, label, step = 1, hint) => (
    <Field key={path} label={label} error={error(path)} hint={hint}>
      <Input
        id={path}
        type="number"
        inputMode="decimal"
        min={0}
        step={step}
        aria-invalid={!!error(path)}
        {...register(path, { valueAsNumber: true })}
      />
    </Field>
  );

  async function onSubmit(values) {
    try {
      await saveSettings(values);
      reset(values);
      toast.success("Settings saved");
    } catch (e) {
      toast.error(errorMessage(e));
    }
  }

  async function runReset() {
    setConfirmReset(false);
    setResetting(true);
    try {
      await resetDemoData();
      toast.success("Demo data restored");
    } catch (e) {
      toast.error(errorMessage(e));
    } finally {
      setResetting(false);
    }
  }

  return (
    <div className="space-y-6">
      <form
        onSubmit={handleSubmit(onSubmit, () => toast.error("Check the highlighted fields."))}
        noValidate
        className="space-y-6"
      >
        <Card>
          <CardHeader>
            <CardTitle>Business information</CardTitle>
            <CardDescription>
              Shown in the top bar and used as your contact details.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-2">
            <Field label="Business name" required error={error("businessName")}>
              <Input
                id="businessName"
                aria-invalid={!!error("businessName")}
                {...register("businessName")}
              />
            </Field>
            <Field label="Owner or manager" error={error("ownerName")}>
              <Input id="ownerName" {...register("ownerName")} />
            </Field>
            <Field label="Phone number" required error={error("phone")}>
              <Input id="phone" type="tel" aria-invalid={!!error("phone")} {...register("phone")} />
            </Field>
            <Field label="Email address" required error={error("email")}>
              <Input
                id="email"
                type="email"
                aria-invalid={!!error("email")}
                {...register("email")}
              />
            </Field>
            <Field label="Address" error={error("address")} className="sm:col-span-2">
              <Textarea id="address" rows={2} {...register("address")} />
            </Field>
            <Field label="GST number" error={error("gstNumber")} hint="Optional">
              <Input id="gstNumber" {...register("gstNumber")} />
            </Field>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Pricing and capacity</CardTitle>
            <CardDescription>
              Teams and daily capacity are the resources checked for double bookings.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Field label="Default currency" required error={error("currency")}>
              <Select id="currency" {...register("currency")}>
                {CURRENCIES.map((c) => (
                  <option key={c}>{c}</option>
                ))}
              </Select>
            </Field>
            {numberField(
              "defaultPricePerGuest",
              "Default price per guest",
              1,
              "Used for new bookings and the calculator",
            )}
            {numberField(
              "cateringTeams",
              "Catering teams",
              1,
              "Events you can serve at the same time",
            )}
            {numberField(
              "dailyGuestCapacity",
              "Daily guest capacity",
              1,
              "Most guests the kitchen can cook for in a day",
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="sm:flex-row sm:items-start sm:justify-between">
            <div>
              <CardTitle>Guest calculator assumptions</CardTitle>
              <CardDescription className="mt-1 max-w-2xl">
                These are your own planning estimates, not universal catering standards. Adjust them
                to match your kitchen. The calculator starts from these values.
              </CardDescription>
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => {
                setValue("calculatorAssumptions", DEFAULT_ASSUMPTIONS, {
                  shouldDirty: true,
                  shouldValidate: true,
                });
                toast.info("Starting values filled in. Save settings to keep them.");
              }}
            >
              <RotateCcw /> Use starting values
            </Button>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {numberField(
                "calculatorAssumptions.bufferPercent",
                "Buffer (%)",
                1,
                "Extra servings on top of the guest count",
              )}
              {numberField(
                "calculatorAssumptions.foodPerServingG",
                "Total food per serving (g)",
                10,
              )}
              {numberField("calculatorAssumptions.ricePerServingG", "Rice per serving (g)", 10)}
              {numberField("calculatorAssumptions.meatPerServingG", "Meat per serving (g)", 10)}
              {numberField(
                "calculatorAssumptions.vegPerServingG",
                "Vegetables per serving (g)",
                10,
              )}
              {numberField("calculatorAssumptions.waterPerServingL", "Water per serving (L)", 0.05)}
            </div>

            <fieldset>
              <legend className="text-sm font-semibold">Staff-to-guest ratio</legend>
              <p className="mb-3 text-sm text-muted-foreground">
                Guests one member of service staff looks after, for each service style.
              </p>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {SERVICE_STYLES.map((style) =>
                  numberField(`calculatorAssumptions.guestsPerStaff.${style}`, style),
                )}
              </div>
            </fieldset>

            <fieldset>
              <legend className="text-sm font-semibold">Meal quantity multipliers</legend>
              <p className="mb-3 text-sm text-muted-foreground">
                1 is a full meal. Lower for lighter meals, higher for full day catering.
              </p>
              <div className="grid gap-4 sm:grid-cols-3 lg:grid-cols-5">
                {MEAL_TYPES.map((meal) =>
                  numberField(`calculatorAssumptions.mealMultipliers.${meal}`, meal, 0.1),
                )}
              </div>
            </fieldset>

            <fieldset>
              <legend className="text-sm font-semibold">Extra buffer by event type (%)</legend>
              <p className="mb-3 text-sm text-muted-foreground">
                Added to the base buffer when guest numbers tend to run over.
              </p>
              <div className="grid gap-4 sm:grid-cols-3 lg:grid-cols-6">
                {EVENT_TYPES.map((type) =>
                  numberField(`calculatorAssumptions.eventBufferPercent.${type}`, type),
                )}
              </div>
            </fieldset>
          </CardContent>
        </Card>

        <div className="sticky bottom-0 -mx-4 flex items-center justify-end gap-3 border-t bg-background/95 px-4 py-3 backdrop-blur sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8">
          {isDirty && <p className="text-sm text-muted-foreground">You have unsaved changes.</p>}
          <Button type="button" variant="outline" disabled={!isDirty} onClick={() => reset()}>
            Discard
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            <Save /> {isSubmitting ? "Saving" : "Save settings"}
          </Button>
        </div>
      </form>

      <Card>
        <CardHeader>
          <CardTitle>Demo data</CardTitle>
          <CardDescription>
            Sample records are tagged Demo across the app. Right now there are {counts.customers}{" "}
            demo customers, {counts.bookings} demo bookings, {counts.items} demo food items and{" "}
            {counts.menus} demo packages.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="max-w-xl text-sm text-muted-foreground">
            Resetting deletes everything stored in{" "}
            {mode === "local" ? "this browser" : "your MongoDB database"}, including records you
            added and these settings, then restores the original demo dataset.
          </p>
          <Button
            type="button"
            variant="destructive"
            disabled={resetting}
            onClick={() => setConfirmReset(true)}
          >
            <RotateCcw /> {resetting ? "Resetting" : "Reset demo data"}
          </Button>
        </CardContent>
      </Card>

      <ConfirmDialog
        open={confirmReset}
        onOpenChange={setConfirmReset}
        title="Reset all data?"
        description="Every booking, customer, menu, saved calculation and setting will be replaced with the demo dataset. This cannot be undone."
        confirmLabel="Reset demo data"
        cancelLabel="Keep my data"
        onConfirm={() => void runReset()}
      />
    </div>
  );
}

export function SettingsForm() {
  // The key rebuilds the form after a reset so it shows the restored values.
  return (
    <DataBoundary>
      {(data) => <SettingsEditor key={data.settings.updatedAt} data={data} />}
    </DataBoundary>
  );
}
