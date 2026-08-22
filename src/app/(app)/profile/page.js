"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  User as UserIcon,
  Mail,
  Phone,
  MapPin,
  Globe,
  Camera,
  Save,
  LogOut,
  Heart,
  X,
  ShieldCheck,
  CalendarDays,
} from "lucide-react";
import Button from "@/components/ui/Button";
import Badge from "@/components/ui/Badge";
import Avatar from "@/components/ui/Avatar";
import Select from "@/components/ui/Select";
import { Field } from "@/components/ui/Input";
import { PageLoader } from "@/components/ui/Loading";
import { useToast } from "@/components/ui/Toast";
import { formatDate } from "@/lib/utils";
import api from "@/lib/api";

const LANGUAGES = ["English", "Spanish", "French", "German", "Hindi", "Mandarin", "Japanese", "Arabic", "Portuguese", "Italian"];

export default function ProfilePage() {
  const router = useRouter();
  const toast = useToast();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState(null);

  useEffect(() => {
    api
      .get("/api/profile")
      .then((d) => {
        setUser(d.user);
        setForm({
          firstName: d.user.firstName || "",
          lastName: d.user.lastName || "",
          phone: d.user.phone || "",
          city: d.user.city || "",
          country: d.user.country || "",
          language: d.user.language || "English",
          additionalInfo: d.user.additionalInfo || "",
          photo: d.user.photo || "",
          savedDestinations: d.user.savedDestinations || [],
        });
      })
      .catch(() => toast.error("Could not load your profile"))
      .finally(() => setLoading(false));
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const set = (patch) => setForm((f) => ({ ...f, ...patch }));

  function onPhoto(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 1.5 * 1024 * 1024) return toast.error("Image must be under 1.5MB");
    const reader = new FileReader();
    reader.onload = () => set({ photo: reader.result });
    reader.readAsDataURL(file);
  }

  async function save(e) {
    e?.preventDefault();
    setSaving(true);
    try {
      const { user: updated } = await api.put("/api/profile", form);
      setUser(updated);
      toast.success("Profile updated");
    } catch (err) {
      toast.error(err.message || "Could not save");
    } finally {
      setSaving(false);
    }
  }

  function removeDestination(name) {
    set({ savedDestinations: form.savedDestinations.filter((d) => d !== name) });
  }

  async function logout() {
    try {
      await api.post("/api/auth/logout", {});
    } catch {}
    router.push("/login");
    router.refresh();
  }

  if (loading || !form) return <PageLoader label="Loading your profile…" />;

  const fullName = `${form.firstName} ${form.lastName}`.trim() || user?.name || "Traveler";

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <h1 className="flex items-center gap-2 font-display text-2xl font-extrabold text-ink-900">
        <UserIcon className="h-6 w-6 text-brand-500" /> Profile & Settings
      </h1>

      {/* Identity card */}
      <div className="card overflow-hidden">
        <div className="h-24 bg-hero-gradient" />
        <div className="flex flex-col items-center px-6 pb-6 sm:flex-row sm:items-end sm:gap-5">
          <div className="relative -mt-12">
            <Avatar name={fullName} src={form.photo} size="xl" className="ring-4 ring-white" />
            <label className="absolute bottom-1 right-1 cursor-pointer rounded-full bg-brand-500 p-2 text-white shadow-soft hover:bg-brand-600">
              <Camera className="h-4 w-4" />
              <input type="file" accept="image/*" onChange={onPhoto} className="hidden" />
            </label>
          </div>
          <div className="mt-3 flex-1 text-center sm:mt-0 sm:pb-2 sm:text-left">
            <div className="flex flex-wrap items-center justify-center gap-2 sm:justify-start">
              <h2 className="font-display text-xl font-bold text-ink-900">{fullName}</h2>
              {user?.role === "admin" && <Badge tone="coral"><ShieldCheck className="h-3.5 w-3.5" /> Admin</Badge>}
            </div>
            <p className="flex items-center justify-center gap-1.5 text-sm text-ink-500 sm:justify-start">
              <Mail className="h-4 w-4" /> {user?.email}
            </p>
          </div>
          <div className="mt-3 text-center text-xs text-ink-400 sm:mt-0 sm:pb-2 sm:text-right">
            <p className="inline-flex items-center gap-1.5"><CalendarDays className="h-3.5 w-3.5" /> Joined {formatDate(user?.createdAt)}</p>
          </div>
        </div>
      </div>

      {/* Personal info */}
      <form onSubmit={save} className="card space-y-5 p-6">
        <h3 className="font-display text-lg font-bold text-ink-900">Personal information</h3>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="First name">
            <input value={form.firstName} onChange={(e) => set({ firstName: e.target.value })} className="input" />
          </Field>
          <Field label="Last name">
            <input value={form.lastName} onChange={(e) => set({ lastName: e.target.value })} className="input" />
          </Field>
          <Field label="Phone">
            <div className="relative">
              <Phone className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-400" />
              <input value={form.phone} onChange={(e) => set({ phone: e.target.value })} className="input pl-9" placeholder="+1 555 000 1234" />
            </div>
          </Field>
          <Field label="Preferred language">
            <div className="relative">
              <Globe className="pointer-events-none absolute left-3 top-1/2 z-10 h-4 w-4 -translate-y-1/2 text-ink-400" />
              <Select value={form.language} onChange={(e) => set({ language: e.target.value })} className="pl-9">
                {LANGUAGES.map((l) => <option key={l}>{l}</option>)}
              </Select>
            </div>
          </Field>
          <Field label="City">
            <div className="relative">
              <MapPin className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-400" />
              <input value={form.city} onChange={(e) => set({ city: e.target.value })} className="input pl-9" placeholder="Where you're based" />
            </div>
          </Field>
          <Field label="Country">
            <input value={form.country} onChange={(e) => set({ country: e.target.value })} className="input" />
          </Field>
        </div>
        <Field label="About you" hint="A short bio that shows on your community posts.">
          <textarea rows={3} value={form.additionalInfo} onChange={(e) => set({ additionalInfo: e.target.value })} className="input resize-none" placeholder="Tell fellow travelers about yourself…" />
        </Field>

        <div className="flex justify-end border-t border-ink-100 pt-5">
          <Button type="submit" disabled={saving}>
            <Save className="h-4 w-4" /> {saving ? "Saving…" : "Save changes"}
          </Button>
        </div>
      </form>

      {/* Saved destinations */}
      <div className="card p-6">
        <h3 className="flex items-center gap-2 font-display text-lg font-bold text-ink-900">
          <Heart className="h-5 w-5 text-coral-500" /> Saved destinations
        </h3>
        {form.savedDestinations.length === 0 ? (
          <p className="mt-2 text-sm text-ink-400">You haven&apos;t saved any destinations yet. Tap the heart on any city to save it here.</p>
        ) : (
          <div className="mt-3 flex flex-wrap gap-2">
            {form.savedDestinations.map((d) => (
              <span key={d} className="inline-flex items-center gap-1.5 rounded-full bg-brand-50 px-3 py-1.5 text-sm font-medium text-brand-700">
                <MapPin className="h-3.5 w-3.5" /> {d}
                <button onClick={() => removeDestination(d)} className="rounded-full p-0.5 hover:bg-brand-100"><X className="h-3.5 w-3.5" /></button>
              </span>
            ))}
          </div>
        )}
        {form.savedDestinations.length > 0 && (
          <div className="mt-4">
            <Button variant="outline" size="sm" onClick={() => save()} disabled={saving}><Save className="h-4 w-4" /> Save list</Button>
          </div>
        )}
      </div>

      {/* Account actions */}
      <div className="card flex items-center justify-between p-6">
        <div>
          <h3 className="font-display text-lg font-bold text-ink-900">Account</h3>
          <p className="text-sm text-ink-400">Sign out of your GlobeTrotter account on this device.</p>
        </div>
        <Button variant="ghost" onClick={logout} className="text-coral-600 hover:bg-coral-50">
          <LogOut className="h-4 w-4" /> Sign out
        </Button>
      </div>
    </div>
  );
}
