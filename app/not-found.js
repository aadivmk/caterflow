import Link from "next/link";
import { Logo } from "@/components/layout/logo";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <main className="flex flex-1 flex-col items-center justify-center gap-6 px-6 py-24 text-center">
      <Logo />
      <div className="space-y-2">
        <p className="font-display text-6xl font-semibold text-primary">404</p>
        <h1 className="text-2xl font-semibold">This page is not on the menu</h1>
        <p className="mx-auto max-w-sm text-sm text-muted-foreground">
          The link may be old, or the page may have moved.
        </p>
      </div>
      <div className="flex flex-wrap justify-center gap-2">
        <Button asChild>
          <Link href="/dashboard">Go to dashboard</Link>
        </Button>
        <Button asChild variant="outline">
          <Link href="/">Back to home</Link>
        </Button>
      </div>
    </main>
  );
}
