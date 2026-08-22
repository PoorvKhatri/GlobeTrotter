"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Camera, ArrowRight } from "lucide-react";
import AuthShell from "@/components/auth/AuthShell";
import Button from "@/components/ui/Button";
import { useToast } from "@/components/ui/Toast";
import { Spinner } from "@/components/ui/Loading";
import { initials } from "@/lib/utils";
import api from "@/lib/api";

const EMPTY = {
  firstName: "",
  lastName: "",
  email: "",
  phone: "",
  city: "",
  country: "",
  additionalInfo: "",
  password: "",
  confirm: "",
  photo: "",
};

export default function RegisterPage() {
  const router = useRouter();
  const toast = useToast();
  const fileRef = useRef(null);
  const [form, setForm] = useState(EMPTY);
  const [loading, setLoading] = useState(false);

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  function onPhoto(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 1.5 * 1024 * 1024) {
      toast.error("Please choose an image under 1.5MB.");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => setForm((f) => ({ ...f, photo: reader.result }));
    reader.readAsDataURL(file);
  }

  async function onSubmit(e) {
    e.preventDefault();
    if (form.password !== form.confirm) {
      toast.error("Passwords do not match.");
      return;
    }
    if (form.password.length < 6) {
      toast.error("Password must be at least 6 characters.");
      return;
    }
    setLoading(true);
    try {
      const { confirm, ...payload } = form;
      await api.post("/api/auth/register", payload);
      toast.success("Account created! Welcome aboard 🌍");
      router.push("/dashboard");
      router.refresh();
    } catch (err) {
      toast.error(err.message || "Unable to register.");
    } finally {
      setLoading(false);
    }
  }

  const name = `${form.firstName} ${form.lastName}`.trim();

  return (
    <AuthShell
      title="Create your account"
      subtitle="A few details and you'll be ready to plan your first trip."
    >
      <form onSubmit={onSubmit} className="space-y-5">
        {/* Photo */}
        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            className="group relative flex h-20 w-20 flex-shrink-0 items-center justify-center overflow-hidden rounded-full border-2 border-dashed border-brand-200 bg-brand-50 text-brand-400 transition hover:border-brand-400"
          >
            {form.photo ? (
              <img src={form.photo} alt="preview" className="h-full w-full object-cover" />
            ) : name ? (
              <span className="font-display text-xl font-bold text-brand-500">{initials(name)}</span>
            ) : (
              <Camera className="h-6 w-6" />
            )}
            <span className="absolute inset-0 hidden items-center justify-center bg-ink-950/40 text-white group-hover:flex">
              <Camera className="h-5 w-5" />
            </span>
          </button>
          <div>
            <p className="text-sm font-medium text-ink-700">Profile photo</p>
            <p className="text-xs text-ink-400">Optional · JPG or PNG, up to 1.5MB</p>
          </div>
          <input ref={fileRef} type="file" accept="image/*" onChange={onPhoto} className="hidden" />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="label">First name</label>
            <input required value={form.firstName} onChange={set("firstName")} className="input" placeholder="Jane" />
          </div>
          <div>
            <label className="label">Last name</label>
            <input required value={form.lastName} onChange={set("lastName")} className="input" placeholder="Doe" />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="label">Email address</label>
            <input required type="email" value={form.email} onChange={set("email")} className="input" placeholder="you@example.com" />
          </div>
          <div>
            <label className="label">Phone number</label>
            <input value={form.phone} onChange={set("phone")} className="input" placeholder="+1 555 000 1234" />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="label">City</label>
            <input value={form.city} onChange={set("city")} className="input" placeholder="San Francisco" />
          </div>
          <div>
            <label className="label">Country</label>
            <input value={form.country} onChange={set("country")} className="input" placeholder="United States" />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="label">Password</label>
            <input required type="password" value={form.password} onChange={set("password")} className="input" placeholder="••••••••" />
          </div>
          <div>
            <label className="label">Confirm password</label>
            <input required type="password" value={form.confirm} onChange={set("confirm")} className="input" placeholder="••••••••" />
          </div>
        </div>

        <div>
          <label className="label">Additional information</label>
          <textarea
            rows={3}
            value={form.additionalInfo}
            onChange={set("additionalInfo")}
            className="input resize-none"
            placeholder="Tell us about your travel style, interests, or anything else…"
          />
        </div>

        <Button type="submit" size="lg" className="w-full" disabled={loading}>
          {loading ? <Spinner className="h-5 w-5 border-white/40 border-t-white" /> : (
            <>
              Register <ArrowRight className="h-4 w-4" />
            </>
          )}
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-ink-500">
        Already have an account?{" "}
        <Link href="/login" className="font-semibold text-brand-600 hover:underline">
          Sign in
        </Link>
      </p>
    </AuthShell>
  );
}
