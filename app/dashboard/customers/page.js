import { CustomersView } from "@/components/customers/customers-view";
import { PageHeader } from "@/components/layout/page-header";

export const metadata = { title: "Customers" };

export default function CustomersPage() {
  return (
    <>
      <PageHeader
        title="Customers"
        description="Contact details, booking history and total spend for everyone you have catered for."
      />
      <CustomersView />
    </>
  );
}
