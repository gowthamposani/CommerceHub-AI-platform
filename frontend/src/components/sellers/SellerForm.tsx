import { useMemo } from "react";
import { useForm } from "react-hook-form";

import { FormActions } from "@/components/forms/FormActions";
import { FormField } from "@/components/forms/FormField";
import { zodFormResolver } from "@/components/forms/formResolver";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader } from "@/components/ui/Card";
import { Checkbox } from "@/components/ui/Checkbox";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Textarea } from "@/components/ui/Textarea";
import { SELLER_BUSINESS_TYPE_OPTIONS } from "@/constants/seller";
import { sellerFormSchema, type SellerFormValues } from "@/components/sellers/sellerValidation";
import type { Seller } from "@/types/seller";

const emptyDefaults: SellerFormValues = {
  user_id: "",
  business_name: "",
  legal_business_name: "",
  business_type: "private_limited",
  business_email: "",
  business_phone: "",
  gst_number: "",
  pan_number: "",
  tax_identification_number: "",
  website: "",
  logo_url: "",
  description: "",
  address_line_1: "",
  address_line_2: "",
  city: "",
  state: "",
  country: "India",
  postal_code: "",
  account_holder_name: "",
  bank_name: "",
  account_number: "",
  ifsc_code: "",
  branch_name: "",
  default_currency: "INR",
  notifications_enabled: true,
  order_auto_accept_enabled: false
};

function sellerToFormValues(seller?: Seller): SellerFormValues {
  if (!seller) {
    return emptyDefaults;
  }

  return {
    user_id: seller.user_id,
    business_name: seller.business_name,
    legal_business_name: seller.legal_business_name ?? "",
    business_type: seller.business_type,
    business_email: seller.business_email,
    business_phone: seller.business_phone,
    gst_number: seller.gst_number,
    pan_number: seller.pan_number,
    tax_identification_number: seller.tax_identification_number ?? "",
    website: seller.website ?? "",
    logo_url: seller.logo_url ?? "",
    description: seller.description ?? "",
    address_line_1: seller.address_line_1,
    address_line_2: seller.address_line_2 ?? "",
    city: seller.city,
    state: seller.state,
    country: seller.country,
    postal_code: seller.postal_code,
    account_holder_name: seller.account_holder_name,
    bank_name: seller.bank_name,
    account_number: seller.account_number,
    ifsc_code: seller.ifsc_code,
    branch_name: seller.branch_name ?? "",
    default_currency: seller.default_currency,
    notifications_enabled: seller.notifications_enabled,
    order_auto_accept_enabled: seller.order_auto_accept_enabled
  };
}

export function SellerForm({
  seller,
  mode,
  loading,
  onSubmit
}: {
  seller?: Seller;
  mode: "create" | "edit";
  loading?: boolean;
  onSubmit: (values: SellerFormValues) => void;
}) {
  const defaultValues = useMemo(() => sellerToFormValues(seller), [seller]);
  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm<SellerFormValues>({
    resolver: zodFormResolver(sellerFormSchema),
    values: defaultValues
  });

  return (
    <form className="space-y-5" onSubmit={handleSubmit(onSubmit)}>
      <Card>
        <CardHeader>
          <h2 className="text-base font-bold text-gray-950">Business Information</h2>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2">
          {mode === "create" ? (
            <FormField label="Auth User ID" error={errors.user_id?.message}>
              <Input {...register("user_id")} placeholder="00000000-0000-0000-0000-000000000000" />
            </FormField>
          ) : null}
          <FormField label="Business Name" error={errors.business_name?.message}>
            <Input {...register("business_name")} />
          </FormField>
          <FormField label="Legal Business Name" error={errors.legal_business_name?.message}>
            <Input {...register("legal_business_name")} />
          </FormField>
          <FormField label="Business Type" error={errors.business_type?.message}>
            <Select {...register("business_type")} options={SELLER_BUSINESS_TYPE_OPTIONS} />
          </FormField>
          <FormField label="Business Email" error={errors.business_email?.message}>
            <Input type="email" {...register("business_email")} />
          </FormField>
          <FormField label="Business Phone" error={errors.business_phone?.message}>
            <Input {...register("business_phone")} />
          </FormField>
          <FormField label="Website" error={errors.website?.message}>
            <Input type="url" {...register("website")} />
          </FormField>
          <FormField label="Logo URL" error={errors.logo_url?.message}>
            <Input type="url" {...register("logo_url")} />
          </FormField>
          <FormField label="Description" error={errors.description?.message}>
            <Textarea {...register("description")} />
          </FormField>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <h2 className="text-base font-bold text-gray-950">Business Address</h2>
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
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <h2 className="text-base font-bold text-gray-950">Tax Information</h2>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-3">
          <FormField label="GST Number" error={errors.gst_number?.message}>
            <Input {...register("gst_number")} />
          </FormField>
          <FormField label="PAN Number" error={errors.pan_number?.message}>
            <Input {...register("pan_number")} />
          </FormField>
          <FormField label="Tax Identification Number" error={errors.tax_identification_number?.message}>
            <Input {...register("tax_identification_number")} />
          </FormField>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <h2 className="text-base font-bold text-gray-950">Bank Details</h2>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2">
          <FormField label="Account Holder Name" error={errors.account_holder_name?.message}>
            <Input {...register("account_holder_name")} />
          </FormField>
          <FormField label="Bank Name" error={errors.bank_name?.message}>
            <Input {...register("bank_name")} />
          </FormField>
          <FormField label="Account Number" error={errors.account_number?.message}>
            <Input {...register("account_number")} />
          </FormField>
          <FormField label="IFSC Code" error={errors.ifsc_code?.message}>
            <Input {...register("ifsc_code")} />
          </FormField>
          <FormField label="Branch Name" error={errors.branch_name?.message}>
            <Input {...register("branch_name")} />
          </FormField>
          <FormField label="Default Currency" error={errors.default_currency?.message}>
            <Input {...register("default_currency")} />
          </FormField>
          <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
            <Checkbox {...register("notifications_enabled")} />
            Notifications Enabled
          </label>
          <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
            <Checkbox {...register("order_auto_accept_enabled")} />
            Auto Accept Orders
          </label>
        </CardContent>
      </Card>

      <FormActions>
        <Button type="submit" loading={loading}>
          {mode === "create" ? "Create Seller" : "Save Changes"}
        </Button>
      </FormActions>
    </form>
  );
}
