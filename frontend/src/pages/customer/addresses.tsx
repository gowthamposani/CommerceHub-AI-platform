import { useEffect, useMemo, useState } from "react";
import { MapPinned, Plus, Star, Trash2, Pencil, CheckCircle2 } from "lucide-react";

import {
  createCustomerAddress,
  deleteCustomerAddress,
  listCustomerAddresses,
  setDefaultCustomerAddress,
  updateCustomerAddress
} from "../../api/customer";
import { getApiErrorMessage } from "../../api/error";
import {
  Alert,
  Badge,
  Button,
  Card,
  EmptyState,
  Field,
  Input,
  LoadingScreen,
  SectionHeader
} from "../../components/ui";
import { formatDateTime } from "../../utils/format";
import { validatePhone, validateRequired } from "../../utils/validators";
import type { Address, AddressCreatePayload, AddressUpdatePayload } from "../../types/domain";

interface AddressFormState {
  address_line_1: string;
  address_line_2: string;
  city: string;
  state: string;
  postal_code: string;
  country: string;
  phone_number: string;
  is_default: boolean;
}

const emptyForm: AddressFormState = {
  address_line_1: "",
  address_line_2: "",
  city: "",
  state: "",
  postal_code: "",
  country: "United States",
  phone_number: "",
  is_default: false
};

