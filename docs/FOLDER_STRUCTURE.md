# Pick Pool — Folder Structure

```
pick-pool/
├── docs/
│   ├── ARCHITECTURE.md          ← System design & data flow
│   ├── API.md                   ← All API endpoints documented
│   └── DEPLOYMENT.md            ← Step-by-step deploy guide
│
├── supabase/
│   └── schema.sql               ← Complete PostgreSQL schema + RLS + triggers
│
├── src/
│   ├── app/                     ← Next.js 14 App Router
│   │   ├── layout.tsx           ← Root layout (Inter font, metadata)
│   │   ├── page.tsx             ← Root redirect (/ → /pool or /auth)
│   │   ├── globals.css          ← Pool theme: colors, animations, glass utility
│   │   │
│   │   ├── auth/
│   │   │   └── page.tsx         ← Email sign in / sign up page
│   │   │
│   │   ├── onboard/
│   │   │   └── page.tsx         ← First-time: create traveller profile
│   │   │
│   │   ├── pool/
│   │   │   ├── page.tsx         ← Server component: auth check, fetch traveller
│   │   │   └── PoolClient.tsx   ← Client wrapper: inject traveller into store
│   │   │
│   │   └── api/
│   │       ├── discoveries/
│   │       │   └── route.ts     ← GET (list) + POST (create)
│   │       ├── lightups/
│   │       │   └── route.ts     ← POST (light up) + DELETE (remove)
│   │       └── voice/
│   │           ├── create/
│   │           │   └── route.ts ← POST: create room + return token
│   │           └── token/
│   │               └── route.ts ← POST: join room + return token
│   │
│   ├── components/
│   │   ├── pool/
│   │   │   ├── BeautyPool.tsx   ← Main 2.5D canvas + traveller layer
│   │   │   ├── TravellerAvatar.tsx  ← Single traveller bubble with status ring
│   │   │   ├── PoolHeader.tsx   ← Top HUD: logo, count, status toggle, nav
│   │   │   └── VoiceBar.tsx     ← Bottom voice bar + LiveKit room UI
│   │   │
│   │   ├── discovery/
│   │   │   └── DiscoveryFeed.tsx    ← Right-side feed + Add Discovery modal
│   │   │
│   │   └── traveller/
│   │       ├── TravellerPanel.tsx   ← Left panel: selected traveller details
│   │       ├── BackpackPanel.tsx    ← Slide-in: my scanned discoveries
│   │       └── PickListPanel.tsx    ← Slide-in: my pick lists by category
│   │
│   ├── hooks/
│   │   └── usePoolRealtime.ts   ← Supabase presence + DB realtime subscription
│   │
│   ├── lib/
│   │   ├── supabase/
│   │   │   ├── client.ts        ← Browser client singleton
│   │   │   └── server.ts        ← Server client (with cookie handling)
│   │   └── livekit.ts           ← Token generation + room name helper
│   │
│   ├── store/
│   │   └── pool-store.ts        ← Zustand: traveller, presences, discoveries, UI state
│   │
│   └── types/
│       └── index.ts             ← TypeScript interfaces for all DB entities
│
├── .env.example                 ← Env variable template
├── next.config.mjs
├── tailwind.config.ts
├── vercel.json
└── package.json
```

## Key Architectural Patterns

### Server vs Client Components
- `app/pool/page.tsx` — Server Component: auth check, DB fetch
- `app/pool/PoolClient.tsx` — Client Component: store hydration
- All interactive UI — Client Components

### State Management
- **Zustand** holds all client state (presences, discoveries, panels)
- **Supabase Realtime** feeds into Zustand via `usePoolRealtime` hook
- **Server state** is fetched once on page load, then updated via realtime

### Realtime Strategy
- **Presence** (ephemeral): who's in the pool, their position and status
- **DB changes** (persistent): new discoveries, lightup counts
- Positions are NOT stored in DB — only in Supabase presence channel

### Data Access Pattern
```
Server Component → createClient() from server.ts → Supabase (with auth cookies)
Client Component → createClient() from client.ts → Supabase (with browser session)
API Route        → createClient() from server.ts → Supabase (with request cookies)
```
