import { PageHeader } from "@/components/layout/page-header";
import { ProfileForm } from "@/components/profile/profile-form";
import { isMongoConfigured } from "@/lib/mongodb/config";

export const metadata = { title: "Profile" };

export default function ProfilePage() {
  return (
    <>
      <PageHeader
        title="Profile"
        description="Your account details and password."
      />
      {isMongoConfigured ? (
        <ProfileForm />
      ) : (
        <div className="rounded-lg border bg-muted/40 p-6 text-sm text-muted-foreground">
          Profile is only available in MongoDB mode. Set{" "}
          <code className="rounded bg-muted px-1 py-0.5 font-mono text-xs">
            NEXT_PUBLIC_DATA_MODE=mongodb
          </code>{" "}
          in your <code className="rounded bg-muted px-1 py-0.5 font-mono text-xs">.env.local</code>{" "}
          to enable it.
        </div>
      )}
    </>
  );
}
