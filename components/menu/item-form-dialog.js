"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
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
import { Input, Select, Textarea } from "@/components/ui/input";
import { useMenus } from "@/hooks/use-menus";
import { DIETARY_TYPES, MENU_CATEGORIES } from "@/lib/constants";
import { errorMessage } from "@/lib/utils";
import { menuItemSchema } from "@/lib/validations/menu";

const EMPTY = {
  name: "",
  category: "Main Course",
  description: "",
  pricePerPerson: 0,
  dietaryType: "Veg",
  imageUrl: "",
  isAvailable: true,
};

export function ItemFormDialog({ open, onOpenChange, item }) {
  const { saveMenuItem } = useMenus();
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(menuItemSchema),
    defaultValues: EMPTY,
  });

  // Load the item being edited (or a blank form) each time the dialog opens.
  useEffect(() => {
    if (open) reset(item ? { ...item } : EMPTY);
  }, [open, item, reset]);

  async function onSubmit(values) {
    try {
      await saveMenuItem(values, item ?? undefined);
      toast.success(item ? "Food item updated" : "Food item added");
      onOpenChange(false);
    } catch (e) {
      toast.error(errorMessage(e));
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{item ? "Edit food item" : "Add food item"}</DialogTitle>
          <DialogDescription>Prices are per guest. Fields marked * are required.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} noValidate className="grid gap-4 sm:grid-cols-2">
          <Field
            label="Food item name"
            required
            error={errors.name?.message}
            className="sm:col-span-2"
          >
            <Input id="item-name" aria-invalid={!!errors.name} {...register("name")} />
          </Field>
          <Field label="Category" required error={errors.category?.message}>
            <Select id="item-category" {...register("category")}>
              {MENU_CATEGORIES.map((c) => (
                <option key={c}>{c}</option>
              ))}
            </Select>
          </Field>
          <Field label="Dietary type" required error={errors.dietaryType?.message}>
            <Select id="item-diet" {...register("dietaryType")}>
              {DIETARY_TYPES.map((d) => (
                <option key={d}>{d}</option>
              ))}
            </Select>
          </Field>
          <Field label="Price per person" required error={errors.pricePerPerson?.message}>
            <Input
              id="item-price"
              type="number"
              inputMode="decimal"
              min={0}
              aria-invalid={!!errors.pricePerPerson}
              {...register("pricePerPerson", { valueAsNumber: true })}
            />
          </Field>
          <Field label="Image link" error={errors.imageUrl?.message} hint="Optional">
            <Input
              id="item-image"
              type="url"
              placeholder="https://"
              aria-invalid={!!errors.imageUrl}
              {...register("imageUrl")}
            />
          </Field>
          <Field label="Description" error={errors.description?.message} className="sm:col-span-2">
            <Textarea id="item-description" rows={2} {...register("description")} />
          </Field>
          <label className="flex items-center gap-2.5 text-sm font-medium sm:col-span-2">
            <input
              type="checkbox"
              className="size-4 accent-emerald-700"
              {...register("isAvailable")}
            />
            Available for new menus
          </label>
          <DialogFooter className="sm:col-span-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Saving" : item ? "Save changes" : "Add food item"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
