import * as React from "react";
import { cn } from "@/lib/utils";

/**
 * Label, required marker, control and validation message for one form field.
 *
 * The control is nested inside the <label>, so the two are linked without an
 * id. That matters here: Next.js keeps recently visited routes mounted but
 * hidden, so two forms with the same input ids can be in the document at once.
 */
export function Field({ label, required, error, hint, className, children }) {
  return (
    <div className={cn("flex flex-col gap-1.5", className)}>
      <label className="flex flex-col gap-1.5">
        <span className="text-sm font-medium leading-none text-foreground">
          {label}
          {required && (
            <span className="ml-0.5 text-destructive" aria-hidden="true">
              *
            </span>
          )}
        </span>
        {children}
      </label>
      {error ? (
        <p role="alert" className="text-xs font-medium text-destructive">
          {error}
        </p>
      ) : hint ? (
        <p className="text-xs text-muted-foreground">{hint}</p>
      ) : null}
    </div>
  );
}
