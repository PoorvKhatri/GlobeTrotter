"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Save,
  Trash2,
  Image as ImageIcon,
  Globe,
  Lock,
  Pencil,
} from "lucide-react";
import Button from "@/components/ui/Button";
import { Field } from "@/components/ui/Input";
import Modal from "@/components/ui/Modal";
import { PageLoader, EmptyState } from "@/components/ui/Loading";
import { useToast } from "@/components/ui/Toast";
import { toDateInput, unsplash } from "@/lib/utils";
import api from "@/lib/api";

export default function EditTripPage() {
  const { id } = useParams();
  const router = useRouter();
  const toast = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [form, setForm] = useState(null);

  useEffect(() => {
    api
      .get(`/api/trips/${id}`)
      .then((d) => {
        const t = d.trip;
        setForm({
          name: t.name || "",
          startDate: toDateInput(t.startDate),
          endDate: toDateInput(t.endDate),
          description: t.description || "",
          coverPhoto: t.coverPhoto || "",
          isPublic: !!t.isPublic,
        });
      })
      .catch((e) => toast.error(e.message || "Could not load trip"))
      .finally(() => setLoading(false));
  }, [id]); // eslint-disable-line react-hooks/exhaustive-deps

  const set = (patch) => setForm((f) => ({ ...f, ...patch }));

  async function save(e) {
    e?.preventDefault();
    if (!form.name.trim()) return toast.error("Give your trip a name");
    setSaving(true);
    try {
      await api.put(`/api/trips/${id}`, form);
      toast.success("Trip updated");
      router.push(`/trips/${id}`);
    } catch (err) {
      toast.error(err.message || "Could not save");
    } finally {
      setSaving(false);
    }
  }

  async function onCover(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 1.5 * 1024 * 1024) return toast.error("Image must be under 1.5MB");
    const reader = new FileReader();
    reader.onload = () => set({ coverPhoto: reader.result });
    reader.readAsDataURL(file);
  }

  async function del() {
    try {
      await api.del(`/api/trips/${id}`);
      toast.success("Trip deleted");
      router.push("/trips");
    } catch (err) {
      toast.error(err.message || "Could not delete");
    }
  }

  if (loading) return <PageLoader label="Loading trip…" />;
  if (!form) return <EmptyState icon={Pencil} title="Trip not found" />;

  const preview = form.coverPhoto || unsplash(form.name || "travel", 1200, 400);

  return (
    <div className="mx-auto max-w-2xl space-y-6 pb-10">
      <Link href={`/trips/${id}`} className="inline-flex items-center gap-1.5 text-sm font-medium text-ink-500 hover:text-brand-600">
        <ArrowLeft className="h-4 w-4" /> Back to trip
      </Link>

      <div className="flex items-center gap-2 text-brand-600">
        <Pencil className="h-5 w-5" />
        <span className="text-sm font-semibold uppercase tracking-wide">Edit trip details</span>
      </div>

      <form onSubmit={save} className="card space-y-5 p-6">
        {/* Cover */}
        <div>
          <div className="relative h-40 w-full overflow-hidden rounded-2xl bg-ink-100">
            <img src={preview} alt="Cover" className="h-full w-full object-cover" />
            <label className="absolute bottom-3 right-3 inline-flex cursor-pointer items-center gap-2 rounded-full bg-white/90 px-3 py-1.5 text-sm font-medium text-ink-700 shadow-soft backdrop-blur hover:bg-white">
              <ImageIcon className="h-4 w-4" /> Change cover
              <input type="file" accept="image/*" onChange={onCover} className="hidden" />
            </label>
          </div>
          <input
            value={form.coverPhoto}
            onChange={(e) => set({ coverPhoto: e.target.value })}
            placeholder="…or paste an image URL"
            className="input mt-2 text-sm"
          />
        </div>

        <Field label="Trip name *">
          <input value={form.name} onChange={(e) => set({ name: e.target.value })} className="input" placeholder="e.g. Southeast Asia Adventure" />
        </Field>

        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Start date">
            <input type="date" value={form.startDate} onChange={(e) => set({ startDate: e.target.value })} className="input" />
          </Field>
          <Field label="End date">
            <input type="date" value={form.endDate} min={form.startDate} onChange={(e) => set({ endDate: e.target.value })} className="input" />
          </Field>
        </div>

        <Field label="Description">
          <textarea rows={3} value={form.description} onChange={(e) => set({ description: e.target.value })} className="input resize-none" placeholder="What's this trip about?" />
        </Field>

        {/* Visibility */}
        <div>
          <span className="label">Visibility</span>
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => set({ isPublic: false })}
              className={`flex items-center gap-3 rounded-xl border p-3 text-left transition ${!form.isPublic ? "border-brand-300 bg-brand-50" : "border-ink-200"}`}
            >
              <Lock className={`h-5 w-5 ${!form.isPublic ? "text-brand-600" : "text-ink-400"}`} />
              <div>
                <p className="text-sm font-medium text-ink-900">Private</p>
                <p className="text-xs text-ink-400">Only you</p>
              </div>
            </button>
            <button
              type="button"
              onClick={() => set({ isPublic: true })}
              className={`flex items-center gap-3 rounded-xl border p-3 text-left transition ${form.isPublic ? "border-brand-300 bg-brand-50" : "border-ink-200"}`}
            >
              <Globe className={`h-5 w-5 ${form.isPublic ? "text-brand-600" : "text-ink-400"}`} />
              <div>
                <p className="text-sm font-medium text-ink-900">Public</p>
                <p className="text-xs text-ink-400">Anyone with the link</p>
              </div>
            </button>
          </div>
        </div>

        <div className="flex items-center justify-between border-t border-ink-100 pt-5">
          <Button type="button" variant="ghost" onClick={() => setConfirmDelete(true)} className="text-coral-600 hover:bg-coral-50">
            <Trash2 className="h-4 w-4" /> Delete trip
          </Button>
          <div className="flex gap-2">
            <Button type="button" variant="outline" href={`/trips/${id}`}>Cancel</Button>
            <Button type="submit" disabled={saving}>
              <Save className="h-4 w-4" /> {saving ? "Saving…" : "Save changes"}
            </Button>
          </div>
        </div>
      </form>

      <Modal
        open={confirmDelete}
        onClose={() => setConfirmDelete(false)}
        title="Delete this trip?"
        size="sm"
        footer={
          <>
            <Button variant="outline" onClick={() => setConfirmDelete(false)}>Cancel</Button>
            <Button variant="coral" onClick={del}><Trash2 className="h-4 w-4" /> Delete</Button>
          </>
        }
      >
        <p className="text-ink-600">This permanently removes <strong>{form.name}</strong> and its entire itinerary. This can&apos;t be undone.</p>
      </Modal>
    </div>
  );
}
