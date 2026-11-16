import { PageHeader } from "@/components/layout/page-header";
import { SettingsForm } from "@/components/settings/settings-form";

export const metadata = { title: "Settings" };

export default function SettingsPage() {
  return (
    <>
      <PageHeader
        title="Settings"
        description="Business details, default pricing, capacity and the assumptions behind the guest calculator."
      />
      <SettingsForm />
    </>
  );
}
