"use client";

import { useMemo } from "react";
import { useAppData } from "@/components/providers/data-provider";
import { menuPricePerPerson } from "@/lib/calculations/pricing";

/** Food items and packages, with each package's items and per-person price resolved. */
export function useMenus() {
  const {
    data,
    loading,
    error,
    saveMenuItem,
    deleteMenuItem,
    saveMenu,
    duplicateMenu,
    deleteMenu,
  } = useAppData();

  const menuItems = useMemo(
    () => [...(data?.menuItems ?? [])].sort((a, b) => a.name.localeCompare(b.name)),
    [data],
  );

  const menus = useMemo(() => {
    if (!data) return [];
    const byId = new Map(data.menuItems.map((item) => [item.id, item]));
    return [...data.menus]
      .sort((a, b) => a.name.localeCompare(b.name))
      .map((menu) => ({
        ...menu,
        items: menu.itemIds.flatMap((id) => byId.get(id) ?? []),
        pricePerPerson: menuPricePerPerson(menu, data.menuItems),
      }));
  }, [data]);

  return {
    menuItems,
    menus,
    loading,
    error,
    saveMenuItem,
    deleteMenuItem,
    saveMenu,
    duplicateMenu,
    deleteMenu,
  };
}
