"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { History, Mail, Pencil, Phone, Search, UserPlus, Users } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { DemoTag, StatusBadge } from "@/components/shared/badges";
import { DataBoundary } from "@/components/shared/data-boundary";
import { Field } from "@/components/shared/field";
import { EmptyState } from "@/components/shared/states";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input, Textarea } from "@/components/ui/input";
import { Sheet, SheetContent, SheetDescription, SheetTitle } from "@/components/ui/sheet";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useCustomers } from "@/hooks/use-customers";
import { useCurrency } from "@/hooks/use-settings";
import { errorMessage, formatDate } from "@/lib/utils";
import { customerSchema } from "@/lib/validations/customer";

const EMPTY = { name: "", phone: "", email: "", address: "", notes: "" };

function CustomerDialog({ open, onOpenChange, customer }) {
  const { saveCustomer } = useCustomers();
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm({ resolver: zodResolver(customerSchema), defaultValues: EMPTY });

  useEffect(() => {
    if (open) {
      reset(
        customer
          ? {
              name: customer.name,
              phone: customer.phone,
              email: customer.email,
              address: customer.address,
              notes: customer.notes,
            }
          : EMPTY,
      );
    }
  }, [open, customer, reset]);

  async function onSubmit(values) {
    try {
      await saveCustomer(values, customer ?? undefined);
      toast.success(customer ? "Customer updated" : "Customer added");
      onOpenChange(false);
    } catch (e) {
      toast.error(errorMessage(e));
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{customer ? "Edit customer" : "Add customer"}</DialogTitle>
          <DialogDescription>Fields marked * are required.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} noValidate className="grid gap-4 sm:grid-cols-2">
          <Field
            label="Customer name"
            required
            error={errors.name?.message}
            className="sm:col-span-2"
          >
            <Input id="c-name" aria-invalid={!!errors.name} {...register("name")} />
          </Field>
          <Field label="Phone number" required error={errors.phone?.message}>
            <Input
              id="c-phone"
              type="tel"
              inputMode="tel"
              aria-invalid={!!errors.phone}
              {...register("phone")}
            />
          </Field>
          <Field label="Email address" required error={errors.email?.message}>
            <Input id="c-email" type="email" aria-invalid={!!errors.email} {...register("email")} />
          </Field>
          <Field label="Address" error={errors.address?.message} className="sm:col-span-2">
            <Input id="c-address" {...register("address")} />
          </Field>
          <Field label="Notes" error={errors.notes?.message} className="sm:col-span-2">
            <Textarea
              id="c-notes"
              rows={2}
              placeholder="Preferences, referrals, reminders"
              {...register("notes")}
            />
          </Field>
          <DialogFooter className="sm:col-span-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Saving" : customer ? "Save changes" : "Add customer"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function Customers() {
  const { customers } = useCustomers();
  const money = useCurrency();
  const [search, setSearch] = useState("");
  const [dialog, setDialog] = useState({
    open: false,
    customer: null,
  });
  const [historyId, setHistoryId] = useState(null);

  const query = search.trim().toLowerCase();
  const filtered = customers.filter(
    (c) =>
      query === "" ||
      [c.name, c.phone, c.email, c.address].some((text) => text.toLowerCase().includes(query)),
  );
  // Looked up by id so the panel always shows the latest data.
  const history = customers.find((c) => c.id === historyId) ?? null;

  return (
    <>
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="search"
            aria-label="Search customers"
            placeholder="Search by name, phone, email or address"
            className="pl-9"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <Button onClick={() => setDialog({ open: true, customer: null })}>
          <UserPlus /> Add customer
        </Button>
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          icon={Users}
          title={customers.length === 0 ? "No customers yet" : "No customers match"}
          description={
            customers.length === 0
              ? "Customers are added automatically when you save a booking. You can also add one here."
              : "Try a different name, phone number or email."
          }
        />
      ) : (
        <Card className="overflow-hidden">
          <Table className="min-w-[720px]">
            <TableHeader>
              <tr>
                <TableHead>Customer</TableHead>
                <TableHead>Contact</TableHead>
                <TableHead className="text-right">Events booked</TableHead>
                <TableHead className="text-right">Total spent</TableHead>
                <TableHead>Latest event</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </tr>
            </TableHeader>
            <TableBody>
              {filtered.map((c) => (
                <TableRow key={c.id}>
                  <TableCell>
                    <span className="flex items-center gap-2 font-medium">
                      {c.name} {c.isDemo && <DemoTag />}
                    </span>
                    <span className="text-xs text-muted-foreground">{c.address}</span>
                  </TableCell>
                  <TableCell>
                    <span className="tabular flex items-center gap-1.5">
                      <Phone className="size-3.5 text-muted-foreground" /> {c.phone}
                    </span>
                    <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
                      <Mail className="size-3.5" /> {c.email}
                    </span>
                  </TableCell>
                  <TableCell className="tabular text-right">{c.eventCount}</TableCell>
                  <TableCell className="tabular text-right font-medium">
                    {money(c.totalSpent)}
                  </TableCell>
                  <TableCell className="tabular whitespace-nowrap text-muted-foreground">
                    {c.bookings[0]
                      ? formatDate(c.bookings[0].eventDate, "d MMM yyyy")
                      : "No bookings"}
                  </TableCell>
                  <TableCell>
                    <div className="flex justify-end gap-1">
                      <Button variant="outline" size="sm" onClick={() => setHistoryId(c.id)}>
                        <History /> History
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        aria-label={`Edit ${c.name}`}
                        onClick={() => setDialog({ open: true, customer: c })}
                      >
                        <Pencil />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      )}

      <CustomerDialog
        open={dialog.open}
        customer={dialog.customer}
        onOpenChange={(open) => setDialog((prev) => ({ ...prev, open }))}
      />

      <Sheet open={!!history} onOpenChange={(open) => !open && setHistoryId(null)}>
        <SheetContent side="right" className="p-6">
          {history && (
            <>
              <SheetTitle className="pr-8 font-display text-xl font-semibold">
                {history.name}
              </SheetTitle>
              <SheetDescription className="text-sm text-muted-foreground">
                {history.phone}, {history.email}
              </SheetDescription>
              <dl className="mt-5 grid grid-cols-2 gap-3">
                <div className="rounded-md border p-3">
                  <dt className="text-xs text-muted-foreground">Events booked</dt>
                  <dd className="tabular font-display text-2xl font-semibold">
                    {history.eventCount}
                  </dd>
                </div>
                <div className="rounded-md border p-3">
                  <dt className="text-xs text-muted-foreground">Total spent</dt>
                  <dd className="tabular font-display text-2xl font-semibold">
                    {money(history.totalSpent)}
                  </dd>
                </div>
              </dl>
              {history.notes && (
                <p className="mt-4 text-sm text-muted-foreground">{history.notes}</p>
              )}
              <h3 className="mb-2 mt-6 text-sm font-semibold">Booking history</h3>
              {history.bookings.length === 0 ? (
                <p className="text-sm text-muted-foreground">No bookings for this customer yet.</p>
              ) : (
                <ul className="divide-y">
                  {history.bookings.map((b) => (
                    <li key={b.id} className="py-3">
                      <Link
                        href={`/dashboard/bookings/${b.id}`}
                        className="font-medium underline-offset-4 hover:underline"
                      >
                        {b.eventName}
                      </Link>
                      <div className="mt-1 flex flex-wrap items-center justify-between gap-2 text-sm">
                        <span className="tabular text-muted-foreground">
                          {formatDate(b.eventDate, "d MMM yyyy")}, {b.guestCount} guests,{" "}
                          {money(b.totalPrice)}
                        </span>
                        <StatusBadge status={b.status} />
                      </div>
                    </li>
                  ))}
                </ul>
              )}
              <Button asChild className="mt-5">
                <Link href="/dashboard/bookings/new">New booking</Link>
              </Button>
            </>
          )}
        </SheetContent>
      </Sheet>
    </>
  );
}

export function CustomersView() {
  return <DataBoundary>{() => <Customers />}</DataBoundary>;
}
