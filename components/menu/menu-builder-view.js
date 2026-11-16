"use client";

import { BookOpenText, Copy, Pencil, Plus, Search, Soup, Trash2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { DemoTag, DietBadge } from "@/components/shared/badges";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { DataBoundary } from "@/components/shared/data-boundary";
import { EmptyState } from "@/components/shared/states";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input, Select } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useMenus } from "@/hooks/use-menus";
import { useCurrency } from "@/hooks/use-settings";
import { DIETARY_TYPES, MENU_CATEGORIES } from "@/lib/constants";
import { errorMessage } from "@/lib/utils";

import { ItemFormDialog } from "./item-form-dialog";
import { PackageDialog } from "./package-dialog";

function MenuBuilder() {
  const { menuItems, menus, saveMenuItem, deleteMenuItem, duplicateMenu, deleteMenu } = useMenus();
  const money = useCurrency();

  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [diet, setDiet] = useState("All");
  const [itemDialog, setItemDialog] = useState({
    open: false,
    item: null,
  });
  const [packageDialog, setPackageDialog] = useState({
    open: false,
    menu: null,
  });
  const [pendingDelete, setPendingDelete] = useState(null);

  const query = search.trim().toLowerCase();
  const filteredItems = menuItems.filter(
    (item) =>
      (category === "All" || item.category === category) &&
      (diet === "All" || item.dietaryType === diet) &&
      (query === "" ||
        item.name.toLowerCase().includes(query) ||
        item.description.toLowerCase().includes(query)),
  );

  function confirmDelete() {
    if (!pendingDelete) return;
    const task =
      pendingDelete.kind === "item"
        ? deleteMenuItem(pendingDelete.record.id).then(() => toast.success("Food item deleted"))
        : deleteMenu(pendingDelete.record.id).then(() => toast.success("Package deleted"));
    task.catch((e) => toast.error(errorMessage(e)));
    setPendingDelete(null);
  }

  return (
    <>
      <Tabs defaultValue="packages">
        <TabsList>
          <TabsTrigger value="packages">
            <BookOpenText /> Packages ({menus.length})
          </TabsTrigger>
          <TabsTrigger value="items">
            <Soup /> Food items ({menuItems.length})
          </TabsTrigger>
        </TabsList>

        {/* Packages */}
        <TabsContent value="packages">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <p className="text-sm text-muted-foreground">
              Reusable menus you can attach to a booking.
            </p>
            <Button
              onClick={() => setPackageDialog({ open: true, menu: null })}
              disabled={menuItems.length === 0}
            >
              <Plus /> Create package
            </Button>
          </div>

          {menus.length === 0 ? (
            <EmptyState
              icon={BookOpenText}
              title="No packages yet"
              description="Create a package by picking food items. You can reuse it for any booking."
            />
          ) : (
            <div className="grid gap-4 xl:grid-cols-2">
              {menus.map((menu) => (
                <Card key={menu.id} className="flex flex-col p-5">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <h2 className="text-lg font-semibold">{menu.name}</h2>
                        {menu.isDemo && <DemoTag />}
                      </div>
                      <p className="mt-0.5 text-sm text-muted-foreground">{menu.description}</p>
                    </div>
                    <div className="shrink-0 text-right">
                      <p className="tabular font-display text-2xl font-semibold text-primary">
                        {money(menu.pricePerPerson)}
                      </p>
                      <p className="text-xs text-muted-foreground">per person</p>
                    </div>
                  </div>

                  <div className="mt-4 flex-1 space-y-2 text-sm">
                    {MENU_CATEGORIES.map((cat) => {
                      const items = menu.items.filter((item) => item.category === cat);
                      if (items.length === 0) return null;
                      return (
                        <p key={cat}>
                          <span className="font-medium">{cat}: </span>
                          <span className="text-muted-foreground">
                            {items.map((item) => item.name).join(", ")}
                          </span>
                        </p>
                      );
                    })}
                    {menu.items.length === 0 && (
                      <p className="text-muted-foreground">
                        This package has no items. Edit it to add some.
                      </p>
                    )}
                  </div>

                  <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t pt-4">
                    <p className="tabular text-sm text-muted-foreground">
                      {menu.items.length} {menu.items.length === 1 ? "item" : "items"}.{" "}
                      <span className="font-semibold text-foreground">
                        {money(menu.pricePerPerson * menu.defaultGuestCount)}
                      </span>{" "}
                      for {menu.defaultGuestCount} guests
                    </p>
                    <div className="flex gap-1">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setPackageDialog({ open: true, menu })}
                      >
                        <Pencil /> Edit
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          duplicateMenu(menu.id)
                            .then((copy) => toast.success(`Created "${copy.name}"`))
                            .catch((e) => toast.error(errorMessage(e)))
                        }
                      >
                        <Copy /> Duplicate
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-destructive hover:bg-rose-50"
                        onClick={() => setPendingDelete({ kind: "menu", record: menu })}
                      >
                        <Trash2 /> Delete
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        {/* Food items */}
        <TabsContent value="items">
          <div className="mb-4 flex flex-col gap-3 lg:flex-row lg:items-center">
            <div className="relative flex-1">
              <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                type="search"
                aria-label="Search food items"
                placeholder="Search food items"
                className="pl-9"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <div className="flex flex-wrap gap-3">
              <Select
                aria-label="Filter by category"
                className="w-auto min-w-40"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
              >
                <option value="All">All categories</option>
                {MENU_CATEGORIES.map((c) => (
                  <option key={c}>{c}</option>
                ))}
              </Select>
              <Select
                aria-label="Filter by dietary type"
                className="w-auto min-w-32"
                value={diet}
                onChange={(e) => setDiet(e.target.value)}
              >
                <option value="All">All diets</option>
                {DIETARY_TYPES.map((d) => (
                  <option key={d}>{d}</option>
                ))}
              </Select>
              <Button onClick={() => setItemDialog({ open: true, item: null })}>
                <Plus /> Add food item
              </Button>
            </div>
          </div>

          {filteredItems.length === 0 ? (
            <EmptyState
              icon={Soup}
              title={menuItems.length === 0 ? "No food items yet" : "No items match"}
              description={
                menuItems.length === 0
                  ? "Add your dishes with a price per guest, then group them into packages."
                  : "Try a different search or clear the filters."
              }
            />
          ) : (
            <div className="space-y-6">
              {MENU_CATEGORIES.map((cat) => {
                const items = filteredItems.filter((item) => item.category === cat);
                if (items.length === 0) return null;
                return (
                  <section key={cat}>
                    <h2 className="mb-2 text-sm font-semibold text-muted-foreground">
                      {cat} ({items.length})
                    </h2>
                    <Card className="divide-y">
                      {items.map((item) => (
                        <div
                          key={item.id}
                          className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center"
                        >
                          {item.imageUrl ? (
                            // Menu images come from any host the user pastes, so next/image's fixed host list does not fit.
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              src={item.imageUrl}
                              alt=""
                              className="size-12 shrink-0 rounded-md border object-cover"
                            />
                          ) : (
                            <span className="hidden size-12 shrink-0 items-center justify-center rounded-md bg-muted text-muted-foreground sm:flex">
                              <Soup className="size-5" />
                            </span>
                          )}
                          <div className="min-w-0 flex-1">
                            <div className="flex flex-wrap items-center gap-2">
                              <p className="font-medium">{item.name}</p>
                              <DietBadge type={item.dietaryType} />
                              {item.isDemo && <DemoTag />}
                            </div>
                            <p className="text-sm text-muted-foreground">{item.description}</p>
                          </div>
                          <div className="flex items-center justify-between gap-4 sm:justify-end">
                            <p className="tabular w-20 text-sm font-semibold sm:text-right">
                              {money(item.pricePerPerson)}
                              <span className="block text-xs font-normal text-muted-foreground">
                                per person
                              </span>
                            </p>
                            <label className="flex w-28 items-center gap-2 text-xs text-muted-foreground">
                              <Switch
                                checked={item.isAvailable}
                                aria-label={`${item.name} available`}
                                onCheckedChange={(checked) =>
                                  saveMenuItem({ ...item, isAvailable: checked }, item)
                                    .then(() =>
                                      toast.success(
                                        `${item.name} marked ${checked ? "available" : "unavailable"}`,
                                      ),
                                    )
                                    .catch((e) => toast.error(errorMessage(e)))
                                }
                              />
                              {item.isAvailable ? "Available" : "Unavailable"}
                            </label>
                            <div className="flex gap-1">
                              <Button
                                variant="ghost"
                                size="icon"
                                aria-label={`Edit ${item.name}`}
                                onClick={() => setItemDialog({ open: true, item })}
                              >
                                <Pencil />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="text-destructive hover:bg-rose-50"
                                aria-label={`Delete ${item.name}`}
                                onClick={() => setPendingDelete({ kind: "item", record: item })}
                              >
                                <Trash2 />
                              </Button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </Card>
                  </section>
                );
              })}
            </div>
          )}
        </TabsContent>
      </Tabs>

      <ItemFormDialog
        open={itemDialog.open}
        item={itemDialog.item}
        onOpenChange={(open) => setItemDialog((prev) => ({ ...prev, open }))}
      />
      <PackageDialog
        open={packageDialog.open}
        menu={packageDialog.menu}
        onOpenChange={(open) => setPackageDialog((prev) => ({ ...prev, open }))}
      />
      <ConfirmDialog
        open={!!pendingDelete}
        onOpenChange={(open) => !open && setPendingDelete(null)}
        title={pendingDelete?.kind === "item" ? "Delete this food item?" : "Delete this package?"}
        description={
          pendingDelete?.kind === "item"
            ? `"${pendingDelete.record.name}" will be removed from your list and from any package that includes it.`
            : `"${pendingDelete?.record.name ?? ""}" will be deleted. Existing bookings keep their saved price.`
        }
        confirmLabel={pendingDelete?.kind === "item" ? "Delete food item" : "Delete package"}
        cancelLabel="Keep it"
        onConfirm={confirmDelete}
      />
    </>
  );
}

export function MenuBuilderView() {
  return <DataBoundary>{() => <MenuBuilder />}</DataBoundary>;
}
