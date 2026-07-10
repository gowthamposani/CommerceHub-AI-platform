import { useForm } from "react-hook-form";

import { FormActions } from "@/components/forms/FormActions";
import { FormField } from "@/components/forms/FormField";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader } from "@/components/ui/Card";
import { Checkbox } from "@/components/ui/Checkbox";
import { Input } from "@/components/ui/Input";
import type { Seller } from "@/types/seller";

interface SellerSettingsValues {
  default_currency: string;
  notifications_enabled: boolean;
  order_auto_accept_enabled: boolean;
}

export function SellerSettingsForm({
  seller,
  loading,
  onSubmit
}: {
  seller: Seller;
  loading?: boolean;
  onSubmit: (values: SellerSettingsValues) => void;
}) {
  const { register, handleSubmit } = useForm<SellerSettingsValues>({
    values: {
      default_currency: seller.default_currency,
      notifications_enabled: seller.notifications_enabled,
      order_auto_accept_enabled: seller.order_auto_accept_enabled
    }
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <Card>
        <CardHeader>
          <h2 className="text-base font-bold text-gray-950">Seller Settings</h2>
        </CardHeader>
        <CardContent className="grid gap-4">
          <FormField label="Default Currency">
            <Input {...register("default_currency")} maxLength={3} />
          </FormField>
          <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
            <Checkbox {...register("notifications_enabled")} />
            Notifications Enabled
          </label>
          <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
            <Checkbox {...register("order_auto_accept_enabled")} />
            Auto Accept Orders
          </label>
          <FormActions>
            <Button type="submit" loading={loading}>
              Save Settings
            </Button>
          </FormActions>
        </CardContent>
      </Card>
    </form>
  );
}
