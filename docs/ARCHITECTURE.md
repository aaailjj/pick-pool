# Pick Pool — Architecture Document

## Overview

Pick Pool is a real-time beauty product discovery space. Users enter a shared "Beauty Pool" as water-drop travelers, discover products, collect finds, and make decisions together.

---

## System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        CLIENT (Browser)                      │
│                                                             │
│   Next.js 14 App Router  ──  TailwindCSS + Custom SVG UI   │
│   ┌──────────────┐  ┌──────────────┐  ┌─────────────────┐  │
│   │  Beauty Pool │  │  Pick Lists  │  │   Backpack       │  │
│   │  (2.5D Canvas)│  │  Foundation │  │   My Discoveries│  │
│   │  Travelers   │  │  Lipstick   │  │   Scanned Items │  │
│   │  Discoveries │  │  Skincare   │  │                 │  │
│   └──────────────┘  └──────────────┘  └─────────────────┘  │
│            │                │                  │             │
│   ┌────────────────────────────────────────────┐            │
│   │         Zustand Store (Client State)        │            │
│   └────────────────────────────────────────────┘            │
│            │                                                 │
│   ┌────────┴────────┐    ┌──────────────────────┐           │
│   │ Supabase Client │    │   LiveKit Client SDK  │           │
│   └────────┬────────┘    └──────────┬───────────┘           │
└────────────┼──────────────────────────────────────┘
             │                        │
             ▼                        ▼
┌────────────────────┐    ┌───────────────────────────┐
│  Supabase Platform │    │   LiveKit Cloud / Server  │
│                    │    │                           │
│  ┌──────────────┐  │    │   Voice Rooms (max 4)     │
│  │  PostgreSQL  │  │    │   Token Auth via API      │
│  │  Database    │  │    └───────────────────────────┘
│  └──────────────┘  │
│  ┌──────────────┐  │
│  │  Realtime    │  │    ← Presence + DB changes broadcast
│  │  Channels    │  │
│  └──────────────┘  │
│  ┌──────────────┐  │
│  │  Auth        │  │    ← Email/Password, JWT
│  └──────────────┘  │
│  ┌──────────────┐  │
│  │  Storage     │  │    ← Avatar images
│  └──────────────┘  │
└────────────────────┘
             │
             ▼
┌────────────────────┐
│   Vercel (Deploy)  │
│   Next.js Edge     │
│   API Routes       │
└────────────────────┘
```

---

## Data Flow

### Real-Time Presence (Who's in the Pool)
```
User Opens Pool
  → Subscribe to Supabase Realtime channel: "beauty-pool"
  → Broadcast presence: { user_id, status, position_x, position_y }
  → Receive all other travelers' presence
  → Render traveler avatars on 2.5D canvas
```

### Discovery Flow
```
User sees product → clicks "Scan" → saves to own backpack
                                  → broadcasts to nearby travelers
Other user sees discovery → clicks "Light Up" → increments lightup count
                                              → saves to own backpack
```

### Voice Room Flow
```
User clicks "Voice" → POST /api/voice/create → LiveKit room created
                    → LiveKit token issued
                    → Share invite link to friends
Friends join → GET /api/voice/token → join same LiveKit room
```

---

## Key Design Decisions

1. **No user-generated rooms** — one global Beauty Pool. Everyone is in the same space.
2. **Positions are ephemeral** — traveler positions stored in Realtime presence, not DB.
3. **Discoveries are immutable** — once scanned, they persist in backpack. Editing = new entry.
4. **Voice is ephemeral** — voice_rooms table tracks who's in a call; no recording.
5. **Friendships are symmetric** — one row per pair, status: pending/accepted.
