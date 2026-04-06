-- Create host_sessions table for WayTm guest navigation
CREATE TABLE IF NOT EXISTS public.host_sessions (
  id TEXT PRIMARY KEY,
  host_name TEXT NOT NULL,
  org_name TEXT NOT NULL,
  lat DOUBLE PRECISION NOT NULL,
  lng DOUBLE PRECISION NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index for fast lookup by id
CREATE INDEX IF NOT EXISTS idx_host_sessions_id ON public.host_sessions(id);

-- Enable RLS
ALTER TABLE public.host_sessions ENABLE ROW LEVEL SECURITY;

-- Public read: anyone with the link ID can fetch the session
DROP POLICY IF EXISTS "public_read_host_sessions" ON public.host_sessions;
CREATE POLICY "public_read_host_sessions"
  ON public.host_sessions
  FOR SELECT
  TO public
  USING (true);

-- Public insert: anyone can create a session (no auth required)
DROP POLICY IF EXISTS "public_insert_host_sessions" ON public.host_sessions;
CREATE POLICY "public_insert_host_sessions"
  ON public.host_sessions
  FOR INSERT
  TO public
  WITH CHECK (true);
