"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Save, TriangleAlert } from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState, useTransition } from "react";
import { useForm, useWatch } from "react-hook-form";
import { toast } from "sonner";
import { useAppData } from "@/components/providers/data-provider";
import { PaymentBadge } from "@/components/shared/badges";
import { Field } from "@/components/shared/field";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input, Select, Textarea } from "@/components/ui/input";
import { useBookings } from "@/hooks/use-bookings";
import { useMenus } from "@/hooks/use-menus";
import { useCurrency } from "@/hooks/use-settings";
import { prepareBookingAction } from "@/lib/actions/booking-actions";
import { findConflicts } from "@/lib/calculations/conflicts";
import { computePricing } from "@/lib/calculations/pricing";
import { BOOKING_STATUSES, EVENT_TYPES, SERVICE_STYLES } from "@/lib/constants";
import { errorMessage, todayISO } from "@/lib/utils";
import { bookingFormSchema } from "@/lib/validations/booking";

const n = (value) => (Number.isFinite(value) ? value : 0);

export function BookingForm({ data, booking }) {
  const router = useRouter();
  const params = useSearchParams();
  const { saveBooking } = useAppData();
  const { bookings } = useBookings();
  const { menus } = useMenus();
  const money = useCurrency();
  const [pending, startTransition] = useTransition();
  const [acknowledged, setAcknowledged] = useState(false);

  const requestedDate = params.get("date") ?? "";
  const defaults = booking
    ? {
        customerName: booking.customer?.name ?? "",
        customerPhone: booking.customer?.phone ?? "",
        customerEmail: booking.customer?.email ?? "",
        eventName: booking.eventName,
        eventType: booking.eventType,
        eventDate: booking.eventDate,
        startTime: booking.startTime,
        endTime: booking.endTime,
        location: booking.location,
        guestCount: booking.guestCount,
        menuId: booking.menuId ?? "",
        serviceType: booking.serviceType,
        dietaryRequirements: booking.dietaryRequirements,
        instructions: booking.instructions,
        pricePerPerson: booking.pricePerPerson,
        additionalCharges: booking.additionalCharges,
        discount: booking.discount,
        advanceAmount: booking.advanceAmount,
        status: booking.status,
      }
    : {
        customerName: "",
        customerPhone: "",
        customerEmail: "",
        eventName: "",
        eventType: "Wedding",
        eventDate: /^\d{4}-\d{2}-\d{2}$/.test(requestedDate) ? requestedDate : "",
        startTime: "12:00",
        endTime: "15:00",
        location: "",
        guestCount: 100,
        menuId: "",
        serviceType: "Buffet",
        dietaryRequirements: "",
        instructions: "",
        pricePerPerson: data.settings.defaultPricePerGuest,
        additionalCharges: 0,
        discount: 0,
        advanceAmount: 0,
        status: "Pending",
      };

  const {
    register,
    handleSubmit,
    setValue,
    setError,
    reset,
    control,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(bookingFormSchema),
    defaultValues: defaults,
    mode: "onTouched",
  });

  const watched = useWatch({ control });

  // Live pricing: Total = guests x price per person + charges - discount.
  const pricing = computePricing({
    guestCount: n(watched.guestCount ?? 0),
    pricePerPerson: n(watched.pricePerPerson ?? 0),
    additionalCharges: n(watched.additionalCharges ?? 0),
    discount: n(watched.discount ?? 0),
    advanceAmount: n(watched.advanceAmount ?? 0),
  });

  // Live double-booking check against date, time, venue, teams and capacity.
  const conflicts =
    watched.status === "Cancelled"
      ? { overlapping: [], warnings: [] }
      : findConflicts(
          {
            id: booking?.id,
            eventDate: watched.eventDate ?? "",
            startTime: watched.startTime ?? "",
            endTime: watched.endTime ?? "",
            location: watched.location ?? "",
            guestCount: n(watched.guestCount ?? 0),
          },
          bookings,
          data.settings,
        );
  const hasWarnings = conflicts.warnings.length > 0;

  function onCustomerPicked(id) {
    const customer = data.customers.find((c) => c.id === id);
    if (!customer) return;
    setValue("customerName", customer.name, { shouldValidate: true });
    setValue("customerPhone", customer.phone, { shouldValidate: true });
    setValue("customerEmail", customer.email, { shouldValidate: true });
  }

  function onMenuPicked(id) {
    const menu = menus.find((m) => m.id === id);
    setValue("pricePerPerson", menu ? menu.pricePerPerson : data.settings.defaultPricePerGuest, {
      shouldValidate: true,
    });
  }

  function onSubmit(values, event) {
    if (!booking && values.eventDate < todayISO()) {
      setError("eventDate", { message: "Event date cannot be in the past" }, { shouldFocus: true });
      return;
    }
    if (hasWarnings && !acknowledged) {
      toast.error("Review the double-booking warning before saving.");
      event?.target
        ?.querySelector("[data-conflict-warning]")
        ?.scrollIntoView({ behavior: "smooth", block: "center" });
      return;
    }

    startTransition(async () => {
      // 1. Server Action validates again and computes the money figures.
      const result = await prepareBookingAction(values, booking ? "edit" : "create");
      if (!result.ok) {
        for (const [field, message] of Object.entries(result.fieldErrors ?? {})) {
          setError(field, { message });
        }
        toast.error(result.message);
        return;
      }
      // 2. Persist through the Repository (localStorage or MongoDB).
      try {
        const saved = await saveBooking(result.data, booking);
        toast.success(booking ? "Booking updated" : "Booking saved");
        reset();
        router.push(`/dashboard/bookings/${saved.id}`);
      } catch (e) {
        toast.error(errorMessage(e, "The booking could not be saved."));
      }
    });
  }

  const err = (name) => errors[name]?.message;
  const invalid = (name) => ({ "aria-invalid": !!errors[name] });

  return (
    <form
      onSubmit={handleSubmit(onSubmit, () => toast.error("Check the highlighted fields."))}
      noValidate
      className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_21rem]"
    >
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Customer information</CardTitle>
            <CardDescription>
              A customer with the same phone number is reused. Otherwise a new customer is created.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-2">
            {data.customers.length > 0 && (
              <Field label="Fill from an existing customer" className="sm:col-span-2">
                <Select
                  id="existingCustomer"
                  defaultValue=""
                  onChange={(e) => onCustomerPicked(e.target.value)}
                >
                  <option value="">Select a customer (optional)</option>
                  {[...data.customers]
                    .sort((a, b) => a.name.localeCompare(b.name))
                    .map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name} ({c.phone})
                      </option>
                    ))}
                </Select>
              </Field>
            )}
            <Field
              label="Customer name"
              required
              error={err("customerName")}
              className="sm:col-span-2"
            >
              <Input
                id="customerName"
                autoComplete="off"
                {...invalid("customerName")}
                {...register("customerName")}
              />
            </Field>
            <Field
              label="Phone number"
              required
              error={err("customerPhone")}
              hint="10-digit mobile number"
            >
              <Input
                id="customerPhone"
                type="tel"
                inputMode="tel"
                autoComplete="off"
                {...invalid("customerPhone")}
                {...register("customerPhone")}
              />
            </Field>
            <Field label="Email address" required error={err("customerEmail")}>
              <Input
                id="customerEmail"
                type="email"
                autoComplete="off"
                {...invalid("customerEmail")}
                {...register("customerEmail")}
              />
            </Field>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Event information</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-6">
            <Field label="Event name" required error={err("eventName")} className="sm:col-span-4">
              <Input
                id="eventName"
                placeholder="Anjali and Rahul Wedding"
                {...invalid("eventName")}
                {...register("eventName")}
              />
            </Field>
            <Field label="Event type" required error={err("eventType")} className="sm:col-span-2">
              <Select id="eventType" {...register("eventType")}>
                {EVENT_TYPES.map((t) => (
                  <option key={t}>{t}</option>
                ))}
              </Select>
            </Field>
            <Field label="Event date" required error={err("eventDate")} className="sm:col-span-2">
              <Input
                id="eventDate"
                type="date"
                min={booking ? undefined : todayISO()}
                {...invalid("eventDate")}
                {...register("eventDate", { onChange: () => setAcknowledged(false) })}
              />
            </Field>
            <Field label="Start time" required error={err("startTime")} className="sm:col-span-2">
              <Input
                id="startTime"
                type="time"
                {...invalid("startTime")}
                {...register("startTime", { onChange: () => setAcknowledged(false) })}
              />
            </Field>
            <Field label="End time" required error={err("endTime")} className="sm:col-span-2">
              <Input
                id="endTime"
                type="time"
                {...invalid("endTime")}
                {...register("endTime", { onChange: () => setAcknowledged(false) })}
              />
            </Field>
            <Field
              label="Event location"
              required
              error={err("location")}
              className="sm:col-span-4"
            >
              <Input
                id="location"
                placeholder="Venue name and town"
                {...invalid("location")}
                {...register("location")}
              />
            </Field>
            <Field
              label="Number of guests"
              required
              error={err("guestCount")}
              className="sm:col-span-2"
            >
              <Input
                id="guestCount"
                type="number"
                inputMode="numeric"
                min={1}
                {...invalid("guestCount")}
                {...register("guestCount", { valueAsNumber: true })}
              />
            </Field>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Catering information</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-2">
            <Field
              label="Menu package"
              error={err("menuId")}
              hint="Choosing a package fills in its price per person"
            >
              <Select
                id="menuId"
                {...register("menuId", { onChange: (e) => onMenuPicked(e.target.value) })}
              >
                <option value="">Custom (no package)</option>
                {menus.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.name} ({money(m.pricePerPerson)} per person)
                  </option>
                ))}
              </Select>
            </Field>
            <Field label="Service type" required error={err("serviceType")}>
              <Select id="serviceType" {...register("serviceType")}>
                {SERVICE_STYLES.map((s) => (
                  <option key={s}>{s}</option>
                ))}
              </Select>
            </Field>
            <Field label="Special dietary requirements" error={err("dietaryRequirements")}>
              <Textarea
                id="dietaryRequirements"
                rows={3}
                placeholder="Allergies, Jain meals, halal only"
                {...register("dietaryRequirements")}
              />
            </Field>
            <Field label="Additional instructions" error={err("instructions")}>
              <Textarea
                id="instructions"
                rows={3}
                placeholder="Setup time, access, serving order"
                {...register("instructions")}
              />
            </Field>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Payment information</CardTitle>
            <CardDescription>Amounts in {data.settings.currency}.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-2">
            <Field label="Price per person" required error={err("pricePerPerson")}>
              <Input
                id="pricePerPerson"
                type="number"
                inputMode="decimal"
                min={0}
                {...invalid("pricePerPerson")}
                {...register("pricePerPerson", { valueAsNumber: true })}
              />
            </Field>
            <Field
              label="Additional charges"
              required
              error={err("additionalCharges")}
              hint="Transport, rentals, extra staff"
            >
              <Input
                id="additionalCharges"
                type="number"
                inputMode="decimal"
                min={0}
                {...invalid("additionalCharges")}
                {...register("additionalCharges", { valueAsNumber: true })}
              />
            </Field>
            <Field label="Discount" required error={err("discount")}>
              <Input
                id="discount"
                type="number"
                inputMode="decimal"
                min={0}
                {...invalid("discount")}
                {...register("discount", { valueAsNumber: true })}
              />
            </Field>
            <Field
              label="Advance payment"
              required
              error={err("advanceAmount")}
              hint="Cannot be more than the total"
            >
              <Input
                id="advanceAmount"
                type="number"
                inputMode="decimal"
                min={0}
                {...invalid("advanceAmount")}
                {...register("advanceAmount", { valueAsNumber: true })}
              />
            </Field>
            <Field label="Booking status" required error={err("status")} className="sm:col-span-2">
              <Select id="status" {...register("status")}>
                {BOOKING_STATUSES.map((s) => (
                  <option key={s}>{s}</option>
                ))}
              </Select>
            </Field>
          </CardContent>
        </Card>
      </div>

      {/* Summary column */}
      <div className="space-y-4 lg:sticky lg:top-20">
        <Card>
          <CardHeader>
            <CardTitle>Price summary</CardTitle>
          </CardHeader>
          <CardContent>
            <dl className="tabular space-y-2 text-sm">
              <div className="flex justify-between gap-3">
                <dt className="text-muted-foreground">
                  {n(watched.guestCount ?? 0)} guests x {money(n(watched.pricePerPerson ?? 0))}
                </dt>
                <dd className="font-medium">{money(pricing.subtotal)}</dd>
              </div>
              <div className="flex justify-between gap-3">
                <dt className="text-muted-foreground">Additional charges</dt>
                <dd>+ {money(n(watched.additionalCharges ?? 0))}</dd>
              </div>
              <div className="flex justify-between gap-3">
                <dt className="text-muted-foreground">Discount</dt>
                <dd>- {money(n(watched.discount ?? 0))}</dd>
              </div>
              <div className="flex justify-between gap-3 border-t pt-2 text-base">
                <dt className="font-semibold">Estimated price</dt>
                <dd className="font-display text-xl font-semibold text-primary">
                  {money(pricing.totalPrice)}
                </dd>
              </div>
              <div className="flex justify-between gap-3">
                <dt className="text-muted-foreground">Advance payment</dt>
                <dd>{money(n(watched.advanceAmount ?? 0))}</dd>
              </div>
              <div className="flex justify-between gap-3">
                <dt className="text-muted-foreground">Remaining balance</dt>
                <dd className="font-semibold">{money(pricing.remainingBalance)}</dd>
              </div>
              <div className="flex items-center justify-between gap-3 pt-1">
                <dt className="text-muted-foreground">Payment status</dt>
                <dd>
                  <PaymentBadge status={pricing.paymentStatus} />
                </dd>
              </div>
            </dl>
          </CardContent>
        </Card>

        {hasWarnings && (
          <div
            data-conflict-warning
            role="alert"
            className="rounded-lg border border-amber-300 bg-amber-50 p-4 text-sm text-amber-950"
          >
            <p className="flex items-center gap-2 font-semibold">
              <TriangleAlert className="size-4 shrink-0" /> Possible double booking
            </p>
            <ul className="mt-2 list-disc space-y-1 pl-5">
              {conflicts.warnings.map((warning) => (
                <li key={warning}>{warning}</li>
              ))}
            </ul>
            <label className="mt-3 flex items-start gap-2 font-medium">
              <input
                type="checkbox"
                className="mt-0.5 size-4 accent-amber-700"
                checked={acknowledged}
                onChange={(e) => setAcknowledged(e.target.checked)}
              />
              I have checked this and want to save the booking anyway
            </label>
          </div>
        )}

        <div className="flex flex-col gap-2">
          <Button type="submit" size="lg" disabled={pending}>
            <Save /> {pending ? "Saving" : booking ? "Save changes" : "Save Booking"}
          </Button>
          <Button asChild variant="outline">
            <Link href={booking ? `/dashboard/bookings/${booking.id}` : "/dashboard/bookings"}>
              Cancel
            </Link>
          </Button>
        </div>
        <p className="text-xs text-muted-foreground">
          <span className="text-destructive">*</span> Required field
        </p>
      </div>
    </form>
  );
}
