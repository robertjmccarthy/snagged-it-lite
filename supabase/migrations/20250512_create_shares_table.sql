-- Create shares table for storing share data
CREATE TABLE IF NOT EXISTS public.shares (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  address TEXT NOT NULL,
  builder_type TEXT NOT NULL,
  builder_name TEXT NOT NULL,
  builder_email TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('pending_payment', 'paid', 'sent', 'failed')),
  payment_id TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ,
  sent_at TIMESTAMPTZ
);

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS shares_user_id_idx ON public.shares(user_id);
CREATE INDEX IF NOT EXISTS shares_status_idx ON public.shares(status);

-- Add Row Level Security (RLS) policies
ALTER TABLE public.shares ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only view their own shares
CREATE POLICY "Users can view their own shares"
  ON public.shares
  FOR SELECT
  USING (auth.uid() = user_id);

-- Policy: Users can only insert their own shares
CREATE POLICY "Users can insert their own shares"
  ON public.shares
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Policy: Users can only update their own shares
CREATE POLICY "Users can update their own shares"
  ON public.shares
  FOR UPDATE
  USING (auth.uid() = user_id);

-- Grant access to authenticated users
GRANT SELECT, INSERT, UPDATE ON public.shares TO authenticated;
