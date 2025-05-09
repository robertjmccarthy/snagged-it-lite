-- SnaggedIt Lite Checklist Tables Setup Script
-- Run this in the Supabase SQL Editor to set up the checklist functionality

-- Create checklist_categories table
CREATE TABLE IF NOT EXISTS public.checklist_categories (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  display_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Create checklist_items table
CREATE TABLE IF NOT EXISTS public.checklist_items (
  id SERIAL PRIMARY KEY,
  category_id INTEGER NOT NULL REFERENCES public.checklist_categories(id) ON DELETE CASCADE,
  original_text TEXT NOT NULL,
  friendly_text TEXT NOT NULL,
  display_order INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Create snags table
CREATE TABLE IF NOT EXISTS public.snags (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  checklist_item_id INTEGER NOT NULL REFERENCES public.checklist_items(id) ON DELETE CASCADE,
  note TEXT,
  photo_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Create user_progress table
CREATE TABLE IF NOT EXISTS public.user_progress (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  category_slug TEXT NOT NULL REFERENCES public.checklist_categories(slug) ON DELETE CASCADE,
  current_step INTEGER NOT NULL DEFAULT 1,
  is_complete BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  UNIQUE(user_id, category_slug)
);

-- Add triggers for updated_at columns
DROP TRIGGER IF EXISTS set_checklist_categories_updated_at ON public.checklist_categories;
CREATE TRIGGER set_checklist_categories_updated_at
BEFORE UPDATE ON public.checklist_categories
FOR EACH ROW
EXECUTE FUNCTION update_modified_column();

DROP TRIGGER IF EXISTS set_checklist_items_updated_at ON public.checklist_items;
CREATE TRIGGER set_checklist_items_updated_at
BEFORE UPDATE ON public.checklist_items
FOR EACH ROW
EXECUTE FUNCTION update_modified_column();

DROP TRIGGER IF EXISTS set_snags_updated_at ON public.snags;
CREATE TRIGGER set_snags_updated_at
BEFORE UPDATE ON public.snags
FOR EACH ROW
EXECUTE FUNCTION update_modified_column();

DROP TRIGGER IF EXISTS set_user_progress_updated_at ON public.user_progress;
CREATE TRIGGER set_user_progress_updated_at
BEFORE UPDATE ON public.user_progress
FOR EACH ROW
EXECUTE FUNCTION update_modified_column();

-- Set up Row Level Security (RLS)
ALTER TABLE public.checklist_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.checklist_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.snags ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_progress ENABLE ROW LEVEL SECURITY;

-- Create policies for checklist_categories table (everyone can view)
DROP POLICY IF EXISTS "Anyone can view checklist categories" ON public.checklist_categories;
CREATE POLICY "Anyone can view checklist categories"
  ON public.checklist_categories
  FOR SELECT
  TO authenticated
  USING (true);

-- Create policies for checklist_items table (everyone can view)
DROP POLICY IF EXISTS "Anyone can view checklist items" ON public.checklist_items;
CREATE POLICY "Anyone can view checklist items"
  ON public.checklist_items
  FOR SELECT
  TO authenticated
  USING (true);

-- Create policies for snags table
DROP POLICY IF EXISTS "Users can view their own snags" ON public.snags;
CREATE POLICY "Users can view their own snags"
  ON public.snags
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert their own snags" ON public.snags;
CREATE POLICY "Users can insert their own snags"
  ON public.snags
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own snags" ON public.snags;
CREATE POLICY "Users can update their own snags"
  ON public.snags
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete their own snags" ON public.snags;
CREATE POLICY "Users can delete their own snags"
  ON public.snags
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Create policies for user_progress table
DROP POLICY IF EXISTS "Users can view their own progress" ON public.user_progress;
CREATE POLICY "Users can view their own progress"
  ON public.user_progress
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert their own progress" ON public.user_progress;
CREATE POLICY "Users can insert their own progress"
  ON public.user_progress
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own progress" ON public.user_progress;
CREATE POLICY "Users can update their own progress"
  ON public.user_progress
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS checklist_items_category_id_idx ON public.checklist_items (category_id);
CREATE INDEX IF NOT EXISTS checklist_items_display_order_idx ON public.checklist_items (display_order);
CREATE INDEX IF NOT EXISTS snags_user_id_idx ON public.snags (user_id);
CREATE INDEX IF NOT EXISTS snags_checklist_item_id_idx ON public.snags (checklist_item_id);
CREATE INDEX IF NOT EXISTS user_progress_user_id_idx ON public.user_progress (user_id);
CREATE INDEX IF NOT EXISTS user_progress_category_slug_idx ON public.user_progress (category_slug);

-- Insert sample data for outside checks
INSERT INTO public.checklist_categories (name, slug, display_order)
VALUES ('Outside Checks', 'outside', 1)
ON CONFLICT (slug) DO NOTHING;

-- Get the ID of the outside category
DO $$
DECLARE
    outside_category_id INTEGER;
BEGIN
    SELECT id INTO outside_category_id FROM public.checklist_categories WHERE slug = 'outside';
    
    -- Insert checklist items for outside checks
    INSERT INTO public.checklist_items (category_id, original_text, friendly_text, display_order)
    VALUES 
    (outside_category_id, 'Is the brickwork clean and free from major chips and mortar splashes?', 'Look at all the bricks on the house. Make sure there are no big chips or splashes of mortar.', 1),
    (outside_category_id, 'Is the mortar evenly finished and of a consistent colour?', 'Look at the lines between the bricks. Make sure the mortar is even and the same colour all the way.', 2),
    (outside_category_id, 'Has a top coat been applied to all painted surfaces; and is the finish to a satisfactory standard?', 'Walk all the way around the house. Check that every painted part has a smooth top coat.', 3),
    (outside_category_id, 'Are the window sills properly finished?', 'Look at each window sill, including the bottom side. Make sure the paint is finished neatly.', 4),
    (outside_category_id, 'Do the downpipes and guttering appear secure?', 'Check the pipes and gutters. Make sure they are stuck on tight and don''t wobble.', 5),
    (outside_category_id, 'Are the pipes and drains clear of debris?', 'Look inside pipes and drains. Make sure no leaves or rubbish are blocking them.', 6),
    (outside_category_id, 'Are the manhole covers properly seated?', 'Look at the manhole covers on the ground. Make sure they sit flat and do not rock.', 7),
    (outside_category_id, 'Do the garage doors operate smoothly?', 'Open and close each garage door. Make sure they move easily and don''t get stuck.', 8),
    (outside_category_id, 'Is the garage free of construction debris?', 'Go inside the garage. Make sure all builders'' rubbish is gone.', 9),
    (outside_category_id, 'Are the driveways and paths complete?', 'Walk on the drive and paths. Make sure they are all laid down and not missing bits.', 10),
    (outside_category_id, 'Are the driveways and paths level?', 'Walk on them again. Make sure they are even and don''t have bumps.', 11),
    (outside_category_id, 'Is there adequate access for vehicles and pedestrians?', 'Check the slope and space. Make sure cars and people can get on and off easily.', 12),
    (outside_category_id, 'Has the garden been cleared of construction debris?', 'Look in the garden. Make sure all builders'' rubbish is cleared away.', 13),
    (outside_category_id, 'Has the planned landscaping been completed?', 'Check the garden beds. Make sure any planned planting or grass is done.', 14),
    (outside_category_id, 'Are the boundary walls complete?', 'Walk along the boundary walls. Make sure they are all built and have no gaps.', 15),
    (outside_category_id, 'Are the fences secure?', 'Give each fence a small push. Make sure it does not wobble.', 16),
    (outside_category_id, 'Do the gates operate properly?', 'Open and close each gate. Make sure they swing easily and latch closed.', 17),
    (outside_category_id, 'Do any of the roof tiles look cracked or loose?', 'Stand back from the house. Look up and see if any roof tiles are broken or loose.', 18)
    ON CONFLICT DO NOTHING;
END $$;

-- Create storage bucket for snag photos if it doesn't exist
-- Note: This needs to be done manually in the Supabase dashboard
-- 1. Go to Storage in the Supabase dashboard
-- 2. Create a new bucket named 'snags'
-- 3. Set the bucket to public or private depending on your requirements
-- 4. Set up appropriate policies for the bucket
