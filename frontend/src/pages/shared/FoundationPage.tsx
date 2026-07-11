import { Bolt, Layers, Route, ShieldCheck } from "lucide-react";

import { PageLayout } from "@/components/layout/PageLayout";
import { Badge } from "@/components/ui/Badge";
import { Card, CardContent } from "@/components/ui/Card";
import { Progress } from "@/components/ui/Progress";

const foundationItems = [
  { label: "Routing", icon: Route, description: "Nested route shell with protected-route placeholder." },
  { label: "Design System", icon: Layers, description: "Reusable controls, states, modals, tables, and forms." },
  { label: "API Layer", icon: Bolt, description: "Axios, interceptors, request helpers, query cache, and errors." },
  { label: "Access Ready", icon: ShieldCheck, description: "Keyboard, focus, aria, responsive layout, and contrast." }
] as const;

export default function FoundationPage() {
  return (
    <PageLayout
      title="Enterprise Frontend Foundation"
      description="A reusable CommerceHub AI shell for future seller and product modules without business logic."
      actions={<Badge tone="success">Foundation ready</Badge>}
    >
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {foundationItems.map((item) => {
          const Icon = item.icon;
          return (
            <Card key={item.label}>
              <CardContent>
                <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-yellow-50 text-yellow-700">
                  <Icon className="h-5 w-5" aria-hidden="true" />
                </span>
                <h2 className="mt-4 text-base font-bold text-gray-950">{item.label}</h2>
                <p className="mt-1 text-sm text-gray-600">{item.description}</p>
              </CardContent>
            </Card>
          );
        })}
      </div>
      <Card>
        <CardContent className="grid gap-6 lg:grid-cols-[1fr_320px] lg:items-center">
          <div>
            <h2 className="text-lg font-extrabold text-gray-950">CommerceHub AI visual language</h2>
            <p className="mt-2 text-sm leading-6 text-gray-600">
              Gold-led actions, white surfaces, light gray workspace, dark gray text, and restrained accent states
              create a marketplace-console foundation ready for enterprise workflows.
            </p>
          </div>
          <div className="space-y-3">
            <div className="flex items-center justify-between text-sm font-semibold text-gray-700">
              <span>Foundation coverage</span>
              <span>92%</span>
            </div>
            <Progress value={92} />
          </div>
        </CardContent>
      </Card>
    </PageLayout>
  );
}
