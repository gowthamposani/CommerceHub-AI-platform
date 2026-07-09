import { useMemo } from "react";
import { Controller, useForm } from "react-hook-form";

import { FormActions } from "@/components/forms/FormActions";
import { FormField } from "@/components/forms/FormField";
import { zodFormResolver } from "@/components/forms/formResolver";
import { warehouseFormSchema, type WarehouseFormValues } from "@/components/warehouses/warehouseValidation";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Toggle } from "@/components/ui/Toggle";
import { WAREHOUSE_STATUS_OPTIONS, WAREHOUSE_TYPE_OPTIONS } from "@/constants/warehouse";
import type { Warehouse } from "@/types/warehouse";

const emptyDefaults: WarehouseFormValues = {
  seller_id: "",
  warehouse_code: "",
  warehouse_name: "",
  contact_person: "",
  phone_number: "",
  email: "",
  address_line_1: "",
  address_line_2: null,
  city: "",
  state: "",
  country: "",
  postal_code: "",
  latitude: null,
  longitude: null,
  warehouse_type: "fulfillment",
  status: "active",
  is_default: false
};

function warehouseToFormValues(warehouse?: Warehouse): WarehouseFormValues {
  if (!warehouse) return emptyDefaults;
  return {
    seller_id: warehouse.seller_id,
    warehouse_code: warehouse.warehouse_code,
    warehouse_name: warehouse.warehouse_name,
    contact_person: warehouse.contact_person,
    phone_number: warehouse.phone_number,
    email: warehouse.email,
    address_line_1: warehouse.address_line_1,
    address_line_2: warehouse.address_line_2,
    city: warehouse.city,
    state: warehouse.state,
    country: warehouse.country,
    postal_code: warehouse.postal_code,
    latitude: warehouse.latitude === null ? null : Number(warehouse.latitude),
    longitude: warehouse.longitude === null ? null : Number(warehouse.longitude),
    warehouse_type: warehouse.warehouse_type,
    status: warehouse.status,
    is_default: warehouse.is_default
  };
}

export function WarehouseForm({
  warehouse,
  mode,
  loading,
  onSubmit
}: {
  warehouse?: Warehouse;
  mode: "create" | "edit";
  loading?: boolean;
  onSubmit: (values: WarehouseFormValues) => void;
}) {
  const defaultValues = useMemo(() => warehouseToFormValues(warehouse), [warehouse]);
  const {
    control,
    register,
    handleSubmit,
    formState: { errors }
  } = useForm<WarehouseFormValues>({
    resolver: zodFormResolver(warehouseFormSchema),
    values: defaultValues
  });

  return (
    <form className="space-y-5" onSubmit={handleSubmit(onSubmit)}>
      <Card>
        <CardHeader>
          <h2 className="text-base font-bold text-gray-950">Warehouse Information</h2>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2">
          <FormField label="Seller ID" error={errors.seller_id?.message}>
            <Input {...register("seller_id")} disabled={mode === "edit"} />
          </FormField>
          <FormField label="Warehouse Code" error={errors.warehouse_code?.message}>
            <Input {...register("warehouse_code")} disabled={mode === "edit"} />
          </FormField>
          <FormField label="Warehouse Name" error={errors.warehouse_name?.message}>
            <Input {...register("warehouse_name")} />
          </FormField>
          <FormField label="Warehouse Type" error={errors.warehouse_type?.message}>
            <Select {...register("warehouse_type")} options={WAREHOUSE_TYPE_OPTIONS} />
          </FormField>
          <FormField label="Status" error={errors.status?.message}>
            <Select {...register("status")} options={WAREHOUSE_STATUS_OPTIONS} />
          </FormField>
          <FormField label="Default Warehouse">
            <Controller
              control={control}
              name="is_default"
              render={({ field }) => (
                <div className="flex h-10 items-center gap-3">
                  <Toggle checked={field.value} onClick={() => field.onChange(!field.value)} />
                  <span className="text-sm font-semibold text-gray-600">
                    {field.value ? "Default warehouse" : "Not default"}
                  </span>
                </div>
              )}
            />
          </FormField>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <h2 className="text-base font-bold text-gray-950">Contact Information</h2>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2">
          <FormField label="Contact Person" error={errors.contact_person?.message}>
            <Input {...register("contact_person")} />
          </FormField>
          <FormField label="Phone Number" error={errors.phone_number?.message}>
            <Input {...register("phone_number")} />
          </FormField>
          <FormField label="Email" error={errors.email?.message}>
            <Input type="email" {...register("email")} />
          </FormField>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <h2 className="text-base font-bold text-gray-950">Address & GPS</h2>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2">
          <FormField label="Address Line 1" error={errors.address_line_1?.message}>
            <Input {...register("address_line_1")} />
          </FormField>
          <FormField label="Address Line 2" error={errors.address_line_2?.message}>
            <Input {...register("address_line_2")} />
          </FormField>
          <FormField label="City" error={errors.city?.message}>
            <Input {...register("city")} />
          </FormField>
          <FormField label="State" error={errors.state?.message}>
            <Input {...register("state")} />
          </FormField>
          <FormField label="Country" error={errors.country?.message}>
            <Input {...register("country")} />
          </FormField>
          <FormField label="Postal Code" error={errors.postal_code?.message}>
            <Input {...register("postal_code")} />
          </FormField>
          <FormField label="Latitude" error={errors.latitude?.message}>
            <Input type="number" step="0.000001" {...register("latitude")} />
          </FormField>
          <FormField label="Longitude" error={errors.longitude?.message}>
            <Input type="number" step="0.000001" {...register("longitude")} />
          </FormField>
        </CardContent>
      </Card>

      <FormActions>
        <Button type="submit" loading={loading}>
          {mode === "create" ? "Create Warehouse" : "Save Changes"}
        </Button>
      </FormActions>
    </form>
  );
}
