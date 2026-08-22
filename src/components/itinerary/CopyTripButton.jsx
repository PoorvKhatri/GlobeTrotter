"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Copy, Loader2 } from "lucide-react";
import { useToast } from "@/components/ui/Toast";
import api from "@/lib/api";

export default function CopyTripButton({ tripId, className = "" }) {
  const router = useRouter();
  const toast = useToast();
  const [busy, setBusy] = useState(false);

  async function copy() {
    setBusy(true);
    try {
      const { trip } = await api.post(`/api/trips/${tripId}/copy`, {});
      toast.success("Trip copied to your account!");
      router.push(`/trips/${trip.id}`);
    } catch (e) {
      if (/sign in/i.test(e.message) || /401/.test(e.message)) {
        toast.info("Sign in to save this trip");
        router.push(`/login?next=/share/${tripId}`);
      } else {
        toast.error(e.message || "Could not copy trip");
      }
    } finally {
      setBusy(false);
    }
  }

  return (
    <button
      onClick={copy}
      disabled={busy}
      className={`btn btn-coral btn-md ${className}`}
    >
      {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Copy className="h-4 w-4" />}
      {busy ? "Copying…" : "Copy this trip"}
    </button>
  );
}
