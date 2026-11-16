"use client";

import { useCallback } from "react";
import { useAppData } from "@/components/providers/data-provider";
import { formatCurrency } from "@/lib/utils";

export function useSettings() {
  const { data, loading, error, saveSettings, resetDemoData, mode } = useAppData();
  return { settings: data?.settings ?? null, loading, error, saveSettings, resetDemoData, mode };
}

/** Formats money in the business's default currency (INR unless changed in Settings). */
export function useCurrency() {
  const { data } = useAppData();
  const currency = data?.settings.currency ?? "INR";
  return useCallback((amount) => formatCurrency(amount, currency), [currency]);
}
