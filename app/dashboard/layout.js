import { Suspense } from "react";
import { DataModeNotice } from "@/components/layout/data-mode-notice";
import { Logo } from "@/components/layout/logo";
import { MobileNav } from "@/components/layout/mobile-nav";
import { SidebarNav } from "@/components/layout/sidebar-nav";
import { TopbarStatus } from "@/components/layout/topbar-status";
import { DataProvider } from "@/components/providers/data-provider";

/**
 * Nested layout for every /dashboard route. It is a Server Component: the
 * shell (sidebar, top bar) is prerendered, and only the small interactive
 * pieces inside it are Client Components.
 */
export default function DashboardLayout({ children }) {
  return (
    <DataProvider>
      <div className="flex min-h-dvh flex-1">
        <aside className="sticky top-0 hidden h-dvh w-60 shrink-0 flex-col border-r bg-card px-3 py-5 lg:flex">
          <div className="mb-7 px-2">
            <Logo href="/dashboard" />
          </div>
          <Suspense>
            <SidebarNav />
          </Suspense>
          <p className="mt-auto px-3 text-xs leading-relaxed text-muted-foreground">
            CaterFlow, an INT257 Next.js project.
          </p>
        </aside>

        <div className="flex min-w-0 flex-1 flex-col">
          <header className="sticky top-0 z-30 flex h-14 items-center justify-between gap-3 border-b bg-background/90 px-4 backdrop-blur sm:px-6">
            <div className="flex items-center gap-3">
              <Suspense>
                <MobileNav />
              </Suspense>
              <div className="lg:hidden">
                <Logo href="/dashboard" />
              </div>
            </div>
            <TopbarStatus />
          </header>

          <Suspense fallback={null}>
            <DataModeNotice />
          </Suspense>

          <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
            {children}
          </main>
        </div>
      </div>
    </DataProvider>
  );
}
