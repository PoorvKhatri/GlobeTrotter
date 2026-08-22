# 🚢 Push Guide — Staging GlobeTrotter to Git

This repository has been initialized with **5 logical commits** that tell the story of how the project was built, from scaffolding to polish. This guide explains how to push them to a remote (GitHub/GitLab) — either **all at once**, or **in 5 intervals** so the commit history appears naturally over time.

---

## 📚 The 5 commits

Run `git log --oneline` to see them. From oldest to newest:

| Order | Commit message | What's inside |
|-------|----------------|---------------|
| 1 | `chore: scaffold Next.js + Tailwind project and tooling` | Next.js config, Tailwind theme, PostCSS, ESLint, `package.json`, global styles, `.env.example`, README & this guide. |
| 2 | `feat: MongoDB models and JWT authentication` | Mongoose models, DB connection, JWT + bcrypt auth, login & register screens, auth API routes, middleware. |
| 3 | `feat: dashboard, trips, and destination discovery` | App shell/navbar, dashboard, create-trip & My Trips, city and activity search, shared UI kit. |
| 4 | `feat: itinerary builder, budget, and trip calendar` | Itinerary builder & view, budget breakdown with charts, calendar/timeline, trip edit. |
| 5 | `feat: community, public sharing, profile, admin analytics + seed` | Community feed, public share pages, profile/settings, admin dashboard, landing page, DB seed script. |

---

## 🌐 Step 1 — Create an empty remote

Create a **new, empty** repository on GitHub (no README, no .gitignore — this repo already has them). Then wire it up locally:

```bash
git remote add origin https://github.com/<your-username>/globetrotter.git
```

Confirm it's set:

```bash
git remote -v
```

---

## Option A — Push everything at once (simplest)

```bash
git push -u origin main
```

Done. All 5 commits land on the remote together.

---

## Option B — Push in 5 intervals (natural history) ✅ recommended

Push progressively more of the history each time. Because `main` stays at the newest commit, `main~N` reliably points at the right earlier commit. Run one block whenever you like (minutes, hours, or days apart).

```bash
# Interval 1 — scaffolding
git push -u origin main~4:refs/heads/main

# Interval 2 — models & auth
git push origin main~3:refs/heads/main

# Interval 3 — dashboard, trips, discovery
git push origin main~2:refs/heads/main

# Interval 4 — itinerary, budget, calendar
git push origin main~1:refs/heads/main

# Interval 5 — community, sharing, profile, admin
git push origin main
```

After each push, refresh your remote — you'll see the commit count and files grow step by step.

> **What `main~4:refs/heads/main` means:** "push the commit that is 4 before the tip (`main~4`) to the remote branch `main`." Each subsequent push fast-forwards the remote by one commit.

> **Tip:** If your remote's default branch is `master` instead of `main`, replace `main` with `master` in the commands above (and run `git branch -M main` first if you'd prefer to standardize on `main`).

---

## 🔎 Handy commands

```bash
git log --oneline --stat     # See each commit and the files it touched
git status                   # Confirm a clean working tree
git show main~4              # Inspect the first (scaffolding) commit
```

---

## ⚠️ Before you push — sanity checks

- **Secrets stay local.** `.gitignore` already excludes `.env`, `.env.local`, and `node_modules`. Only `.env.example` (with placeholder values) is committed. Double-check with `git status` that no real secret file is staged.
- **Fresh clone test (optional).** After pushing, `git clone` into a new folder, run `npm install`, add a `.env.local`, then `npm run seed && npm run dev` to confirm everything works from scratch.

Happy shipping! 🌍
