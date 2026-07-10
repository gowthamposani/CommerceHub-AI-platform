import { CheckCircle2, PauseCircle, Tags } from "lucide-react";

import { Card, CardContent } from "@/components/ui/Card";

function StatCard({ label, value, icon: Icon }: { label: string; value: number; icon: typeof Tags }) {
  return (
    <Card>
      <CardContent className="flex items-center justify-between gap-4 p-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">{label}</p>
          <p className="mt-2 text-2xl font-extrabold text-gray-950">{value}</p>
        </div>
        <span className="flex h-11 w-11 items-center justify-center rounded-lg bg-yellow-50 text-yellow-700">
          <Icon className="h-5 w-5" />
        </span>
      </CardContent>
    </Card>
  );
}

export function BrandStats({
  totalBrands,
  activeBrands,
  inactiveBrands
}: {
  totalBrands: number;
  activeBrands: number;
  inactiveBrands: number;
}) {
  return (
    <div className="grid gap-4 md:grid-cols-3">
      <StatCard label="Total Brands" value={totalBrands} icon={Tags} />
      <StatCard label="Active Brands" value={activeBrands} icon={CheckCircle2} />
      <StatCard label="Inactive Brands" value={inactiveBrands} icon={PauseCircle} />
    </div>
  );
}
