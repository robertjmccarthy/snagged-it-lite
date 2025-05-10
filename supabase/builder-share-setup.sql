-- Create builder_shares table to store information about shares with builders
CREATE TABLE IF NOT EXISTS builder_shares (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  builder_name TEXT NOT NULL,
  builder_email TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  payment_status TEXT DEFAULT 'pending', -- pending, paid, failed
  payment_intent_id TEXT,
  pdf_url TEXT,
  email_sent BOOLEAN DEFAULT FALSE
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS builder_shares_user_id_idx ON builder_shares(user_id);

-- Enable Row Level Security
ALTER TABLE builder_shares ENABLE ROW LEVEL SECURITY;

-- Create policy to allow users to view only their own builder shares
CREATE POLICY builder_shares_select_policy ON builder_shares
  FOR SELECT USING (auth.uid() = user_id);

-- Create policy to allow users to insert their own builder shares
CREATE POLICY builder_shares_insert_policy ON builder_shares
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Create policy to allow users to update only their own builder shares
CREATE POLICY builder_shares_update_policy ON builder_shares
  FOR UPDATE USING (auth.uid() = user_id);

-- Create trigger to update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_builder_shares_updated_at
BEFORE UPDATE ON builder_shares
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();
