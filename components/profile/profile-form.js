"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Database, KeyRound, Save, User } from "lucide-react";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { Field } from "@/components/shared/field";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useAppData } from "@/components/providers/data-provider";
import { apiUrl } from "@/lib/api-url";
import { getSession } from "@/lib/mongodb/session";
import { errorMessage } from "@/lib/utils";

const nameSchema = z.object({
  fullName: z.string().max(80, "Name must be 80 characters or less"),
});

const passwordSchema = z
  .object({
    currentPassword: z.string().min(1, "Enter your current password"),
    newPassword: z.string().min(6, "New password must be at least 6 characters"),
    confirmPassword: z.string().min(1, "Confirm your new password"),
  })
  .refine((d) => d.newPassword === d.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

function AccountInfoCard({ profile }) {
  const { register, handleSubmit, reset, formState } = useForm({
    resolver: zodResolver(nameSchema),
    defaultValues: { fullName: profile.fullName ?? "" },
  });
  const { isSubmitting, isDirty, errors } = formState;

  async function onSubmit(values) {
    try {
      const session = getSession();
      const res = await fetch(apiUrl("/api/auth/profile"), {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session?.token}`,
        },
        body: JSON.stringify({ fullName: values.fullName }),
      });
      const body = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(body.error ?? "Could not update profile.");
      reset(values);
      toast.success("Profile updated");
    } catch (e) {
      toast.error(errorMessage(e));
    }
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-3">
          <div className="flex size-10 items-center justify-center rounded-full bg-primary/10 text-primary">
            <User className="size-5" />
          </div>
          <div>
            <CardTitle>Account details</CardTitle>
            <CardDescription>Your name and sign-in email.</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {/* Read-only info row */}
        <div className="mb-5 grid gap-3 rounded-lg border bg-muted/40 p-4 sm:grid-cols-2">
          <div>
            <p className="text-xs font-medium text-muted-foreground">Email address</p>
            <p className="mt-0.5 text-sm font-medium">{profile.email}</p>
          </div>
          <div>
            <p className="text-xs font-medium text-muted-foreground">Role</p>
            <p className="mt-0.5 text-sm font-medium capitalize">{profile.role}</p>
          </div>
          <div>
            <p className="text-xs font-medium text-muted-foreground">Account created</p>
            <p className="mt-0.5 text-sm font-medium">
              {new Date(profile.createdAt).toLocaleDateString("en-IN", {
                day: "numeric",
                month: "long",
                year: "numeric",
              })}
            </p>
          </div>
          <div>
            <p className="text-xs font-medium text-muted-foreground">User ID</p>
            <p className="mt-0.5 truncate font-mono text-xs text-muted-foreground">
              {profile.id}
            </p>
          </div>
        </div>

        {/* Editable name */}
        <form onSubmit={handleSubmit(onSubmit)} noValidate className="flex flex-col gap-4">
          <Field
            label="Full name"
            hint="Shown on your profile. Optional."
            error={errors.fullName?.message}
          >
            <Input
              id="fullName"
              autoComplete="name"
              placeholder="Your full name"
              aria-invalid={!!errors.fullName}
              {...register("fullName")}
            />
          </Field>
          <div className="flex items-center gap-3">
            <Button type="submit" disabled={isSubmitting || !isDirty}>
              <Save />
              {isSubmitting ? "Saving" : "Save name"}
            </Button>
            {isDirty && (
              <Button type="button" variant="ghost" onClick={() => reset()}>
                Discard
              </Button>
            )}
          </div>
        </form>
      </CardContent>
    </Card>
  );
}

function ChangePasswordCard() {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(passwordSchema),
    defaultValues: { currentPassword: "", newPassword: "", confirmPassword: "" },
  });

  async function onSubmit(values) {
    try {
      const session = getSession();
      const res = await fetch(apiUrl("/api/auth/profile"), {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session?.token}`,
        },
        body: JSON.stringify({
          currentPassword: values.currentPassword,
          newPassword: values.newPassword,
        }),
      });
      const body = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(body.error ?? "Could not change password.");
      reset();
      toast.success("Password changed successfully");
    } catch (e) {
      toast.error(errorMessage(e));
    }
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-3">
          <div className="flex size-10 items-center justify-center rounded-full bg-primary/10 text-primary">
            <KeyRound className="size-5" />
          </div>
          <div>
            <CardTitle>Change password</CardTitle>
            <CardDescription>
              Enter your current password then choose a new one.
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <form
          onSubmit={handleSubmit(onSubmit, () => toast.error("Check the highlighted fields."))}
          noValidate
          className="flex flex-col gap-4"
        >
          <Field
            label="Current password"
            required
            error={errors.currentPassword?.message}
          >
            <Input
              id="currentPassword"
              type="password"
              autoComplete="current-password"
              aria-invalid={!!errors.currentPassword}
              {...register("currentPassword")}
            />
          </Field>
          <Field
            label="New password"
            required
            hint="At least 6 characters"
            error={errors.newPassword?.message}
          >
            <Input
              id="newPassword"
              type="password"
              autoComplete="new-password"
              aria-invalid={!!errors.newPassword}
              {...register("newPassword")}
            />
          </Field>
          <Field
            label="Confirm new password"
            required
            error={errors.confirmPassword?.message}
          >
            <Input
              id="confirmPassword"
              type="password"
              autoComplete="new-password"
              aria-invalid={!!errors.confirmPassword}
              {...register("confirmPassword")}
            />
          </Field>
          <div>
            <Button type="submit" disabled={isSubmitting}>
              <KeyRound />
              {isSubmitting ? "Changing" : "Change password"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}

function SampleDataCard() {
  const { resetDemoData } = useAppData();
  const [loading, setLoading] = useState(false);
  const [confirm, setConfirm] = useState(false);

  async function handleLoad() {
    setLoading(true);
    try {
      await resetDemoData();
      toast.success("Sample data loaded! Check your dashboard.");
    } catch (e) {
      toast.error(errorMessage(e));
    } finally {
      setLoading(false);
      setConfirm(false);
    }
  }

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-full bg-primary/10 text-primary">
              <Database className="size-5" />
            </div>
            <div>
              <CardTitle>Sample data</CardTitle>
              <CardDescription>
                Load demo customers, menu items, menus and bookings to explore
                the app. This replaces all your current data.
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Button
            variant="outline"
            disabled={loading}
            onClick={() => setConfirm(true)}
          >
            <Database />
            {loading ? "Loading…" : "Load sample data"}
          </Button>
        </CardContent>
      </Card>

      <ConfirmDialog
        open={confirm}
        onOpenChange={setConfirm}
        title="Load sample data?"
        description="This will delete all your existing customers, menu items, menus, bookings and calculations, then insert a demo dataset. This cannot be undone."
        confirmLabel="Load sample data"
        destructive
        onConfirm={handleLoad}
      />
    </>
  );
}

export function ProfileForm() {
  const [profile, setProfile] = useState(null);
  const [loadError, setLoadError] = useState(null);

  useEffect(() => {
    async function fetchProfile() {
      try {
        const session = getSession();
        if (!session) return;
        const res = await fetch(apiUrl("/api/auth/profile"), {
          headers: { Authorization: `Bearer ${session.token}` },
        });
        const body = await res.json().catch(() => ({}));
        if (!res.ok) throw new Error(body.error ?? "Could not load profile.");
        setProfile(body);
      } catch (e) {
        setLoadError(errorMessage(e));
      }
    }
    void fetchProfile();
  }, []);

  if (loadError) {
    return (
      <div className="rounded-lg border border-destructive/40 bg-destructive/5 p-4 text-sm text-destructive">
        {loadError}
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="space-y-6">
        {[1, 2].map((i) => (
          <Card key={i}>
            <CardContent className="pt-6">
              <div className="h-32 animate-pulse rounded-md bg-muted" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <AccountInfoCard profile={profile} />
      <ChangePasswordCard />
      <SampleDataCard />
    </div>
  );
}
