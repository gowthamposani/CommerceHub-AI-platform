import { Badge } from "@/components/ui/Badge";
import { Card, CardContent, CardHeader } from "@/components/ui/Card";
import type { Seller } from "@/types/seller";
import { formatDate } from "@/utils/formatters";

function DetailItem({ label, value }: { label: string; value?: string | boolean | null }) {
  return (
    <div>
      <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">{label}</p>
      <p className="mt-1 break-words text-sm font-semibold text-gray-900">
        {value === null || value === "" ? "Not provided" : String(value)}
      </p>
    </div>
  );
}

export function SellerDetailSections({ seller }: { seller: Seller }) {
  return (
    <div className="space-y-5">
      <Card>
        <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-lg font-extrabold text-gray-950">{seller.business_name}</h2>
            <p className="text-sm text-gray-600">{seller.legal_business_name}</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Badge tone={seller.status === "active" ? "success" : seller.status === "inactive" ? "warning" : "neutral"}>
              {seller.status}
            </Badge>
            <Badge tone={seller.is_verified ? "success" : "warning"}>
              {seller.is_verified ? "Verified" : "Unverified"}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-3">
          <DetailItem label="Email" value={seller.business_email} />
          <DetailItem label="Phone" value={seller.business_phone} />
          <DetailItem label="Business Type" value={seller.business_type} />
          <DetailItem label="Website" value={seller.website} />
          <DetailItem label="Created" value={formatDate(seller.created_at)} />
          <DetailItem label="Updated" value={formatDate(seller.updated_at)} />
        </CardContent>
      </Card>

      <div className="grid gap-5 xl:grid-cols-2">
        <Card>
          <CardHeader>
            <h2 className="text-base font-bold text-gray-950">Business Address</h2>
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-2">
            <DetailItem label="Address Line 1" value={seller.address_line_1} />
            <DetailItem label="Address Line 2" value={seller.address_line_2} />
            <DetailItem label="City" value={seller.city} />
            <DetailItem label="State" value={seller.state} />
            <DetailItem label="Country" value={seller.country} />
            <DetailItem label="Postal Code" value={seller.postal_code} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <h2 className="text-base font-bold text-gray-950">Tax Information</h2>
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-2">
            <DetailItem label="GST Number" value={seller.gst_number} />
            <DetailItem label="PAN Number" value={seller.pan_number} />
            <DetailItem label="Tax ID" value={seller.tax_identification_number} />
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <h2 className="text-base font-bold text-gray-950">Bank Details</h2>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-3">
          <DetailItem label="Account Holder" value={seller.account_holder_name} />
          <DetailItem label="Bank Name" value={seller.bank_name} />
          <DetailItem label="Account Number" value={seller.account_number} />
          <DetailItem label="IFSC Code" value={seller.ifsc_code} />
          <DetailItem label="Branch" value={seller.branch_name} />
          <DetailItem label="Currency" value={seller.default_currency} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <h2 className="text-base font-bold text-gray-950">Business Description</h2>
        </CardHeader>
        <CardContent>
          <p className="text-sm leading-6 text-gray-700">{seller.description || "No description provided."}</p>
        </CardContent>
      </Card>
    </div>
  );
}
