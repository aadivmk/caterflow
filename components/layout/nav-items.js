import {
  BookOpenText,
  CalendarDays,
  Calculator,
  LayoutDashboard,
  Settings,
  UserCircle,
  Users,
} from "lucide-react";

export const NAV_ITEMS = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/dashboard/bookings", label: "Bookings", icon: CalendarDays },
  { href: "/dashboard/guest-calculator", label: "Guest Calculator", icon: Calculator },
  { href: "/dashboard/menu-builder", label: "Menu Builder", icon: BookOpenText },
  { href: "/dashboard/customers", label: "Customers", icon: Users },
  { href: "/dashboard/settings", label: "Settings", icon: Settings },
  { href: "/dashboard/profile", label: "Profile", icon: UserCircle },
];
