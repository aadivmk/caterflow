import { Check, CircleDashed, Clock, Flame, Leaf, Sprout, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { STATUS_STYLES } from "@/lib/constants";
import { cn } from "@/lib/utils";

const STATUS_ICONS = {
  Pending: Clock,
  Confirmed: Check,
  "In Progress": Flame,
  Completed: CircleDashed,
  Cancelled: X,
};

/** Status is never shown by colour alone: every badge has an icon and a label. */
export function StatusBadge({ status, className }) {
  const Icon = STATUS_ICONS[status];
  return (
    <Badge className={cn(STATUS_STYLES[status].chip, className)}>
      <Icon className="size-3" />
      {status}
    </Badge>
  );
}

const PAYMENT_STYLES = {
  Unpaid: "border-stone-300 bg-stone-100 text-stone-800",
  "Advance Paid": "border-amber-200 bg-amber-50 text-amber-900",
  Paid: "border-emerald-200 bg-emerald-50 text-emerald-900",
};

export function PaymentBadge({ status }) {
  return <Badge className={PAYMENT_STYLES[status]}>{status}</Badge>;
}

const DIET_STYLES = {
  Veg: { className: "border-emerald-200 bg-emerald-50 text-emerald-900", icon: Leaf },
  "Non-Veg": { className: "border-rose-200 bg-rose-50 text-rose-900", icon: Flame },
  Vegan: { className: "border-lime-300 bg-lime-50 text-lime-900", icon: Sprout },
};

export function DietBadge({ type }) {
  const { className, icon: Icon } = DIET_STYLES[type];
  return (
    <Badge className={className}>
      <Icon className="size-3" />
      {type}
    </Badge>
  );
}

/** Marks records that came from the bundled demo dataset. */
export function DemoTag() {
  return (
    <Badge
      className="border-dashed border-stone-300 bg-transparent text-[11px] font-normal text-muted-foreground"
      title="Sample record from the demo dataset"
    >
      Demo
    </Badge>
  );
}
