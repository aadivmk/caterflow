import { CalculatorView } from "@/components/calculator/calculator-view";
import { PageHeader } from "@/components/layout/page-header";

export const metadata = { title: "Guest Calculator" };

export default function GuestCalculatorPage() {
  return (
    <>
      <PageHeader
        title="Guest Calculator"
        description="Estimate servings, ingredients, water, staff and food budget from a guest count."
      />
      <CalculatorView />
    </>
  );
}
