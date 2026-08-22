# 🌍 GlobeTrotter — Empowering Personalized Travel Planning

> A full-stack, multi-city travel planner. Build day-by-day itineraries, track budgets visually, explore destinations, share public trip pages, and get inspired by a community of travelers.

Built with **Next.js 14 (App Router)** and **MongoDB**, with a custom **JWT + bcrypt** auth layer and a modern, vibrant travel UI.

---

## ✨ Features

GlobeTrotter delivers all 13 core screens end-to-end:

| # | Screen | What it does |
|---|--------|--------------|
| 1 | **Login / Signup** | Custom auth with hashed passwords and HTTP-only cookie sessions. |
| 2 | **Dashboard** | Personalized home with quick search, trip highlights, and stats. |
| 3 | **Create Trip** | Name a trip, set dates, add a cover, and start planning. |
| 4 | **My Trips** | Grid of all your trips with status, budget, and quick actions. |
| 5 | **Itinerary Builder** | Add city stops, reorder them, and assign activities per day. |
| 6 | **Itinerary View** | A clean, shareable day-by-day breakdown of the whole journey. |
| 7 | **City Search** | Explore destinations by region, cost, and popularity. |
| 8 | **Activity Search** | Browse hand-picked activities by category and add them to trips. |
| 9 | **Trip Budget** | Visual cost breakdown (donut + bar charts) with editable estimates. |
| 10 | **Calendar / Timeline** | See every trip on a travel calendar and month-by-month timeline. |
| 11 | **Public Share View** | Publish a beautiful, no-login trip page others can view & copy. |
| 12 | **Profile / Settings** | Manage your identity, preferences, and saved destinations. |
| 13 | **Admin & Analytics** | Platform-wide growth, engagement, and popular-destination insights. |

---

## 🛠 Tech Stack

- **Framework:** Next.js 14.2 (App Router, Server & Client Components)
- **Database:** MongoDB with Mongoose 8
- **Auth:** JSON Web Tokens + bcryptjs, stored in an HTTP-only cookie
- **Styling:** Tailwind CSS 3.4 with a custom vibrant theme (teal / coral / amber)
- **Charts:** Recharts
- **Icons:** lucide-react

---

## 🚀 Getting Started

### 1. Prerequisites

- **Node.js 18.18+** (or 20+)
- A **MongoDB** connection string — either a local `mongod` or a free [MongoDB Atlas](https://www.mongodb.com/atlas) cluster.

### 2. Install dependencies

```bash
npm install
```

### 3. Configure environment variables

Copy the example file and fill in your values:

```bash
cp .env.example .env.local
```

```ini
# .env.local
MONGODB_URI="mongodb://127.0.0.1:27017"        # or your Atlas SRV string
JWT_SECRET="replace-with-a-long-random-string"  # used to sign sessions
JWT_EXPIRES_IN="7d"                              # optional, defaults to 7d
```

> 💡 Generate a strong secret quickly: `node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"`

### 4. Seed the database (recommended for the demo)

```bash
npm run seed
```

This wipes and repopulates the core collections with 18 cities, 30+ activities, sample trips, community posts, and two ready-to-use accounts:

| Role | Email | Password |
|------|-------|----------|
| Traveler | `demo@globetrotter.app` | `demo123` |
| Admin | `admin@globetrotter.app` | `admin123` |

### 5. Run the dev server

```bash
npm run dev
```

Open **http://localhost:3000** and sign in with the demo account above. To see the **Admin & Analytics** dashboard, sign in as the admin account.

---

## 📜 Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start the development server. |
| `npm run build` | Create a production build. |
| `npm run start` | Run the production server (after `build`). |
| `npm run lint` | Run ESLint. |
| `npm run seed` | Reset & populate the database with demo data. |

---

## 📁 Project Structure

```
globetrotter/
├── scripts/
│   └── seed.js                 # Standalone DB seeder (demo data + accounts)
├── src/
│   ├── app/
│   │   ├── (auth)/             # Login & register (public)
│   │   │   ├── login/
│   │   │   └── register/
│   │   ├── (app)/              # Authenticated app (shares a layout + navbar)
│   │   │   ├── dashboard/
│   │   │   ├── trips/          # list · new · [id] view/build/budget/edit
│   │   │   ├── cities/
│   │   │   ├── activities/
│   │   │   ├── calendar/
│   │   │   ├── community/
│   │   │   ├── profile/
│   │   │   └── admin/
│   │   ├── api/                # Route handlers (auth, trips, cities, …)
│   │   ├── share/[id]/         # Public, no-login itinerary pages
│   │   ├── layout.js           # Root layout + providers
│   │   └── page.js             # Marketing landing page
│   ├── components/             # UI kit + feature components
│   │   ├── ui/                 # Button, Input, Modal, Badge, Toast, …
│   │   ├── itinerary/          # Itinerary display, share & copy controls
│   │   ├── admin/              # Analytics dashboard
│   │   └── …
│   ├── lib/                    # mongodb, auth, api client, utils, constants
│   ├── models/                 # Mongoose models (User, Trip, City, …)
│   └── middleware.js           # Route protection (cookie presence)
├── .env.example
├── tailwind.config.js
└── package.json
```

---

## 🔐 Authentication Model

- Passwords are hashed with **bcrypt** and never stored in plain text.
- On login/register the server issues a **signed JWT** stored in an **HTTP-only, SameSite cookie** (`gt_token`) — inaccessible to client-side JavaScript.
- `middleware.js` guards authenticated routes by checking for the cookie; server components verify and decode the token to load the current user.
- API routes re-verify the token on every request, so protected data is never exposed without a valid session.

---

## 🎨 Design

A warm, adventurous "modern travel" aesthetic: a teal → coral → amber palette, imagery-forward hero banners, rounded cards, generous whitespace, and smooth micro-interactions — designed to present cleanly on a projector at a national-level showcase.

---

## 🧭 Notes

- Placeholder imagery is served from LoremFlickr using deterministic, keyword-based URLs, so no image API key is required and the same subject always resolves to the same photo.
- Analytics on the admin dashboard are computed from live database documents at request time.
- The seeder is safe to re-run; it clears and rebuilds the seeded collections each time.

---

Built for a national-level hackathon virtual round. Plan · Budget · Explore · Share. 🧳
