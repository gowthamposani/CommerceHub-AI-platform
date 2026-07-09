import { Boxes } from "lucide-react";

import { EmptyState } from "@/components/common/EmptyState";
import { PageLayout } from "@/components/layout/PageLayout";
import { Badge } from "@/components/ui/Badge";

export default function ModuleSlotsPage() {
  return (
    <PageLayout
      title="Future Module Slots"
      description="Owned modules can register navigation, services, and routes here without changing the app shell."
      actions={<Badge tone="info">Integration placeholder</Badge>}
    >
      <div className="rounded-lg border border-dashed border-gray-300 bg-white p-4">
        <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50 text-blue-700">
          <Boxes className="h-5 w-5" />
        </div>
        <EmptyState
          title="No modules registered"
          message="Seller, product, category, brand, inventory, warehouse, and dashboard modules will plug in here later."
        />
      </div>
    </PageLayout>
  );
}
