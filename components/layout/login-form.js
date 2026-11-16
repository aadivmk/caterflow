"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { Field } from "@/components/shared/field";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { setSession } from "@/lib/mongodb/session";
import { errorMessage } from "@/lib/utils";
import { emailAddress } from "@/lib/validations/common";

const credentialsSchema = z.object({
  email: emailAddress,
  password: z.string().min(6, "Password must be at least 6 characters"),
});

/** Sign in or create an account against the MongoDB users collection (only used in MongoDB mode). */
export function LoginForm() {
  const router = useRouter();
  const [mode, setMode] = useState("signin");
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(credentialsSchema),
    defaultValues: { email: "", password: "" },
  });

  async function onSubmit(values) {
    try {
      const response = await fetch(
        mode === "signin" ? "/api/auth/login" : "/api/auth/register",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(values),
        },
      );
      const body = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(body.error ?? "Could not sign in.");
      setSession(body.token, body.email);
      toast.success(mode === "signin" ? "Signed in" : "Account created");
      router.replace("/dashboard");
    } catch (e) {
      toast.error(errorMessage(e, "Could not sign in."));
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="flex flex-col gap-4">
      <Field label="Email address" required error={errors.email?.message}>
        <Input
          id="email"
          type="email"
          autoComplete="email"
          aria-invalid={!!errors.email}
          {...register("email")}
        />
      </Field>
      <Field label="Password" required error={errors.password?.message}>
        <Input
          id="password"
          type="password"
          autoComplete={mode === "signin" ? "current-password" : "new-password"}
          aria-invalid={!!errors.password}
          {...register("password")}
        />
      </Field>
      <Button type="submit" disabled={isSubmitting}>
        {isSubmitting ? "Please wait" : mode === "signin" ? "Sign in" : "Create account"}
      </Button>
      <p className="text-center text-sm text-muted-foreground">
        {mode === "signin" ? "New to CaterFlow?" : "Already have an account?"}{" "}
        <button
          type="button"
          className="font-medium text-primary underline-offset-4 hover:underline"
          onClick={() => setMode(mode === "signin" ? "signup" : "signin")}
        >
          {mode === "signin" ? "Create an account" : "Sign in"}
        </button>
      </p>
      <p className="text-center text-sm">
        <Link href="/" className="text-muted-foreground underline-offset-4 hover:underline">
          Back to home
        </Link>
      </p>
    </form>
  );
}
