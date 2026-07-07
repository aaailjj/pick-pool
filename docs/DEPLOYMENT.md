# Pick Pool — Deployment Guide

## Prerequisites

- Node.js 20+
- Supabase account (free tier works)
- LiveKit account (free tier: 50 CCU)
- Vercel account

---

## Step 1: Supabase Setup

### 1a. Create Project
1. Go to https://supabase.com/dashboard
2. New project → name "pick-pool" → choose region closest to users (e.g. Northeast Asia for Korea)
3. Wait for provisioning (~2 min)

### 1b. Run Schema
1. Go to SQL Editor in your Supabase dashboard
2. Copy the entire contents of `supabase/schema.sql`
3. Paste and click "Run"
4. Verify all tables were created under Table Editor

### 1c. Configure Auth
1. Auth → Providers → Email: enable "Email confirmations" (optional for MVP)
2. Auth → URL Configuration:
   - Site URL: `https://your-app.vercel.app`
   - Redirect URLs: `https://your-app.vercel.app/**`

### 1d. Configure Realtime
1. Database → Replication
2. Ensure these tables have realtime enabled:
   - travellers, discoveries, lightups, backpacks
   - voice_rooms, voice_room_participants, friendships

### 1e. Get Your Keys
From Settings → API:
- `NEXT_PUBLIC_SUPABASE_URL` (Project URL)
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` (anon/public)
- `SUPABASE_SERVICE_ROLE_KEY` (service_role — keep secret)

---

## Step 2: LiveKit Setup

### 2a. Create Project
1. Go to https://cloud.livekit.io
2. Create new project → "pick-pool"
3. Choose server region (e.g. Seoul ap-northeast)

### 2b. Get Keys
From project settings:
- `NEXT_PUBLIC_LIVEKIT_URL` — wss://your-project.livekit.cloud
- `LIVEKIT_API_KEY` — API key
- `LIVEKIT_API_SECRET` — API secret

### 2c. Configure Room Settings
- Max participants: 4
- Empty timeout: 300s (5 min)
- Room composite egress: disabled (no recording needed)

---

## Step 3: Local Development

```bash
# Clone / navigate to project
cd pick-pool

# Install dependencies
npm install

# Copy env template
cp .env.example .env.local

# Fill in your values in .env.local

# Run dev server
npm run dev
# → http://localhost:3000
```

### Verify local setup:
1. Visit `http://localhost:3000` → redirects to `/auth`
2. Sign up with an email
3. Create your traveler on `/onboard`
4. See the Beauty Pool at `/pool`
5. Open another browser tab (incognito) → sign up another user
6. Both users should appear in the pool in real-time

---

## Step 4: Deploy to Vercel

### 4a. Push to GitHub
```bash
git init
git add .
git commit -m "Initial Pick Pool MVP"
git remote add origin https://github.com/your-org/pick-pool
git push -u origin main
```

### 4b. Import to Vercel
1. https://vercel.com/new
2. Import your GitHub repo
3. Framework: Next.js (auto-detected)
4. Root directory: `./` (or wherever your Next.js app lives)

### 4c. Add Environment Variables
In Vercel project settings → Environment Variables, add:

```
NEXT_PUBLIC_SUPABASE_URL          = https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY     = eyJhbGciOiJ...
SUPABASE_SERVICE_ROLE_KEY         = eyJhbGciOiJ...
NEXT_PUBLIC_LIVEKIT_URL           = wss://pick-pool.livekit.cloud
LIVEKIT_API_KEY                   = APInXXXXXXX
LIVEKIT_API_SECRET                = your-secret
```

### 4d. Deploy
Click "Deploy". Vercel will build and deploy automatically.

### 4e. Update Supabase Auth URLs
In Supabase Auth → URL Configuration:
- Site URL: `https://pick-pool.vercel.app`
- Redirect URLs: `https://pick-pool.vercel.app/**`

---

## Step 5: Post-Deploy Checklist

- [ ] Auth signup/login works
- [ ] Onboarding creates traveller record
- [ ] Pool page loads with 2.5D island
- [ ] Two users can see each other in the pool in real-time
- [ ] Status changes (online/DND) reflect immediately
- [ ] Sharing a discovery appears in the feed for other users
- [ ] Light Up increments counter
- [ ] Scan saves to backpack
- [ ] Pick lists can be created per category
- [ ] Voice room starts and others can join with invite link
- [ ] Max 4 users enforced in voice room

---

## Supabase Storage (Avatar uploads — optional)

To enable avatar image uploads:
1. Supabase Storage → Create bucket: `avatars`
2. Set bucket to public
3. Add RLS policy: users can upload their own avatar

```sql
CREATE POLICY "Avatar: upload own"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Avatar: public read"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'avatars');
```

---

## Scaling Notes (Post-MVP)

| Concern | Solution |
|---|---|
| Many concurrent pool users | Supabase Realtime scales to 500 concurrent by default; upgrade plan for more |
| Discovery feed lag | Add pagination + infinite scroll |
| Voice quality | LiveKit auto-scales; upgrade plan for higher quality codecs |
| Image storage | Supabase Storage with CDN (already included) |
| Global latency | Add Vercel Edge Config + multiple Supabase regions |

---

## Troubleshooting

**Realtime not working locally**
→ Check `NEXT_PUBLIC_SUPABASE_URL` is correct (https, not http)
→ Verify tables are added to supabase_realtime publication in schema.sql

**LiveKit token errors**
→ Check `LIVEKIT_API_KEY` and `LIVEKIT_API_SECRET` are server-side only
→ `NEXT_PUBLIC_LIVEKIT_URL` must start with `wss://`

**Auth redirects to wrong URL**
→ Update Site URL in Supabase Auth settings to match your current domain

**Traveller not found after signup**
→ Ensure onboard page creates the traveller row before redirecting to /pool
