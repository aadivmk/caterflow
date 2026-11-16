"use client";

import { useRouter } from "next/navigation";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { computePricing } from "@/lib/calculations/pricing";
import { dataMode, getRepository } from "@/lib/data";
import { createId, errorMessage, normalizePhone, nowISO } from "@/lib/utils";

const DataContext = createContext(null);

/**
 * Loads all records once through the Repository and keeps them in React state.
 * Every mutation writes to the data store first and only then updates state,
 * so what is on screen is always what was actually saved.
 */
export function DataProvider({ children }) {
  const router = useRouter();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [userEmail, setUserEmail] = useState(null);
  const dataRef = useRef(null);

  const apply = useCallback((next) => {
    dataRef.current = next;
    setData(next);
  }, []);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      if (dataMode === "mongodb") {
        const { getSession } = await import("@/lib/mongodb/session");
        const session = getSession();
        if (!session) {
          router.replace("/login");
          return;
        }
        setUserEmail(session.email || null);
      }
      const repo = await getRepository();
      apply(await repo.loadAll());
    } catch (e) {
      setError(errorMessage(e, "Could not load your data."));
    } finally {
      setLoading(false);
    }
  }, [apply, router]);

  useEffect(() => {
    // Initial fetch. Browser storage and the sign-in session only exist on
    // the client, so this cannot run during server rendering.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void load();
  }, [load]);

  const current = useCallback(() => {
    if (!dataRef.current) throw new Error("Data has not finished loading.");
    return dataRef.current;
  }, []);

  const put = useCallback(
    async (collection, record) => {
      const repo = await getRepository();
      await repo.upsert(collection, record);
      const prev = current();
      const list = prev[collection];
      const exists = list.some((r) => r.id === record.id);
      apply({
        ...prev,
        [collection]: exists
          ? list.map((r) => (r.id === record.id ? record : r))
          : [...list, record],
      });
    },
    [apply, current],
  );

  const drop = useCallback(
    async (collection, id) => {
      const repo = await getRepository();
      await repo.remove(collection, id);
      const prev = current();
      apply({
        ...prev,
        [collection]: prev[collection].filter((r) => r.id !== id),
      });
    },
    [apply, current],
  );

  const value = useMemo(() => {
    const findBooking = (id) => {
      const booking = current().bookings.find((b) => b.id === id);
      if (!booking) throw new Error("This booking no longer exists.");
      return booking;
    };

    return {
      data,
      loading,
      error,
      mode: dataMode,
      userEmail,
      reload: load,

      async signOut() {
        if (dataMode !== "mongodb") return;
        const { clearSession } = await import("@/lib/mongodb/session");
        clearSession();
        router.replace("/login");
      },

      async saveBooking(draft, existing) {
        const now = nowISO();
        const { customerName, customerPhone, customerEmail, menuId, ...event } = draft;

        // Associate the booking with a customer: reuse a match by phone (or
        // email), otherwise create the customer record automatically.
        const phone = normalizePhone(customerPhone);
        const customers = current().customers;
        const match =
          customers.find((c) => normalizePhone(c.phone) === phone) ??
          customers.find((c) => c.email.toLowerCase() === customerEmail.toLowerCase());

        let customer;
        if (match) {
          customer = match;
          if (
            match.name !== customerName ||
            match.phone !== customerPhone ||
            match.email !== customerEmail
          ) {
            customer = {
              ...match,
              name: customerName,
              phone: customerPhone,
              email: customerEmail,
              updatedAt: now,
            };
            await put("customers", customer);
          }
        } else {
          customer = {
            id: createId(),
            name: customerName,
            phone: customerPhone,
            email: customerEmail,
            address: "",
            notes: "",
            isDemo: false,
            createdAt: now,
            updatedAt: now,
          };
          await put("customers", customer);
        }

        const booking = {
          ...event,
          id: existing?.id ?? createId(),
          customerId: customer.id,
          menuId: menuId || null,
          isDemo: existing?.isDemo ?? false,
          createdAt: existing?.createdAt ?? now,
          updatedAt: now,
        };
        await put("bookings", booking);
        return booking;
      },

      async setBookingStatus(id, status) {
        await put("bookings", { ...findBooking(id), status, updatedAt: nowISO() });
      },

      async recordPayment(id, amount) {
        const booking = findBooking(id);
        if (!(amount > 0)) throw new Error("Enter an amount more than 0.");
        if (amount > booking.remainingBalance) {
          throw new Error("Payment cannot be more than the remaining balance.");
        }
        const advanceAmount = booking.advanceAmount + amount;
        const pricing = computePricing({ ...booking, advanceAmount });
        await put("bookings", {
          ...booking,
          advanceAmount,
          remainingBalance: pricing.remainingBalance,
          paymentStatus: pricing.paymentStatus,
          updatedAt: nowISO(),
        });
      },

      async saveCustomer(values, existing) {
        const now = nowISO();
        const phone = normalizePhone(values.phone);
        const duplicate = current().customers.find(
          (c) => c.id !== existing?.id && normalizePhone(c.phone) === phone,
        );
        if (duplicate) {
          throw new Error(`${duplicate.name} is already saved with this phone number.`);
        }
        const customer = {
          ...values,
          id: existing?.id ?? createId(),
          isDemo: existing?.isDemo ?? false,
          createdAt: existing?.createdAt ?? now,
          updatedAt: now,
        };
        await put("customers", customer);
        return customer;
      },

      async saveMenuItem(values, existing) {
        const now = nowISO();
        const item = {
          ...values,
          id: existing?.id ?? createId(),
          isDemo: existing?.isDemo ?? false,
          createdAt: existing?.createdAt ?? now,
          updatedAt: now,
        };
        await put("menuItems", item);
        return item;
      },

      async deleteMenuItem(id) {
        // Take the item out of any package that uses it before deleting it.
        for (const menu of current().menus.filter((m) => m.itemIds.includes(id))) {
          await put("menus", {
            ...menu,
            itemIds: menu.itemIds.filter((itemId) => itemId !== id),
            updatedAt: nowISO(),
          });
        }
        await drop("menuItems", id);
      },

      async saveMenu(values, existing) {
        const now = nowISO();
        const menu = {
          ...values,
          id: existing?.id ?? createId(),
          isDemo: existing?.isDemo ?? false,
          createdAt: existing?.createdAt ?? now,
          updatedAt: now,
        };
        await put("menus", menu);
        return menu;
      },

      async duplicateMenu(id) {
        const source = current().menus.find((m) => m.id === id);
        if (!source) throw new Error("This package no longer exists.");
        const now = nowISO();
        const copy = {
          ...source,
          id: createId(),
          name: `${source.name} (copy)`,
          isDemo: false,
          createdAt: now,
          updatedAt: now,
        };
        await put("menus", copy);
        return copy;
      },

      async deleteMenu(id) {
        // Bookings keep their saved price; they just lose the link to the package.
        for (const booking of current().bookings.filter((b) => b.menuId === id)) {
          await put("bookings", { ...booking, menuId: null });
        }
        await drop("menus", id);
      },

      async saveCalculation(calc) {
        const record = { ...calc, id: createId(), createdAt: nowISO() };
        const repo = await getRepository();
        await repo.upsert("calculations", record);
        const prev = current();
        apply({ ...prev, calculations: [record, ...prev.calculations] });
      },

      async deleteCalculation(id) {
        await drop("calculations", id);
      },

      async saveSettings(values) {
        const settings = { ...current().settings, ...values, updatedAt: nowISO() };
        const repo = await getRepository();
        await repo.saveSettings(settings);
        apply({ ...current(), settings });
      },

      async resetDemoData() {
        const repo = await getRepository();
        apply(await repo.resetDemoData());
        setError(null);
      },
    };
  }, [apply, current, data, drop, error, load, loading, put, router, userEmail]);

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
}

export function useAppData() {
  const context = useContext(DataContext);
  if (!context) throw new Error("useAppData must be used inside <DataProvider>.");
  return context;
}
