"use client";

import { useEffect, useState } from "react";

import {
  Button,
  Divider,
  ErrorState,
  Field,
  Input,
  LoadingState,
  Select,
  Text,
  Textarea,
  useToast,
} from "@/design-system";
import { ApiError } from "@/lib/api/client";
import {
  getAccountOverview,
  updateProfile,
  type AccountProfile,
  type ProfileInput,
} from "@/lib/api/account";
import { useAuth } from "@/context/AuthContext";

/**
 * The customer's own details.
 *
 * Name and email are shown but not editable here: both are identity fields the
 * auth system owns, and letting this form appear to change them when the API
 * will not is worse than saying so.
 *
 * Read through the account overview rather than /profiles, because a customer
 * who has never saved a profile has no profile document -- the overview merges
 * the two and always answers.
 */
export function ProfileForm() {
  const { toast } = useToast();
  const { user } = useAuth();

  const [profile, setProfile] = useState<AccountProfile | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [draft, setDraft] = useState<ProfileInput>({});
  const [saving, setSaving] = useState(false);

  function load() {
    setError(null);
    getAccountOverview()
      .then(({ profile: data }) => {
        setProfile(data);
        setDraft({
          phone: data.phone ?? "",
          gender: data.gender ?? "",
          // The API returns a timestamp; the date input wants YYYY-MM-DD.
          dateOfBirth: data.dateOfBirth
            ? String(data.dateOfBirth).slice(0, 10)
            : "",
          bio: data.bio ?? "",
        });
      })
      .catch(() => setError("We could not load your profile just now."));
  }

  useEffect(load, []);

  async function save() {
    setSaving(true);
    try {
      await updateProfile({
        ...draft,
        // An empty date must clear the field, not be sent as "".
        dateOfBirth: draft.dateOfBirth ? draft.dateOfBirth : null,
      });
      toast("Profile saved.", { tone: "success" });
      load();
    } catch (e: unknown) {
      toast(
        e instanceof ApiError ? e.message : "We could not save your profile.",
        { tone: "error" }
      );
    } finally {
      setSaving(false);
    }
  }

  if (error) {
    return (
      <ErrorState
        title="Profile unavailable"
        description={error}
        retryLabel="Try again"
        onRetry={load}
      />
    );
  }

  if (!profile) return <LoadingState label="Loading your profile" />;

  return (
    <div className="flex max-w-[520px] flex-col gap-8">
      <h2 className="font-display text-mak-display font-extrabold tracking-[-0.02em] text-mak-ink">
        Profile
      </h2>

      <div className="border-2 border-mak-divider p-5">
        <dl className="flex flex-col gap-3">
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <dt className="text-mak-small text-mak-muted">Name</dt>
            <dd className="text-mak-small text-mak-ink">
              {profile.name || user?.name || "—"}
            </dd>
          </div>
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <dt className="text-mak-small text-mak-muted">Email</dt>
            <dd className="text-mak-small text-mak-ink">{profile.email}</dd>
          </div>
        </dl>
        <Text size="label" tone="subtle" className="mt-4">
          Your name and email are part of your sign-in and cannot be changed
          here. Contact us to update them.
        </Text>
      </div>

      <div className="flex flex-col gap-5">
        <Field
          label="Phone"
          hint="Used by the courier when a delivery needs a call."
        >
          <Input
            value={draft.phone ?? ""}
            type="tel"
            autoComplete="tel"
            onChange={(e) => setDraft({ ...draft, phone: e.target.value })}
          />
        </Field>

        <Field label="Date of birth">
          <Input
            value={draft.dateOfBirth ?? ""}
            type="date"
            onChange={(e) => setDraft({ ...draft, dateOfBirth: e.target.value })}
          />
        </Field>

        <Field label="Gender">
          <Select
            value={draft.gender ?? ""}
            onChange={(e) => setDraft({ ...draft, gender: e.target.value })}
          >
            <option value="">Prefer not to say</option>
            <option value="female">Female</option>
            <option value="male">Male</option>
            <option value="other">Other</option>
          </Select>
        </Field>

        <Field label="About you">
          <Textarea
            value={draft.bio ?? ""}
            rows={3}
            onChange={(e) => setDraft({ ...draft, bio: e.target.value })}
          />
        </Field>
      </div>

      <Divider weight="hairline" />

      <div>
        <Button onClick={() => void save()} disabled={saving}>
          {saving ? "Saving…" : "Save profile"}
        </Button>
      </div>
    </div>
  );
}
