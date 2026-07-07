# Pick Pool — API Design

All API routes are Next.js Route Handlers under `/src/app/api/`.
Authentication is via Supabase session cookies (handled by `@supabase/ssr`).

---

## Authentication

Managed entirely by Supabase Auth client SDK.
No custom API routes needed for auth.

```
POST   (Supabase)  /auth/v1/signup          Sign up with email + password
POST   (Supabase)  /auth/v1/token           Sign in
POST   (Supabase)  /auth/v1/logout          Sign out
```

---

## Travellers

```
GET    /api/travelers                        List all travelers (pool)
GET    /api/travelers/:id                   Get traveler profile + recent discoveries
PATCH  /api/travelers/:id                   Update own traveler (nickname, bio, status, avatar)
```

**Note:** Most traveller reads happen directly via Supabase client with RLS — no custom route needed.

---

## Discoveries

```
GET    /api/discoveries                     Recent pool discoveries (limit, traveller_id filter)
POST   /api/discoveries                     Create a new discovery
```

### POST /api/discoveries
```json
{
  "traveller_id": "uuid",
  "product_name": "毛戈平粉膏",
  "brand": "毛戈平",
  "category": "foundation",
  "notes": "Perfect for dry skin",
  "pick_list_id": "uuid (optional)"
}
```

---

## Backpack

```
GET    /api/backpack                        Get current user's backpack items
POST   /api/backpack                        Scan (save) a discovery to backpack
DELETE /api/backpack/:id                    Remove from backpack
```

### POST /api/backpack (Scan)
```json
{
  "discovery_id": "uuid",
  "scanned_from_traveller_id": "uuid"
}
```

---

## Pick Lists

```
GET    /api/picklists                       Get own pick lists
POST   /api/picklists                       Create a new pick list
PATCH  /api/picklists/:id                   Update a pick list
DELETE /api/picklists/:id                   Delete a pick list
```

### POST /api/picklists
```json
{
  "category": "foundation | lipstick | skincare",
  "name": "My Everyday Foundation",
  "is_public": true
}
```

---

## Light Ups

```
POST   /api/lightups                        Light up a discovery
DELETE /api/lightups                        Remove a light up
```

### POST /api/lightups
```json
{
  "traveller_id": "uuid",
  "discovery_id": "uuid"
}
```

**Constraint:** One light-up per traveller per discovery (enforced by DB unique constraint + trigger updates `lightup_count`).

---

## Friendships

```
GET    /api/friends                         Get own friendships (all statuses)
POST   /api/friends                         Send friend/pool invite
PATCH  /api/friends/:id                     Accept or decline invite
DELETE /api/friends/:id                     Remove friendship
```

### POST /api/friends
```json
{
  "addressee_id": "uuid"
}
```

### PATCH /api/friends/:id
```json
{
  "status": "accepted | declined"
}
```

---

## Voice Rooms

```
POST   /api/voice/create                    Create a voice room + get LiveKit token
POST   /api/voice/token                     Get token to join existing room
POST   /api/voice/end                       End a voice room (host only)
```

### POST /api/voice/create
```json
{ "traveller_id": "uuid" }
```
**Response:**
```json
{
  "token": "livekit-jwt-token",
  "room": { "id": "uuid", "livekit_room_name": "pool-voice-xxx-123", ... }
}
```

### POST /api/voice/token
```json
{
  "room_name": "pool-voice-xxx-123",
  "traveller_id": "uuid",
  "nickname": "PearlDrop"
}
```
**Response:** `{ "token": "livekit-jwt-token" }`

**Validation:**
- Room must exist and be `active`
- Current active participants must be < `max_participants` (4)

---

## Realtime Channels (Supabase)

### Channel: `beauty-pool`
Type: Presence + DB broadcast

**Presence payload** (tracked per traveller):
```json
{
  "traveller_id": "uuid",
  "nickname": "PearlDrop",
  "avatar_url": null,
  "avatar_color": "#7c3aed",
  "status": "online",
  "position_x": 42.5,
  "position_y": 61.3,
  "online_at": "2024-01-01T00:00:00Z"
}
```

**DB broadcast events:**
- `discoveries` INSERT → new discovery in feed
- `lightups` INSERT/DELETE → lightup count changes
- `voice_rooms` UPDATE → room status changes
- `friendships` INSERT → new friend request
