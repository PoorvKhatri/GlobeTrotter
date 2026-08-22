"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Mail, Lock, Eye, EyeOff, ArrowRight, UserCircle2 } from "lucide-react";
import AuthShell from "@/components/auth/AuthShell";
import Button from "@/components/ui/Button";
import { useToast } from "@/components/ui/Toast";
import { Spinner } from "@/components/ui/Loading";
import api from "@/lib/api";

export default function LoginPage() {
  const router = useRouter();
  const toast = useToast();
  const [form, setForm] = useState({ email: "", password: "" });
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  async function onSubmit(e) {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post("/api/auth/login", form);
      toast.success("Welcome back! Redirecting…");
      const next = new URLSearchParams(window.location.search).get("next");
      router.push(next || "/dashboard");
      router.refresh();
    } catch (err) {
      toast.error(err.message || "Unable to sign in.");
    } finally {
      setLoading(false);
    }
  }

  function fillDemo(role) {
    setForm(
      role === "admin"
        ? { email: "admin@globetrotter.app", password: "admin123" }
        : { email: "demo@globetrotter.app", password: "demo123" }
    );
  }

  return (
    <AuthShell title="Welcome back" subtitle="Sign in to continue planning your next adventure.">
      <div className="mb-6 flex justify-center">
        <div className="flex h-20 w-20 items-center justify-center rounded-full border-2 border-brand-100 bg-brand-50 text-brand-400">
          <UserCircle2 className="h-12 w-12" strokeWidth={1.5} />
        </div>
      </div>

      <form onSubmit={onSubmit} className="space-y-4">
        <div>
          <label className="label">Email address</label>
          <div className="relative">
            <Mail className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-400" />
            <input
              type="email"
              required
              autoComplete="email"
              value={form.email}
              onChange={set("email")}
              placeholder="you@example.com"
              className="input pl-10"
            />
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between">
            <label className="label mb-0">Password</label>
            <button type="button" className="text-xs font-medium text-brand-600 hover:underline">
              Forgot password?
            </button>
          </div>
          <div className="relative mt-1.5">
            <Lock className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-400" />
            <input
              type={showPw ? "text" : "password"}
              required
              autoComplete="current-password"
              value={form.password}
              onChange={set("password")}
              placeholder="••••••••"
              className="input px-10"
            />
            <button
              type="button"
              onClick={() => setShowPw((s) => !s)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-400 hover:text-ink-600"
            >
              {showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
        </div>

        <Button type="submit" size="lg" className="w-full" disabled={loading}>
          {loading ? <Spinner className="h-5 w-5 border-white/40 border-t-white" /> : (
            <>
              Login <ArrowRight className="h-4 w-4" />
            </>
          )}
        </Button>
      </form>

      <div className="mt-4 flex items-center gap-2 text-xs text-ink-400">
        <span className="h-px flex-1 bg-ink-200" /> quick demo access <span className="h-px flex-1 bg-ink-200" />
      </div>
      <div className="mt-3 grid grid-cols-2 gap-3">
        <button onClick={() => fillDemo("user")} className="btn btn-outline btn-sm">
          Demo user
        </button>
        <button onClick={() => fillDemo("admin")} className="btn btn-outline btn-sm">
          Demo admin
        </button>
      </div>

      <p className="mt-8 text-center text-sm text-ink-500">
        Don&apos;t have an account?{" "}
        <Link href="/register" className="font-semibold text-brand-600 hover:underline">
          Create one
        </Link>
      </p>
    </AuthShell>
  );
}
