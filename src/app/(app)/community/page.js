"use client";

import { useEffect, useState } from "react";
import {
  Users,
  Heart,
  MapPin,
  Compass,
  Plus,
  Trash2,
  Image as ImageIcon,
  MessageSquareText,
  SearchX,
} from "lucide-react";
import Button from "@/components/ui/Button";
import Badge from "@/components/ui/Badge";
import Avatar from "@/components/ui/Avatar";
import Modal from "@/components/ui/Modal";
import SearchToolbar from "@/components/ui/SearchToolbar";
import { Field } from "@/components/ui/Input";
import { EmptyState, Skeleton } from "@/components/ui/Loading";
import { useToast } from "@/components/ui/Toast";
import { useUser } from "@/components/UserProvider";
import { formatDate } from "@/lib/utils";
import api from "@/lib/api";

const TAG_OPTIONS = [
  { value: "all", label: "All topics" },
  { value: "Adventure", label: "Adventure" },
  { value: "Food", label: "Food" },
  { value: "Culture", label: "Culture" },
  { value: "Budget", label: "Budget" },
  { value: "Nature", label: "Nature" },
  { value: "City", label: "City" },
  { value: "Family", label: "Family" },
  { value: "Solo", label: "Solo" },
];

const BLANK = { title: "", content: "", location: "", activity: "", image: "", tags: "" };

