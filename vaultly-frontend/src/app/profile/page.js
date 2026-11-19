"use client";

import { useState, useEffect } from "react";
import { Pencil } from "lucide-react";
import { getCurrentUser, updateUser } from "../../lib/api";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import Navigation from "../../components/Navigation";
import Button from "../../components/ui/Button";
import Card from "../../components/ui/Card";
import Field from "../../components/ui/Field";
import Select from "../../components/ui/Select";
import PageHeader from "../../components/ui/PageHeader";
import Skeleton from "../../components/ui/Skeleton";
import Avatar from "../../components/ui/Avatar";
import { usePreferences } from "../../lib/preferences";
import { CURRENCIES, formatMoney } from "../../lib/money";

export default function ProfilePage() {
  const [user, setUser] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({ full_name: "", email: "" });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const { currency, setCurrency, hideAmounts, setHideAmounts } = usePreferences();
  const router = useRouter();

  useEffect(() => {
    let isMounted = true;
    async function fetchData() {
      const userResponse = await getCurrentUser();
      if (!isMounted) return;
      if (userResponse?.error || !userResponse?.user) {
        toast.error("Your session has ended. Please sign in again.");
        router.push("/login");
      } else {
        setUser(userResponse.user);
        setFormData({
          full_name: userResponse.user.full_name || "",
          email: userResponse.user.email || "",
        });
        setLoading(false);
      }
    }
    fetchData();
    return () => {
      isMounted = false;
    };
  }, [router]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    const next = {};
    if (!formData.full_name.trim()) next.full_name = "Enter your name";
    if (!formData.email.trim()) next.email = "Enter your email";
    setErrors(next);
    if (Object.keys(next).length) return;

    setIsSaving(true);
    try {
      const response = await updateUser(user.id, formData);
      if (response?.error) {
        setErrors({ submit: response.error });
      } else if (response?.user) {
        setUser(response.user);
        setIsEditing(false);
        toast.success("Details saved");
      }
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setFormData({ full_name: user?.full_name || "", email: user?.email || "" });
    setErrors({});
    setIsEditing(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen">
        <Navigation />
        <main id="main-content" className="mx-auto max-w-3xl space-y-6 px-4 pt-8 sm:px-6 lg:px-8" aria-busy="true">
          <Skeleton className="h-9 w-40" />
          <Skeleton className="h-48 rounded-surface" />
          <Skeleton className="h-48 rounded-surface" />
        </main>
      </div>
    );
  }

  const createdDate = user?.createdAt ? new Date(user.createdAt) : null;
  const memberSince = createdDate && !isNaN(createdDate.getTime())
    ? createdDate.toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })
    : null;

  return (
    <div className="min-h-screen">
      <Navigation />

      <main id="main-content" className="mx-auto max-w-3xl space-y-6 px-4 pb-16 pt-8 sm:px-6 lg:px-8">
        <PageHeader title="Profile and settings" />

        <Card
          title="Personal details"
          actions={
            !isEditing && (
              <Button variant="secondary" onClick={() => setIsEditing(true)}>
                <Pencil size={16} aria-hidden="true" />
                Edit
              </Button>
            )
          }
        >
          {isEditing ? (
            <form onSubmit={handleSave} className="space-y-4" noValidate>
              {errors.submit && (
                <p role="alert" className="rounded-control border border-red-200 bg-red-50 px-3 py-2 text-ui text-negative">
                  {errors.submit}
                </p>
              )}
              <Field label="Name" name="full_name" autoComplete="name" value={formData.full_name} onChange={handleInputChange} error={errors.full_name} autoFocus required />
              <Field label="Email" name="email" type="email" autoComplete="email" value={formData.email} onChange={handleInputChange} error={errors.email} required />
              <div className="flex justify-end gap-2 pt-2">
                <Button variant="ghost" onClick={handleCancel}>Cancel</Button>
                <Button type="submit" loading={isSaving}>Save details</Button>
              </div>
            </form>
          ) : (
            <div className="flex items-start gap-4">
              <Avatar name={user?.full_name || user?.email} />
              <dl className="grid flex-1 gap-4 sm:grid-cols-2">
                <div>
                  <dt className="text-ui text-ink-3">Name</dt>
                  <dd className="mt-0.5 text-body text-ink">{user?.full_name}</dd>
                </div>
                <div className="min-w-0">
                  <dt className="text-ui text-ink-3">Email</dt>
                  <dd className="mt-0.5 truncate text-body text-ink">{user?.email}</dd>
                </div>
                {memberSince && (
                  <div>
                    <dt className="text-ui text-ink-3">Member since</dt>
                    <dd className="mt-0.5 text-body text-ink">{memberSince}</dd>
                  </div>
                )}
              </dl>
            </div>
          )}
        </Card>

        <Card title="Display" description="Saved in this browser only.">
          <div className="space-y-6">
            <Select
              label="Currency"
              value={currency}
              onChange={(e) => setCurrency(e.target.value)}
              options={CURRENCIES.map((c) => ({ value: c.code, label: `${c.label} (${c.code})` }))}
              hint={`Amounts show like ${formatMoney(1234.5, { currency })}. This changes the symbol and format only; nothing is converted.`}
              className="max-w-sm"
            />

            <div className="flex items-start justify-between gap-6 border-t border-line pt-5">
              <div>
                <p id="hide-amounts-label" className="text-ui font-medium text-ink">Hide amounts</p>
                <p id="hide-amounts-hint" className="mt-0.5 text-ui text-ink-3">
                  Replaces every amount with dots, for using Vaultly where others can see your screen.
                </p>
              </div>
              <button
                type="button"
                role="switch"
                aria-checked={hideAmounts}
                aria-labelledby="hide-amounts-label"
                aria-describedby="hide-amounts-hint"
                onClick={() => setHideAmounts(!hideAmounts)}
                className={`relative mt-0.5 inline-flex h-7 w-12 shrink-0 items-center rounded-full transition-colors ${hideAmounts ? "bg-brand" : "bg-line-strong"}`}
              >
                <span className={`inline-block h-5 w-5 rounded-full bg-white shadow transition-transform ${hideAmounts ? "translate-x-6" : "translate-x-1"}`} />
              </button>
            </div>
          </div>
        </Card>
      </main>
    </div>
  );
}
