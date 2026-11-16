import Link from "next/link";
import { LoginForm } from "@/components/layout/login-form";
import { Logo } from "@/components/layout/logo";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { isMongoConfigured } from "@/lib/mongodb/config";

export const metadata = { title: "Sign in" };

/**
 * Server Component that reads an environment variable on the server to decide
 * what to render: the MongoDB sign-in form, or a note that local mode needs
 * no account.
 */
export default function LoginPage() {
  return (
    <main className="flex flex-1 flex-col items-center justify-center gap-6 px-5 py-16">
      <Logo />
      <Card className="w-full max-w-sm">
        {isMongoConfigured ? (
          <>
            <CardHeader>
              <CardTitle className="text-xl">Sign in to your kitchen</CardTitle>
              <CardDescription>
                Use the email and password for your CaterFlow account.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <LoginForm />
            </CardContent>
          </>
        ) : (
          <>
            <CardHeader>
              <CardTitle className="text-xl">No sign-in needed</CardTitle>
              <CardDescription>
                CaterFlow is running in local mode. Data is saved in this browser, so there is no
                account. Sign-in turns on when MongoDB mode is configured.
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-2">
              <Button asChild>
                <Link href="/dashboard">Continue to dashboard</Link>
              </Button>
              <Button asChild variant="ghost">
                <Link href="/">Back to home</Link>
              </Button>
            </CardContent>
          </>
        )}
      </Card>
    </main>
  );
}