export default function CommunityPage() {
  const user = useUser();
  const toast = useToast();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [tag, setTag] = useState("all");
  const [sort, setSort] = useState("recent");
  const [compose, setCompose] = useState(false);
  const [form, setForm] = useState(BLANK);
  const [posting, setPosting] = useState(false);

  function load() {
    setLoading(true);
    const params = new URLSearchParams();
    if (query) params.set("q", query);
    if (tag !== "all") params.set("tag", tag);
    params.set("sort", sort);
    api
      .get(`/api/community?${params.toString()}`)
      .then((d) => setPosts(d.posts || []))
      .catch(() => toast.error("Could not load community posts"))
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    const t = setTimeout(load, 250);
    return () => clearTimeout(t);
  }, [query, tag, sort]); // eslint-disable-line react-hooks/exhaustive-deps

  async function toggleLike(post) {
    // optimistic
    setPosts((prev) =>
      prev.map((p) =>
        p.id === post.id
          ? { ...p, likedByMe: !p.likedByMe, likes: p.likes + (p.likedByMe ? -1 : 1) }
          : p
      )
    );
    try {
      await api.post(`/api/community/${post.id}/like`, {});
    } catch (e) {
      toast.error(e.message || "Could not update like");
      load();
    }
  }

  async function submit(e) {
    e.preventDefault();
    if (!form.title.trim() || !form.content.trim()) return toast.error("Add a title and your story");
    setPosting(true);
    try {
      await api.post("/api/community", form);
      toast.success("Shared with the community!");
      setForm(BLANK);
      setCompose(false);
      load();
    } catch (err) {
      toast.error(err.message || "Could not post");
    } finally {
      setPosting(false);
    }
  }

  async function del(post) {
    setPosts((prev) => prev.filter((p) => p.id !== post.id));
    try {
      await api.del(`/api/community/${post.id}`);
      toast.success("Post removed");
    } catch (e) {
      toast.error(e.message || "Could not delete");
      load();
    }
  }

  function onImage(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 1.5 * 1024 * 1024) return toast.error("Image must be under 1.5MB");
    const reader = new FileReader();
    reader.onload = () => setForm((f) => ({ ...f, image: reader.result }));
    reader.readAsDataURL(file);
  }

  return (
    <div className="space-y-6">
      {/* Header banner */}
      <section className="relative overflow-hidden rounded-3xl bg-hero-gradient p-8">
        <div className="absolute -right-10 -top-10 h-48 w-48 rounded-full bg-white/10 blur-3xl" />
        <div className="relative flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="flex items-center gap-2 font-display text-2xl font-extrabold text-white sm:text-3xl">
              <Users className="h-7 w-7" /> Community
            </h1>
            <p className="mt-1 max-w-xl text-white/85">Discover real experiences, tips, and hidden gems shared by fellow travelers — then share your own.</p>
          </div>
          <Button variant="coral" onClick={() => setCompose(true)}>
            <Plus className="h-4 w-4" /> Share experience
          </Button>
        </div>
      </section>

      <SearchToolbar
        query={query}
        onQueryChange={setQuery}
        placeholder="Search stories, places, activities…"
        filterOptions={TAG_OPTIONS}
        filterValue={tag}
        onFilterChange={setTag}
        sortOptions={[
          { value: "recent", label: "Most recent" },
          { value: "popular", label: "Most liked" },
        ]}
        sortValue={sort}
        onSortChange={setSort}
      />

      {loading ? (
        <div className="columns-1 gap-5 sm:columns-2 lg:columns-3">
          {[...Array(6)].map((_, i) => <Skeleton key={i} className="mb-5 h-64" />)}
        </div>
      ) : posts.length === 0 ? (
        <EmptyState
          icon={SearchX}
          title="No posts yet"
          description="Be the first to share a travel experience with the community."
          action={<Button onClick={() => setCompose(true)}><Plus className="h-4 w-4" /> Share experience</Button>}
        />
      ) : (
        <div className="columns-1 gap-5 space-y-5 sm:columns-2 lg:columns-3">
          {posts.map((p) => (
            <article key={p.id} className="card mb-5 break-inside-avoid overflow-hidden">
              {p.image && <img src={p.image} alt="" className="max-h-64 w-full object-cover" />}
              <div className="p-5">
                <div className="flex items-center gap-3">
                  <Avatar name={p.authorName} src={p.authorPhoto} size="sm" />
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-semibold text-ink-900">{p.authorName}</p>
                    <p className="text-xs text-ink-400">{formatDate(p.createdAt)}</p>
                  </div>
                  {user?.id === p.user && (
                    <button onClick={() => del(p)} className="rounded-lg p-1.5 text-ink-300 hover:bg-coral-50 hover:text-coral-500" title="Delete">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  )}
                </div>

                <h3 className="mt-3 font-display text-lg font-bold text-ink-900">{p.title}</h3>
                <p className="mt-1 whitespace-pre-line text-sm text-ink-600">{p.content}</p>

                {(p.location || p.activity) && (
                  <div className="mt-3 flex flex-wrap gap-2 text-xs text-ink-500">
                    {p.location && <span className="inline-flex items-center gap-1"><MapPin className="h-3.5 w-3.5 text-coral-500" /> {p.location}</span>}
                    {p.activity && <span className="inline-flex items-center gap-1"><Compass className="h-3.5 w-3.5 text-brand-500" /> {p.activity}</span>}
                  </div>
                )}

                {p.tags?.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {p.tags.map((t, i) => <Badge key={i} tone="ink">#{t}</Badge>)}
                  </div>
                )}

                <div className="mt-4 flex items-center gap-4 border-t border-ink-100 pt-3">
                  <button
                    onClick={() => toggleLike(p)}
                    className={`inline-flex items-center gap-1.5 text-sm font-medium transition ${p.likedByMe ? "text-coral-600" : "text-ink-500 hover:text-coral-500"}`}
                  >
                    <Heart className={`h-4 w-4 ${p.likedByMe ? "fill-coral-500 text-coral-500" : ""}`} /> {p.likes}
                  </button>
                  <span className="inline-flex items-center gap-1.5 text-sm text-ink-400">
                    <MessageSquareText className="h-4 w-4" /> Tip
                  </span>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}

      {/* Compose modal */}
      <Modal
        open={compose}
        onClose={() => setCompose(false)}
        title="Share your experience"
        size="lg"
        footer={
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setCompose(false)}>Cancel</Button>
            <Button onClick={submit} disabled={posting}>{posting ? "Posting…" : "Post to community"}</Button>
          </div>
        }
      >
        <form onSubmit={submit} className="space-y-4">
          <Field label="Title">
            <input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className="input" placeholder="e.g. 3 perfect days in Kyoto" />
          </Field>
          <Field label="Your story">
            <textarea rows={4} value={form.content} onChange={(e) => setForm({ ...form, content: e.target.value })} className="input resize-none" placeholder="What made this special? Tips, highlights, things to avoid…" />
          </Field>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Location">
              <input value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} className="input" placeholder="City, country" />
            </Field>
            <Field label="Activity">
              <input value={form.activity} onChange={(e) => setForm({ ...form, activity: e.target.value })} className="input" placeholder="e.g. Temple tour" />
            </Field>
          </div>
          <Field label="Tags" hint="Comma-separated, e.g. Food, Culture, Budget">
            <input value={form.tags} onChange={(e) => setForm({ ...form, tags: e.target.value })} className="input" placeholder="Adventure, Nature" />
          </Field>
          <div>
            <span className="label">Photo (optional)</span>
            {form.image ? (
              <div className="relative overflow-hidden rounded-xl">
                <img src={form.image} alt="" className="max-h-48 w-full object-cover" />
                <button type="button" onClick={() => setForm({ ...form, image: "" })} className="absolute right-2 top-2 rounded-full bg-white/90 p-1.5 text-ink-600 hover:bg-white">
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            ) : (
              <label className="flex cursor-pointer items-center justify-center gap-2 rounded-xl border-2 border-dashed border-ink-200 py-6 text-sm text-ink-500 hover:border-brand-300 hover:bg-brand-50">
                <ImageIcon className="h-5 w-5" /> Add a photo
                <input type="file" accept="image/*" onChange={onImage} className="hidden" />
              </label>
            )}
          </div>
        </form>
      </Modal>
    </div>
  );
}
