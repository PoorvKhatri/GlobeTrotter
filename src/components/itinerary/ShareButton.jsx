"use client";

import { useState } from "react";
import { Share2, Check, Copy, Globe, Lock } from "lucide-react";
import Modal from "@/components/ui/Modal";
import Button from "@/components/ui/Button";
import { useToast } from "@/components/ui/Toast";
import api from "@/lib/api";

export default function ShareButton({ tripId, isPublic: initialPublic }) {
  const toast = useToast();
  const [open, setOpen] = useState(false);
  const [isPublic, setIsPublic] = useState(initialPublic);
  const [copied, setCopied] = useState(false);
  const [busy, setBusy] = useState(false);

  const url = typeof window !== "undefined" ? `${window.location.origin}/share/${tripId}` : "";

  async function togglePublic() {
    setBusy(true);
    try {
      await api.put(`/api/trips/${tripId}`, { isPublic: !isPublic });
      setIsPublic(!isPublic);
      toast.success(!isPublic ? "Trip is now public" : "Trip is now private");
    } catch (e) {
      toast.error(e.message || "Could not update sharing");
    } finally {
      setBusy(false);
    }
  }

  function copy() {
    navigator.clipboard?.writeText(url);
    setCopied(true);
    toast.success("Link copied!");
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <>
      <Button variant="outline" onClick={() => setOpen(true)}>
        <Share2 className="h-4 w-4" /> Share
      </Button>

      <Modal open={open} onClose={() => setOpen(false)} title="Share this trip" size="sm">
        <div className="space-y-4">
          <button
            onClick={togglePublic}
            disabled={busy}
            className={`flex w-full items-center gap-3 rounded-xl border p-4 text-left transition ${
              isPublic ? "border-brand-300 bg-brand-50" : "border-ink-200"
            }`}
          >
            <span className={`flex h-10 w-10 items-center justify-center rounded-xl ${isPublic ? "bg-brand-500 text-white" : "bg-ink-100 text-ink-500"}`}>
              {isPublic ? <Globe className="h-5 w-5" /> : <Lock className="h-5 w-5" />}
            </span>
            <div>
              <p className="font-medium text-ink-900">{isPublic ? "Public" : "Private"}</p>
              <p className="text-xs text-ink-400">
                {isPublic ? "Anyone with the link can view this itinerary" : "Only you can see this trip — tap to make public"}
              </p>
            </div>
          </button>

          {isPublic && (
            <div className="flex items-center gap-2 rounded-xl border border-ink-200 bg-ink-50 p-2">
              <input readOnly value={url} className="flex-1 bg-transparent px-2 text-sm text-ink-600 focus:outline-none" />
              <Button size="sm" onClick={copy}>
                {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                {copied ? "Copied" : "Copy"}
              </Button>
            </div>
          )}
        </div>
      </Modal>
    </>
  );
}
