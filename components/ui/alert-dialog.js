"use client";

import { AlertDialog as AlertDialogPrimitive } from "radix-ui";
import * as React from "react";
import { cn } from "@/lib/utils";
import { buttonVariants } from "./button";

const AlertDialog = AlertDialogPrimitive.Root;

function AlertDialogContent({ className, ...props }) {
  return (
    <AlertDialogPrimitive.Portal>
      <AlertDialogPrimitive.Overlay className="fixed inset-0 z-50 bg-stone-900/40 data-[state=open]:animate-in data-[state=open]:fade-in-0" />
      <AlertDialogPrimitive.Content
        className={cn(
          "fixed left-1/2 top-1/2 z-50 flex w-[calc(100vw-2rem)] max-w-md -translate-x-1/2 -translate-y-1/2 flex-col gap-4 rounded-lg border bg-card p-6 shadow-xl data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95",
          className,
        )}
        {...props}
      />
    </AlertDialogPrimitive.Portal>
  );
}

function AlertDialogTitle(props) {
  return <AlertDialogPrimitive.Title className="text-lg font-semibold" {...props} />;
}

function AlertDialogDescription(props) {
  return <AlertDialogPrimitive.Description className="text-sm text-muted-foreground" {...props} />;
}

function AlertDialogCancel(props) {
  return (
    <AlertDialogPrimitive.Cancel className={buttonVariants({ variant: "outline" })} {...props} />
  );
}

function AlertDialogAction({ destructive, ...props }) {
  return (
    <AlertDialogPrimitive.Action
      className={buttonVariants({ variant: destructive ? "destructive" : "default" })}
      {...props}
    />
  );
}

export {
  AlertDialog,
  AlertDialogContent,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogCancel,
  AlertDialogAction,
};