export function AddressManagementPage(): React.ReactElement {
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editingAddressId, setEditingAddressId] = useState<string | null>(null);
  const [form, setForm] = useState<AddressFormState>(emptyForm);
  const [submitted, setSubmitted] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const loadAddresses = async (): Promise<void> => {
    setLoading(true);
    setError(null);

    try {
      setAddresses(await listCustomerAddresses());
    } catch (requestError) {
      setError(getApiErrorMessage(requestError, "Unable to load your addresses right now."));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadAddresses();
  }, []);

  const validationErrors = useMemo(
    () => ({
      address_line_1: validateRequired(form.address_line_1, "Address line 1"),
      city: validateRequired(form.city, "City"),
      state: validateRequired(form.state, "State"),
      postal_code: validateRequired(form.postal_code, "Postal code"),
      country: validateRequired(form.country, "Country"),
      phone_number: validatePhone(form.phone_number)
    }),
    [form]
  );

  const startCreate = (): void => {
    setEditingAddressId(null);
    setForm(emptyForm);
    setSubmitted(false);
    setMessage(null);
    setError(null);
  };

  const startEdit = (address: Address): void => {
    setEditingAddressId(address.id);
    setForm({
      address_line_1: address.address_line_1,
      address_line_2: address.address_line_2 ?? "",
      city: address.city,
      state: address.state,
      postal_code: address.postal_code,
      country: address.country,
      phone_number: address.phone_number ?? "",
      is_default: address.is_default
    });
    setSubmitted(false);
    setMessage(null);
    setError(null);
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>): Promise<void> => {
    event.preventDefault();
    setSubmitted(true);
    setMessage(null);
    setError(null);

    const nextError =
      validationErrors.address_line_1 ??
      validationErrors.city ??
      validationErrors.state ??
      validationErrors.postal_code ??
      validationErrors.country ??
      validationErrors.phone_number;

    if (nextError) {
      setError(nextError);
      return;
    }

    const payload: AddressCreatePayload | AddressUpdatePayload = {
      address_line_1: form.address_line_1.trim(),
      address_line_2: form.address_line_2.trim() || null,
      city: form.city.trim(),
      state: form.state.trim(),
      postal_code: form.postal_code.trim(),
      country: form.country.trim(),
      phone_number: form.phone_number.trim() || null,
      ...(editingAddressId ? {} : { is_default: form.is_default })
    };

    try {
      setSaving(true);
      if (editingAddressId) {
        await updateCustomerAddress(editingAddressId, payload as AddressUpdatePayload);
        setMessage("Address updated successfully.");
      } else {
        await createCustomerAddress(payload as AddressCreatePayload);
        setMessage("Address created successfully.");
      }
      await loadAddresses();
      startCreate();
    } catch (requestError) {
      setError(getApiErrorMessage(requestError, "Could not save this address."));
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (addressId: string): Promise<void> => {
    if (!window.confirm("Delete this address?")) {
      return;
    }

    setSaving(true);
    setMessage(null);
    setError(null);

    try {
      await deleteCustomerAddress(addressId);
      await loadAddresses();
      setMessage("Address deleted successfully.");
    } catch (requestError) {
      setError(getApiErrorMessage(requestError, "Could not delete this address."));
    } finally {
      setSaving(false);
    }
  };

  const handleSetDefault = async (addressId: string): Promise<void> => {
    setSaving(true);
    setMessage(null);
    setError(null);

    try {
      await setDefaultCustomerAddress(addressId);
      await loadAddresses();
      setMessage("Default address updated.");
    } catch (requestError) {
      setError(getApiErrorMessage(requestError, "Could not update the default address."));
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <LoadingScreen title="Loading addresses" description="Retrieving your saved delivery locations." />;
  }

  return (
    <div className="space-y-6">
      <SectionHeader
        eyebrow="Addresses"
        title="Manage delivery locations"
        description="Customers can save multiple addresses, but only one should be marked as the default at any time."
        action={
          <Button variant="secondary" onClick={startCreate}>
            <Plus className="h-4 w-4" />
            New address
          </Button>
        }
      />

      {message ? (
        <Alert tone="success" title="Address updated">
          {message}
        </Alert>
      ) : null}
      {error ? (
        <Alert tone="danger" title="Address error">
          {error}
        </Alert>
      ) : null}

      <div className="grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
        <Card className="space-y-5 p-6">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.24em] text-brand-muted">Saved addresses</p>
              <h2 className="mt-2 text-2xl font-semibold text-brand-text">{addresses.length} locations</h2>
            </div>
            <MapPinned className="h-6 w-6 text-brand-primaryDark" />
          </div>

          {addresses.length === 0 ? (
            <EmptyState
              icon={<MapPinned className="h-8 w-8" />}
              title="No addresses saved yet"
              description="Create your first delivery location to speed up future checkouts."
              action={<Button onClick={startCreate}>Add address</Button>}
            />
          ) : (
            <div className="space-y-4">
              {addresses.map((address) => (
                <Card key={address.id} className="space-y-4 p-4">
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div className="space-y-2">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="text-sm font-semibold text-brand-text">{address.address_line_1}</p>
                        {address.is_default ? <Badge tone="primary">Default</Badge> : null}
                      </div>
                      <p className="text-sm leading-6 text-brand-muted">
                        {address.address_line_2 ? `${address.address_line_2}, ` : ""}
                        {address.city}, {address.state} {address.postal_code}
                        <br />
                        {address.country}
                        {address.phone_number ? ` · ${address.phone_number}` : ""}
                      </p>
                      <p className="text-xs text-brand-muted">Updated {formatDateTime(address.updated_at)}</p>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      {!address.is_default ? (
                        <Button
                          variant="secondary"
                          className="px-3 py-2"
                          onClick={() => void handleSetDefault(address.id)}
                        >
                          <Star className="h-4 w-4" />
                          Default
                        </Button>
                      ) : null}
                      <Button variant="secondary" className="px-3 py-2" onClick={() => startEdit(address)}>
                        <Pencil className="h-4 w-4" />
                        Edit
                      </Button>
                      <Button variant="danger" className="px-3 py-2" onClick={() => void handleDelete(address.id)}>
                        <Trash2 className="h-4 w-4" />
                        Delete
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </Card>

        <Card className="space-y-5 p-6">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-brand-muted">
              {editingAddressId ? "Edit address" : "Create address"}
            </p>
            <h2 className="mt-2 text-2xl font-semibold text-brand-text">
              {editingAddressId ? "Update delivery details" : "Add a new delivery address"}
            </h2>
          </div>

          <form className="space-y-4" onSubmit={handleSubmit}>
            <Field
              label="Address line 1"
              htmlFor="address-line-1"
              error={submitted ? validationErrors.address_line_1 : null}
              required
            >
              <Input
                id="address-line-1"
                value={form.address_line_1}
                onChange={(event) => setForm((current) => ({ ...current, address_line_1: event.target.value }))}
                placeholder="123 Commerce Street"
              />
            </Field>

            <Field label="Address line 2" htmlFor="address-line-2">
              <Input
                id="address-line-2"
                value={form.address_line_2}
                onChange={(event) => setForm((current) => ({ ...current, address_line_2: event.target.value }))}
                placeholder="Suite, floor, apartment"
              />
            </Field>

            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="City" htmlFor="address-city" error={submitted ? validationErrors.city : null} required>
                <Input
                  id="address-city"
                  value={form.city}
                  onChange={(event) => setForm((current) => ({ ...current, city: event.target.value }))}
                  placeholder="Austin"
                />
              </Field>
              <Field label="State" htmlFor="address-state" error={submitted ? validationErrors.state : null} required>
                <Input
                  id="address-state"
                  value={form.state}
                  onChange={(event) => setForm((current) => ({ ...current, state: event.target.value }))}
                  placeholder="Texas"
                />
              </Field>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <Field
                label="Postal code"
                htmlFor="address-postal"
                error={submitted ? validationErrors.postal_code : null}
                required
              >
                <Input
                  id="address-postal"
                  value={form.postal_code}
                  onChange={(event) => setForm((current) => ({ ...current, postal_code: event.target.value }))}
                  placeholder="73301"
                />
              </Field>
              <Field
                label="Country"
                htmlFor="address-country"
                error={submitted ? validationErrors.country : null}
                required
              >
                <Input
                  id="address-country"
                  value={form.country}
                  onChange={(event) => setForm((current) => ({ ...current, country: event.target.value }))}
                  placeholder="United States"
                />
              </Field>
            </div>

            <Field
              label="Phone number"
              htmlFor="address-phone"
              error={submitted ? validationErrors.phone_number : null}
            >
              <Input
                id="address-phone"
                value={form.phone_number}
                onChange={(event) => setForm((current) => ({ ...current, phone_number: event.target.value }))}
                placeholder="+1 512 555 0100"
              />
            </Field>

            {!editingAddressId ? (
              <label className="flex items-center gap-3 rounded-2xl border border-brand-border bg-brand-secondary/40 px-4 py-3 text-sm">
                <input
                  type="checkbox"
                  className="h-4 w-4 rounded border-brand-border text-brand-primary focus:ring-brand-primary"
                  checked={form.is_default}
                  onChange={(event) => setForm((current) => ({ ...current, is_default: event.target.checked }))}
                />
                <span className="font-medium text-brand-text">Make this the default address</span>
              </label>
            ) : null}

            <div className="flex flex-wrap gap-3">
              <Button type="submit" disabled={saving}>
                <CheckCircle2 className="h-4 w-4" />
                {editingAddressId ? "Update address" : "Save address"}
              </Button>
              {editingAddressId ? (
                <Button variant="secondary" type="button" onClick={startCreate}>
                  Cancel edit
                </Button>
              ) : null}
            </div>
          </form>
        </Card>
      </div>
    </div>
  );
}
