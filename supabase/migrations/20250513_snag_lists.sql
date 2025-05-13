-- Create snag_lists table to track multiple snag lists per user
CREATE TABLE IF NOT EXISTS snag_lists (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  is_active BOOLEAN DEFAULT TRUE,
  share_id UUID REFERENCES shares(id),
  address TEXT,
  builder_name TEXT,
  builder_email TEXT,
  shared_at TIMESTAMP WITH TIME ZONE
);

-- Add RLS policies for snag_lists
ALTER TABLE snag_lists ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their own snag lists" ON snag_lists FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own snag lists" ON snag_lists FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own snag lists" ON snag_lists FOR UPDATE USING (auth.uid() = user_id);

-- Add snag_list_id to existing snags table
ALTER TABLE snags ADD COLUMN IF NOT EXISTS snag_list_id UUID REFERENCES snag_lists(id);

-- Add index for faster queries
CREATE INDEX IF NOT EXISTS idx_snags_snag_list_id ON snags(snag_list_id);
CREATE INDEX IF NOT EXISTS idx_snag_lists_user_id ON snag_lists(user_id);

-- Create a function to migrate existing snags to a default snag list
CREATE OR REPLACE FUNCTION migrate_existing_snags()
RETURNS void AS $$
DECLARE
    user_record RECORD;
    new_snag_list_id UUID;
    share_record RECORD;
BEGIN
    -- For each user with snags
    FOR user_record IN 
        SELECT DISTINCT user_id FROM snags WHERE snag_list_id IS NULL
    LOOP
        -- Check if user has a share
        SELECT * INTO share_record FROM shares 
        WHERE user_id = user_record.user_id 
        ORDER BY created_at DESC LIMIT 1;
        
        -- Create a default snag list for this user
        INSERT INTO snag_lists (
            user_id, 
            name, 
            share_id,
            address,
            builder_name,
            builder_email,
            shared_at
        ) VALUES (
            user_record.user_id, 
            'Default Snag List',
            share_record.id,
            share_record.address,
            share_record.builder_name,
            share_record.builder_email,
            share_record.updated_at
        )
        RETURNING id INTO new_snag_list_id;
        
        -- Update all existing snags for this user to point to the new snag list
        UPDATE snags 
        SET snag_list_id = new_snag_list_id 
        WHERE user_id = user_record.user_id AND snag_list_id IS NULL;
    END LOOP;
END;
$$ LANGUAGE plpgsql;

-- Execute the migration function
SELECT migrate_existing_snags();

-- Drop the migration function after use
DROP FUNCTION migrate_existing_snags();
