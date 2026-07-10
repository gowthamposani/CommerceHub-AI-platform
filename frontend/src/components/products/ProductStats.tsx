import { Archive, BadgeCheck, Boxes, Eye } from "lucide-react";

import { Card, CardContent } from "@/components/ui/Card";

const stats = [
  { label: "Total Products", key: "totalProducts", icon: Boxes },
  { label: "Published", key: "publishedProducts", icon: BadgeCheck },
  { label: "Drafts", key: "draftProducts", icon: Eye },
  { label: "Archived", key: "archivedProducts", icon: Archive }
] as const;

export function ProductStats({
  totalProducts,
  publishedProducts,
  draftProducts,
  archivedProducts
}: {
  totalProducts: number;
  publishedProducts: number;
  draftProducts: number;
  archivedProducts: number;
}) {
  const values = { totalProducts, publishedProducts, draftProducts, archivedProducts };

  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
      {stats.map((stat) => {
        const Icon = stat.icon;
        return (
          <Card key={stat.key}>
            <CardContent className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-gray-500">{stat.label}</p>
                <p className="mt-2 text-2xl font-bold text-gray-950">{values[stat.key]}</p>
              </div>
              <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-brand-gold/15 text-brand-gold">
                <Icon className="h-5 w-5" />
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
