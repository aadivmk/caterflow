import { PageHeader } from "@/components/layout/page-header";
import { MenuBuilderView } from "@/components/menu/menu-builder-view";

export const metadata = { title: "Menu Builder" };

export default function MenuBuilderPage() {
  return (
    <>
      <PageHeader
        title="Menu Builder"
        description="Manage your food items and combine them into reusable catering packages."
      />
      <MenuBuilderView />
    </>
  );
}
