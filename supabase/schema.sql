-- ============================================================
-- PICK POOL — Complete Database Schema
-- Run this in your Supabase SQL Editor
-- ============================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================
-- ENUMS
-- ============================================================

CREATE TYPE traveler_status AS ENUM ('online', 'do_not_disturb', 'offline');
CREATE TYPE pick_list_category AS ENUM ('foundation', 'lipstick', 'skincare');
CREATE TYPE friendship_status AS ENUM ('pending', 'accepted', 'declined');
CREATE TYPE voice_room_status AS ENUM ('active', 'ended');

-- ============================================================
-- TABLES
-- ============================================================

-- 1. USERS (extends Supabase auth.users)
CREATE TABLE public.users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL UNIQUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. TRAVELLERS (profile layer on top of users)
CREATE TABLE public.travellers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL UNIQUE REFERENCES public.users(id) ON DELETE CASCADE,
  nickname TEXT NOT NULL,
  avatar_url TEXT,
  avatar_color TEXT NOT NULL DEFAULT '#A78BFA', -- fallback color for generated avatar
  status traveler_status NOT NULL DEFAULT 'online',
  bio TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. PICK LISTS (curated product lists per traveller)
CREATE TABLE public.pick_lists (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  traveller_id UUID NOT NULL REFERENCES public.travellers(id) ON DELETE CASCADE,
  category pick_list_category NOT NULL,
  name TEXT NOT NULL, -- e.g. "My Everyday Foundations"
  is_public BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(traveller_id, category, name)
);

-- 4. DISCOVERIES (individual beauty product finds)
CREATE TABLE public.discoveries (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  traveller_id UUID NOT NULL REFERENCES public.travellers(id) ON DELETE CASCADE,
  product_name TEXT NOT NULL,          -- e.g. "毛戈平粉膏"
  brand TEXT,                          -- e.g. "毛戈平"
  category pick_list_category,
  notes TEXT,
  image_url TEXT,
  pick_list_id UUID REFERENCES public.pick_lists(id) ON DELETE SET NULL,
  lightup_count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 5. BACKPACKS (discoveries saved from others via Scan)
CREATE TABLE public.backpacks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  traveller_id UUID NOT NULL REFERENCES public.travellers(id) ON DELETE CASCADE,
  discovery_id UUID NOT NULL REFERENCES public.discoveries(id) ON DELETE CASCADE,
  scanned_from_traveller_id UUID REFERENCES public.travellers(id) ON DELETE SET NULL,
  saved_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(traveller_id, discovery_id) -- can't save same discovery twice
);

