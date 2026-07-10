import { useEffect, useMemo, useState } from "react";
import { BadgeCheck } from "lucide-react";

import { getCustomerProfile, updateCustomerProfile } from "../../api/customer";
import { getApiErrorMessage } from "../../api/error";
import { useAuth } from "../../auth/use-auth";
import { Alert, Badge, Button, Card, Field, Input, LoadingScreen, SectionHeader } from "../../components/ui";
import { formatDateTime, initials } from "../../utils/format";
import { getUserStatusTone } from "../../utils/status";
import { validateRequired } from "../../utils/validators";
import type { CustomerProfile } from "../../types/domain";

export function CustomerProfilePage(): React.ReactElement {
  const { user, updateUser } = useAuth();
  const [profile, setProfile] = useState<CustomerProfile | null>(null);
  const [firstName, setFirstName] = useState(user?.first_name ?? "");
  const [lastName, setLastName] = useState(user?.last_name ?? "");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    const load = async (): Promise<void> => {
      setLoading(true);
      setError(null);

      try {
        const nextProfile = await getCustomerProfile();
        if (!cancelled) {
          setProfile(nextProfile);
          setFirstName(nextProfile.first_name);
          setLastName(nextProfile.last_name);
        }
      } catch (requestError) {
        if (!cancelled) {
          setError(getApiErrorMessage(requestError, "Unable to load your profile right now."));
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    void load();

    return () => {
      cancelled = true;
    };
  }, []);

  const validationErrors = useMemo(
    () => ({
      firstName: validateRequired(firstName, "First name"),
      lastName: validateRequired(lastName, "Last name")
    }),
    [firstName, lastName]
  );

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>): Promise<void> => {
    event.preventDefault();
    setSubmitted(true);
    setMessage(null);
    setError(null);

    const nextError = validateRequired(firstName, "First name") ?? validateRequired(lastName, "Last name");
    if (nextError) {
      setError(nextError);
      return;
    }

    try {
      setSaving(true);
      const nextProfile = await updateCustomerProfile({
        first_name: firstName.trim(),
        last_name: lastName.trim()
      });
      setProfile(nextProfile);
      updateUser({
        first_name: nextProfile.first_name,
        last_name: nextProfile.last_name,
        full_name: nextProfile.full_name
      });
      setMessage("Profile updated successfully.");
    } catch (requestError) {
      setError(getApiErrorMessage(requestError, "Could not update your profile."));
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <LoadingScreen title="Loading profile" description="Retrieving your customer profile and account details." />
    );
  }

  const currentProfile = profile ?? user;

  return (
    <div className="space-y-6">
      <SectionHeader
        eyebrow="Profile"
        title="Customer profile"
        description="Keep your personal details current so orders, notifications, and support stay aligned."
      />

      {message ? (
        <Alert tone="success" title="Profile updated">
          {message}
        </Alert>
      ) : null}
      {error ? (
        <Alert tone="danger" title="Profile error">
          {error}
        </Alert>
      ) : null}

      <div className="grid gap-6 lg:grid-cols-[0.75fr_1.25fr]">
        <Card className="space-y-5 p-6">
          <div className="flex items-center gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-3xl bg-brand-primary text-xl font-semibold text-white shadow-soft">
              {initials(currentProfile?.first_name, currentProfile?.last_name)}
            </div>
            <div>
              <p className="text-sm font-semibold text-brand-text">{currentProfile?.full_name ?? "Customer"}</p>
              <p className="mt-1 text-xs text-brand-muted">Account identity</p>
            </div>
          </div>

          <div className="space-y-3">
            <Card className="p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-brand-muted">Email</p>
              <p className="mt-2 text-sm font-semibold text-brand-text">{currentProfile?.email}</p>
            </Card>
            <Card className="p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-brand-muted">Status</p>
              {currentProfile?.status ? (
                <Badge tone={getUserStatusTone(currentProfile.status)} className="mt-2">
                  {currentProfile.status.replace(/_/g, " ")}
                </Badge>
              ) : null}
            </Card>
            <Card className="p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-brand-muted">Last login</p>
              <p className="mt-2 text-sm font-semibold text-brand-text">
                {currentProfile?.last_login_at ? formatDateTime(currentProfile.last_login_at) : "No login yet"}
              </p>
            </Card>
          </div>
        </Card>

        <Card className="space-y-5 p-6">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-brand-muted">Edit details</p>
            <h2 className="mt-2 text-2xl font-semibold text-brand-text">Update your name</h2>
          </div>

          <form className="space-y-4" onSubmit={handleSubmit}>
            <Field
              label="First name"
              htmlFor="profile-first-name"
              error={submitted ? validationErrors.firstName : null}
              required
            >
              <Input
                id="profile-first-name"
                value={firstName}
                onChange={(event) => setFirstName(event.target.value)}
                placeholder="First name"
              />
            </Field>

            <Field
              label="Last name"
              htmlFor="profile-last-name"
              error={submitted ? validationErrors.lastName : null}
              required
            >
              <Input
                id="profile-last-name"
                value={lastName}
                onChange={(event) => setLastName(event.target.value)}
                placeholder="Last name"
              />
            </Field>

            <Button type="submit" fullWidth disabled={saving}>
              <BadgeCheck className="h-4 w-4" />
              Save profile
            </Button>
          </form>

          <div className="grid gap-3 sm:grid-cols-2">
            <Card className="p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-brand-muted">Role</p>
              <p className="mt-2 text-sm font-semibold text-brand-text">{currentProfile?.role.name ?? "customer"}</p>
            </Card>
            <Card className="p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-brand-muted">Addresses</p>
              <p className="mt-2 text-sm font-semibold text-brand-text">{currentProfile?.addresses?.length ?? 0}</p>
            </Card>
          </div>
        </Card>
      </div>
    </div>
  );
}
