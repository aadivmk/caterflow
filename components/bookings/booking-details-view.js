"use client";

import {
  Ban,
  CalendarDays,
  Clock,
  IndianRupee,
  Mail,
  MapPin,
  Pencil,
  Phone,
  Users,
} from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { toast } from "sonner";
import { DemoTag, DietBadge, PaymentBadge, StatusBadge } from "@/components/shared/badges";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { DataBoundary } from "@/components/shared/data-boundary";
import { Field } from "@/components/shared/field";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input, Select } from "@/components/ui/input";
import { useBooking, useBookings } from "@/hooks/use-bookings";
import { useMenus } from "@/hooks/use-menus";
import { useCurrency } from "@/hooks/use-settings";
import { BOOKING_STATUSES } from "@/lib/constants";
import { errorMessage, formatDate, formatTimeRange } from "@/lib/utils";

import { BookingNotFound } from "./booking-form-loader";

function Row({ label, children }) {
  return (
    <div className="flex justify-between gap-4 py-1.5 text-sm">
      <dt className="text-muted-foreground">{label}</dt>
      <dd className="tabular text-right font-medium">{children}</dd>
    </div>
  );
}

function Details({ id }) {
  const { booking } = useBooking(id);
  const { setBookingStatus, recordPayment } = useBookings();
  const { menus } = useMenus();
  const money = useCurrency();
  const [confirmCancel, setConfirmCancel] = useState(false);
  const [paymentOpen, setPaymentOpen] = useState(false);
  const [amount, setAmount] = useState(NaN);
  const [amountError, setAmountError] = useState("");

  if (!booking) return <BookingNotFound />;

  const menu = menus.find((m) => m.id === booking.menuId);
  const subtotal = booking.guestCount * booking.pricePerPerson;
  const cancelled = booking.status === "Cancelled";

  function changeStatus(status) {
    setBookingStatus(id, status)
      .then(() => toast.success(`Status changed to ${status}`))
      .catch((e) => toast.error(errorMessage(e)));
  }

  function submitPayment(e) {
    e.preventDefault();
    if (!booking) return;
    if (!(amount > 0)) return setAmountError("Enter an amount more than 0");
    if (amount > booking.remainingBalance) {
      return setAmountError(
        `Cannot be more than the balance of ${money(booking.remainingBalance)}`,
      );
    }
    recordPayment(id, amount)
      .then(() => {
        toast.success(`Payment of ${money(amount)} recorded`);
        setPaymentOpen(false);
        setAmount(NaN);
        setAmountError("");
      })
      .catch((err) => toast.error(errorMessage(err)));
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-2xl font-semibold sm:text-[28px]">{booking.eventName}</h1>
            <StatusBadge status={booking.status} />
            {booking.isDemo && <DemoTag />}
          </div>
          <p className="mt-1 text-sm text-muted-foreground">
            {booking.eventType}, {booking.serviceType.toLowerCase()} service
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Select
            aria-label="Update booking status"
            className="w-auto min-w-36"
            value={booking.status}
            onChange={(e) => {
              const next = e.target.value;
              if (next === "Cancelled") setConfirmCancel(true);
              else changeStatus(next);
            }}
          >
            {BOOKING_STATUSES.map((s) => (
              <option key={s}>{s}</option>
            ))}
          </Select>
          <Button asChild variant="outline">
            <Link href={`/dashboard/bookings/${id}/edit`}>
              <Pencil /> Edit
            </Link>
          </Button>
          {!cancelled && (
            <Button
              variant="outline"
              className="border-rose-200 text-destructive hover:bg-rose-50"
              onClick={() => setConfirmCancel(true)}
            >
              <Ban /> Cancel booking
            </Button>
          )}
        </div>
      </div>

      <div className="grid items-start gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Event details</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4 text-sm sm:grid-cols-2">
              <p className="flex items-center gap-2.5">
                <CalendarDays className="size-4 text-muted-foreground" />
                {formatDate(booking.eventDate, "EEEE, d MMMM yyyy")}
              </p>
              <p className="tabular flex items-center gap-2.5">
                <Clock className="size-4 text-muted-foreground" />
                {formatTimeRange(booking.startTime, booking.endTime)}
              </p>
              <p className="flex items-center gap-2.5">
                <MapPin className="size-4 shrink-0 text-muted-foreground" />
                {booking.location}
              </p>
              <p className="tabular flex items-center gap-2.5">
                <Users className="size-4 text-muted-foreground" />
                {booking.guestCount} guests
              </p>
              <div className="sm:col-span-2">
                <p className="font-medium">Special dietary requirements</p>
                <p className="text-muted-foreground">
                  {booking.dietaryRequirements || "None noted"}
                </p>
              </div>
              <div className="sm:col-span-2">
                <p className="font-medium">Additional instructions</p>
                <p className="text-muted-foreground">{booking.instructions || "None noted"}</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Selected menu</CardTitle>
            </CardHeader>
            <CardContent>
              {menu ? (
                <>
                  <div className="flex flex-wrap items-baseline justify-between gap-2">
                    <p className="font-semibold">{menu.name}</p>
                    <p className="tabular text-sm text-muted-foreground">
                      Booked at {money(booking.pricePerPerson)} per person
                    </p>
                  </div>
                  <ul className="mt-3 grid gap-x-6 gap-y-1.5 text-sm sm:grid-cols-2">
                    {menu.items.map((item) => (
                      <li
                        key={item.id}
                        className="flex items-center justify-between gap-2 border-b py-1.5"
                      >
                        <span className="truncate">{item.name}</span>
                        <DietBadge type={item.dietaryType} />
                      </li>
                    ))}
                  </ul>
                </>
              ) : (
                <p className="text-sm text-muted-foreground">
                  Custom menu with no saved package, priced at {money(booking.pricePerPerson)} per
                  person.
                </p>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Customer</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <p className="font-semibold">{booking.customer?.name ?? "Unknown customer"}</p>
              {booking.customer && (
                <>
                  <a
                    href={`tel:${booking.customer.phone}`}
                    className="tabular flex items-center gap-2.5 hover:underline"
                  >
                    <Phone className="size-4 text-muted-foreground" /> {booking.customer.phone}
                  </a>
                  <a
                    href={`mailto:${booking.customer.email}`}
                    className="flex items-center gap-2.5 break-all hover:underline"
                  >
                    <Mail className="size-4 shrink-0 text-muted-foreground" />{" "}
                    {booking.customer.email}
                  </a>
                </>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex-row items-center justify-between">
              <CardTitle>Pricing</CardTitle>
              <PaymentBadge status={booking.paymentStatus} />
            </CardHeader>
            <CardContent>
              <dl>
                <Row label={`${booking.guestCount} guests x ${money(booking.pricePerPerson)}`}>
                  {money(subtotal)}
                </Row>
                <Row label="Additional charges">+ {money(booking.additionalCharges)}</Row>
                <Row label="Discount">- {money(booking.discount)}</Row>
                <div className="my-1 border-t" />
                <Row label="Total price">
                  <span className="font-display text-lg text-primary">
                    {money(booking.totalPrice)}
                  </span>
                </Row>
                <Row label="Advance paid">{money(booking.advanceAmount)}</Row>
                <Row label="Remaining balance">{money(booking.remainingBalance)}</Row>
              </dl>
              {!cancelled && booking.remainingBalance > 0 && (
                <Button
                  className="mt-4 w-full"
                  variant="outline"
                  onClick={() => setPaymentOpen(true)}
                >
                  <IndianRupee /> Record a payment
                </Button>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      <ConfirmDialog
        open={confirmCancel}
        onOpenChange={setConfirmCancel}
        title="Cancel this booking?"
        description={`"${booking.eventName}" will be marked as cancelled and its slot freed on the calendar. You can change the status back later.`}
        confirmLabel="Cancel booking"
        cancelLabel="Keep booking"
        onConfirm={() => {
          setConfirmCancel(false);
          changeStatus("Cancelled");
        }}
      />

      <Dialog open={paymentOpen} onOpenChange={setPaymentOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Record a payment</DialogTitle>
            <DialogDescription>
              Remaining balance: {money(booking.remainingBalance)}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={submitPayment} noValidate className="flex flex-col gap-4">
            <Field label="Amount received" required error={amountError}>
              <Input
                id="paymentAmount"
                type="number"
                inputMode="decimal"
                min={1}
                max={booking.remainingBalance}
                value={Number.isNaN(amount) ? "" : amount}
                aria-invalid={!!amountError}
                onChange={(e) => {
                  setAmount(e.target.valueAsNumber);
                  setAmountError("");
                }}
              />
            </Field>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setAmount(booking.remainingBalance)}
              >
                Fill full balance
              </Button>
              <Button type="submit">Record payment</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export function BookingDetailsView({ id }) {
  return <DataBoundary>{() => <Details id={id} />}</DataBoundary>;
}