-- 6. LIGHTUPS (a traveller "lights up" another's discovery)
CREATE TABLE public.lightups (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  traveller_id UUID NOT NULL REFERENCES public.travellers(id) ON DELETE CASCADE,
  discovery_id UUID NOT NULL REFERENCES public.discoveries(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(traveller_id, discovery_id) -- one lightup per person per discovery
);

-- 7. FRIENDSHIPS
CREATE TABLE public.friendships (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  requester_id UUID NOT NULL REFERENCES public.travellers(id) ON DELETE CASCADE,
  addressee_id UUID NOT NULL REFERENCES public.travellers(id) ON DELETE CASCADE,
  status friendship_status NOT NULL DEFAULT 'pending',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CHECK (requester_id != addressee_id),
  UNIQUE(requester_id, addressee_id)
);

-- 8. VOICE ROOMS
CREATE TABLE public.voice_rooms (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  livekit_room_name TEXT NOT NULL UNIQUE,
  host_traveller_id UUID NOT NULL REFERENCES public.travellers(id) ON DELETE CASCADE,
  status voice_room_status NOT NULL DEFAULT 'active',
  max_participants INTEGER NOT NULL DEFAULT 4,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  ended_at TIMESTAMPTZ
);

-- 9. VOICE ROOM PARTICIPANTS
CREATE TABLE public.voice_room_participants (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  room_id UUID NOT NULL REFERENCES public.voice_rooms(id) ON DELETE CASCADE,
  traveller_id UUID NOT NULL REFERENCES public.travellers(id) ON DELETE CASCADE,
  joined_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  left_at TIMESTAMPTZ,
  UNIQUE(room_id, traveller_id)
);

-- ============================================================
-- INDEXES
-- ============================================================

CREATE INDEX idx_travellers_user_id ON public.travellers(user_id);
CREATE INDEX idx_travellers_status ON public.travellers(status);
CREATE INDEX idx_pick_lists_traveller_id ON public.pick_lists(traveller_id);
CREATE INDEX idx_discoveries_traveller_id ON public.discoveries(traveller_id);
CREATE INDEX idx_discoveries_created_at ON public.discoveries(created_at DESC);
CREATE INDEX idx_backpacks_traveller_id ON public.backpacks(traveller_id);
CREATE INDEX idx_lightups_discovery_id ON public.lightups(discovery_id);
CREATE INDEX idx_friendships_requester ON public.friendships(requester_id);
CREATE INDEX idx_friendships_addressee ON public.friendships(addressee_id);
CREATE INDEX idx_voice_participants_room ON public.voice_room_participants(room_id);

-- ============================================================
-- UPDATED_AT TRIGGER
-- ============================================================

CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_users_updated_at
  BEFORE UPDATE ON public.users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER trg_travellers_updated_at
  BEFORE UPDATE ON public.travellers
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER trg_pick_lists_updated_at
  BEFORE UPDATE ON public.pick_lists
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER trg_discoveries_updated_at
  BEFORE UPDATE ON public.discoveries
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER trg_friendships_updated_at
  BEFORE UPDATE ON public.friendships
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ============================================================
-- LIGHTUP COUNT TRIGGER (auto-sync lightup_count on discoveries)
-- ============================================================

CREATE OR REPLACE FUNCTION sync_lightup_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.discoveries
    SET lightup_count = lightup_count + 1
    WHERE id = NEW.discovery_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.discoveries
    SET lightup_count = GREATEST(lightup_count - 1, 0)
    WHERE id = OLD.discovery_id;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_sync_lightup_count
  AFTER INSERT OR DELETE ON public.lightups
  FOR EACH ROW EXECUTE FUNCTION sync_lightup_count();

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================

ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.travellers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pick_lists ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.discoveries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.backpacks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lightups ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.friendships ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.voice_rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.voice_room_participants ENABLE ROW LEVEL SECURITY;

-- Helper: get current traveller id
CREATE OR REPLACE FUNCTION auth.traveller_id()
RETURNS UUID AS $$
  SELECT id FROM public.travellers WHERE user_id = auth.uid()
$$ LANGUAGE SQL SECURITY DEFINER STABLE;

-- USERS policies
CREATE POLICY "Users can read own record" ON public.users
  FOR SELECT USING (id = auth.uid());
CREATE POLICY "Users can update own record" ON public.users
  FOR UPDATE USING (id = auth.uid());

-- TRAVELLERS policies
CREATE POLICY "Anyone can read travellers" ON public.travellers
  FOR SELECT USING (TRUE); -- pool is public
CREATE POLICY "Own traveller: insert" ON public.travellers
  FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "Own traveller: update" ON public.travellers
  FOR UPDATE USING (user_id = auth.uid());

-- PICK LISTS policies
CREATE POLICY "Public lists are readable" ON public.pick_lists
  FOR SELECT USING (is_public = TRUE OR traveller_id = auth.traveller_id());
CREATE POLICY "Own pick lists: insert" ON public.pick_lists
  FOR INSERT WITH CHECK (traveller_id = auth.traveller_id());
CREATE POLICY "Own pick lists: update" ON public.pick_lists
  FOR UPDATE USING (traveller_id = auth.traveller_id());
CREATE POLICY "Own pick lists: delete" ON public.pick_lists
  FOR DELETE USING (traveller_id = auth.traveller_id());

-- DISCOVERIES policies
CREATE POLICY "Anyone can read discoveries" ON public.discoveries
  FOR SELECT USING (TRUE);
CREATE POLICY "Own discoveries: insert" ON public.discoveries
  FOR INSERT WITH CHECK (traveller_id = auth.traveller_id());
CREATE POLICY "Own discoveries: update" ON public.discoveries
  FOR UPDATE USING (traveller_id = auth.traveller_id());
CREATE POLICY "Own discoveries: delete" ON public.discoveries
  FOR DELETE USING (traveller_id = auth.traveller_id());

-- BACKPACKS policies
CREATE POLICY "Own backpack: read" ON public.backpacks
  FOR SELECT USING (traveller_id = auth.traveller_id());
CREATE POLICY "Own backpack: insert" ON public.backpacks
  FOR INSERT WITH CHECK (traveller_id = auth.traveller_id());
CREATE POLICY "Own backpack: delete" ON public.backpacks
  FOR DELETE USING (traveller_id = auth.traveller_id());

-- LIGHTUPS policies
CREATE POLICY "Anyone can read lightups" ON public.lightups
  FOR SELECT USING (TRUE);
CREATE POLICY "Own lightups: insert" ON public.lightups
  FOR INSERT WITH CHECK (traveller_id = auth.traveller_id());
CREATE POLICY "Own lightups: delete" ON public.lightups
  FOR DELETE USING (traveller_id = auth.traveller_id());

-- FRIENDSHIPS policies
CREATE POLICY "Friendship: read own" ON public.friendships
  FOR SELECT USING (
    requester_id = auth.traveller_id() OR
    addressee_id = auth.traveller_id()
  );
CREATE POLICY "Friendship: insert" ON public.friendships
  FOR INSERT WITH CHECK (requester_id = auth.traveller_id());
CREATE POLICY "Friendship: update" ON public.friendships
  FOR UPDATE USING (
    requester_id = auth.traveller_id() OR
    addressee_id = auth.traveller_id()
  );

-- VOICE ROOMS policies
CREATE POLICY "Voice rooms: read active" ON public.voice_rooms
  FOR SELECT USING (status = 'active');
CREATE POLICY "Voice rooms: insert" ON public.voice_rooms
  FOR INSERT WITH CHECK (host_traveller_id = auth.traveller_id());
CREATE POLICY "Voice rooms: update host" ON public.voice_rooms
  FOR UPDATE USING (host_traveller_id = auth.traveller_id());

-- VOICE ROOM PARTICIPANTS policies
CREATE POLICY "Participants: read" ON public.voice_room_participants
  FOR SELECT USING (TRUE);
CREATE POLICY "Participants: insert" ON public.voice_room_participants
  FOR INSERT WITH CHECK (traveller_id = auth.traveller_id());
CREATE POLICY "Participants: update" ON public.voice_room_participants
  FOR UPDATE USING (traveller_id = auth.traveller_id());

-- ============================================================
-- REALTIME PUBLICATIONS
-- ============================================================

-- Enable realtime on key tables
ALTER PUBLICATION supabase_realtime ADD TABLE public.travellers;
ALTER PUBLICATION supabase_realtime ADD TABLE public.discoveries;
ALTER PUBLICATION supabase_realtime ADD TABLE public.lightups;
ALTER PUBLICATION supabase_realtime ADD TABLE public.backpacks;
ALTER PUBLICATION supabase_realtime ADD TABLE public.voice_rooms;
ALTER PUBLICATION supabase_realtime ADD TABLE public.voice_room_participants;
ALTER PUBLICATION supabase_realtime ADD TABLE public.friendships;

-- ============================================================
-- SEED DATA (for development)
-- ============================================================

-- Note: Run after creating your auth users via Supabase Auth UI or API
-- INSERT INTO public.users (id, email) VALUES ('your-auth-user-uuid', 'test@example.com');
-- INSERT INTO public.travellers (user_id, nickname, avatar_color)
--   VALUES ('your-auth-user-uuid', 'PearlDrop', '#F472B6');
