"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { DietBadge } from "@/components/shared/badges";
import { Field } from "@/components/shared/field";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input, Textarea } from "@/components/ui/input";
import { useMenus } from "@/hooks/use-menus";
import { useCurrency } from "@/hooks/use-settings";
import { MENU_CATEGORIES } from "@/lib/constants";
import { cn, errorMessage } from "@/lib/utils";
import { fieldErrorsFrom } from "@/lib/validations/common";
import { menuSchema } from "@/lib/validations/menu";

const EMPTY = { name: "", description: "", itemIds: [], defaultGuestCount: 100 };

/** Pick food items to build (or edit) a reusable catering package. */
export function PackageDialog({ open, onOpenChange, menu }) {
  const { menuItems, saveMenu } = useMenus();
  const money = useCurrency();
  const [values, setValues] = useState(EMPTY);
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!open) return;
    // Sync the form with the package being edited whenever the dialog opens.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setValues(
      menu
        ? {
            name: menu.name,
            description: menu.description,
            itemIds: menu.itemIds,
            defaultGuestCount: menu.defaultGuestCount,
          }
        : EMPTY,
    );
    setErrors({});
  }, [open, menu]);

  const selected = new Set(values.itemIds);
  const pricePerPerson = menuItems
    .filter((item) => selected.has(item.id))
    .reduce((sum, item) => sum + item.pricePerPerson, 0);
  const guests = Number.isNaN(values.defaultGuestCount) ? 0 : values.defaultGuestCount;

  function toggle(id) {
    setValues((prev) => ({
      ...prev,
      itemIds: prev.itemIds.includes(id)
        ? prev.itemIds.filter((itemId) => itemId !== id)
        : [...prev.itemIds, id],
    }));
  }

  async function submit(e) {
    e.preventDefault();
    const parsed = menuSchema.safeParse(values);
    if (!parsed.success) {
      setErrors(fieldErrorsFrom(parsed.error));
      return;
    }
    setErrors({});
    setSaving(true);
    try {
      await saveMenu(parsed.data, menu ?? undefined);
      toast.success(menu ? "Package updated" : "Package saved");
      onOpenChange(false);
    } catch (err) {
      toast.error(errorMessage(err));
    } finally {
      setSaving(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>{menu ? "Edit package" : "Create package"}</DialogTitle>
          <DialogDescription>
            Select food items. The price per guest is the sum of the selected items.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={submit} noValidate className="flex flex-col gap-5">
          <div className="grid gap-4 sm:grid-cols-[1fr_9rem]">
            <Field label="Package name" required error={errors.name}>
              <Input
                id="menu-name"
                value={values.name}
                aria-invalid={!!errors.name}
                onChange={(e) => setValues((p) => ({ ...p, name: e.target.value }))}
              />
            </Field>
            <Field label="Guest count" required error={errors.defaultGuestCount}>
              <Input
                id="menu-guests"
                type="number"
                inputMode="numeric"
                min={1}
                value={Number.isNaN(values.defaultGuestCount) ? "" : values.defaultGuestCount}
                aria-invalid={!!errors.defaultGuestCount}
                onChange={(e) =>
                  setValues((p) => ({ ...p, defaultGuestCount: e.target.valueAsNumber }))
                }
              />
            </Field>
            <Field label="Description" error={errors.description} className="sm:col-span-2">
              <Textarea
                id="menu-description"
                rows={2}
                value={values.description}
                onChange={(e) => setValues((p) => ({ ...p, description: e.target.value }))}
              />
            </Field>
          </div>

          <fieldset>
            <legend className="mb-2 text-sm font-medium">
              Food items
              <span className="ml-0.5 text-destructive" aria-hidden="true">
                *
              </span>
            </legend>
            {errors.itemIds && (
              <p role="alert" className="mb-2 text-xs font-medium text-destructive">
                {errors.itemIds}
              </p>
            )}
            <div className="grid max-h-[38dvh] gap-x-6 gap-y-4 overflow-y-auto rounded-md border bg-background/60 p-4 sm:grid-cols-2">
              {MENU_CATEGORIES.map((category) => {
                const items = menuItems.filter((item) => item.category === category);
                if (items.length === 0) return null;
                return (
                  <div key={category}>
                    <p className="mb-1.5 border-b pb-1 text-xs font-semibold text-muted-foreground">
                      {category}
                    </p>
                    <ul className="space-y-1">
                      {items.map((item) => {
                        const checked = selected.has(item.id);
                        const disabled = !item.isAvailable && !checked;
                        return (
                          <li key={item.id}>
                            <label
                              className={cn(
                                "flex cursor-pointer items-center gap-2.5 rounded px-1.5 py-1 text-sm hover:bg-muted",
                                checked && "bg-accent/70",
                                disabled && "cursor-not-allowed opacity-50",
                              )}
                            >
                              <input
                                type="checkbox"
                                className="size-4 shrink-0 accent-emerald-700"
                                checked={checked}
                                disabled={disabled}
                                onChange={() => toggle(item.id)}
                              />
                              <span className="min-w-0 flex-1 truncate">
                                {item.name}
                                {!item.isAvailable && " (unavailable)"}
                              </span>
                              <DietBadge type={item.dietaryType} />
                              <span className="tabular w-12 text-right text-muted-foreground">
                                {money(item.pricePerPerson)}
                              </span>
                            </label>
                          </li>
                        );
                      })}
                    </ul>
                  </div>
                );
              })}
            </div>
          </fieldset>

          <dl className="grid grid-cols-3 gap-3 rounded-md border bg-accent/40 p-4 text-sm">
            <div>
              <dt className="text-muted-foreground">Items selected</dt>
              <dd className="tabular font-display text-xl font-semibold">
                {values.itemIds.length}
              </dd>
            </div>
            <div>
              <dt className="text-muted-foreground">Price per person</dt>
              <dd className="tabular font-display text-xl font-semibold">
                {money(pricePerPerson)}
              </dd>
            </div>
            <div>
              <dt className="text-muted-foreground">Total for {guests} guests</dt>
              <dd className="tabular font-display text-xl font-semibold text-primary">
                {money(pricePerPerson * guests)}
              </dd>
            </div>
          </dl>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={saving}>
              {saving ? "Saving" : menu ? "Save changes" : "Save package"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
