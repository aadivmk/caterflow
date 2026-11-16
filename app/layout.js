import "@fontsource-variable/instrument-sans";
import "@fontsource-variable/bricolage-grotesque";
import { Toaster } from "@/components/ui/sonner";
import "./globals.css";

export const metadata = {
  title: {
    default: "CaterFlow | Catering Booking and Management",
    template: "%s | CaterFlow",
  },
  description:
    "Plan guest counts, build menus and track every catering booking from one dashboard.",
};

export const viewport = {
  themeColor: "#faf8f4",
};

/** Root layout: wraps every route. A Server Component. */
export default function RootLayout({ children }) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="flex min-h-full flex-col">
        {children}
        <Toaster />
      </body>
    </html>
  );
}
