-- Migration for Outside Checks Flow
-- Creates tables for checklist items and snags

-- Create checklist_categories table
CREATE TABLE IF NOT EXISTS public.checklist_categories (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  display_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Create checklist_items table
CREATE TABLE IF NOT EXISTS public.checklist_items (
  id SERIAL PRIMARY KEY,
  category_id INTEGER NOT NULL REFERENCES public.checklist_categories(id) ON DELETE CASCADE,
  original_text TEXT NOT NULL,
  friendly_text TEXT NOT NULL,
  display_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  UNIQUE(category_id, display_order)
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

-- Create progress tracking table
CREATE TABLE IF NOT EXISTS public.user_progress (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  category_slug TEXT NOT NULL,
  current_step INTEGER NOT NULL DEFAULT 1,
  is_complete BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  UNIQUE(user_id, category_slug)
);

-- Set up Row Level Security (RLS)
ALTER TABLE public.checklist_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.checklist_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.snags ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_progress ENABLE ROW LEVEL SECURITY;

-- Create policies for checklist_categories (read-only for users)
CREATE POLICY "Anyone can view checklist categories"
  ON public.checklist_categories
  FOR SELECT
  TO authenticated
  USING (true);

-- Create policies for checklist_items (read-only for users)
CREATE POLICY "Anyone can view checklist items"
  ON public.checklist_items
  FOR SELECT
  TO authenticated
  USING (true);

-- Create policies for snags
CREATE POLICY "Users can view their own snags"
  ON public.snags
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own snags"
  ON public.snags
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own snags"
  ON public.snags
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own snags"
  ON public.snags
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Create policies for user_progress
CREATE POLICY "Users can view their own progress"
  ON public.user_progress
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own progress"
  ON public.user_progress
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own progress"
  ON public.user_progress
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

-- Add trigger for updated_at on snags
CREATE TRIGGER set_snags_updated_at
BEFORE UPDATE ON public.snags
FOR EACH ROW
EXECUTE FUNCTION update_modified_column();

-- Add trigger for updated_at on user_progress
CREATE TRIGGER set_user_progress_updated_at
BEFORE UPDATE ON public.user_progress
FOR EACH ROW
EXECUTE FUNCTION update_modified_column();

-- Insert outside checklist category
INSERT INTO public.checklist_categories (name, slug, display_order)
VALUES ('Outside Checks', 'outside', 1)
ON CONFLICT (slug) DO NOTHING;

-- Insert outside checklist items from the NHBC checklist
INSERT INTO public.checklist_items (category_id, original_text, friendly_text, display_order)
VALUES 
-- The brickwork
(
  (SELECT id FROM public.checklist_categories WHERE slug = 'outside'),
  'Is the brickwork clean and free from major chips and mortar splashes?',
  'Check all the brickwork around the house to make sure it''s free from major chips or splashes of cement and mortar.',
  1
),
(
  (SELECT id FROM public.checklist_categories WHERE slug = 'outside'),
  'Is the mortar evenly finished and of a consistent colour?',
  'Examine the mortar between bricks to ensure it has an even finish and consistent color throughout.',
  2
),

-- External paintwork
(
  (SELECT id FROM public.checklist_categories WHERE slug = 'outside'),
  'Has a top coat been applied to all painted surfaces; and is the finish to a satisfactory standard?',
  'Look at all painted surfaces outside the house. Check that they have a proper top coat and the finish looks professional and complete.',
  3
),
(
  (SELECT id FROM public.checklist_categories WHERE slug = 'outside'),
  'Have the window sills been finished off, including exposed undersides of the sill?',
  'Inspect all window sills, including underneath them, to make sure they''re properly finished and painted.',
  4
),

-- External pipes/outside drainage
(
  (SELECT id FROM public.checklist_categories WHERE slug = 'outside'),
  'Do the downpipes and guttering appear secure?',
  'Check that all downpipes and guttering are firmly attached to the house and don''t appear loose or wobbly.',
  5
),
(
  (SELECT id FROM public.checklist_categories WHERE slug = 'outside'),
  'Are there any visible leaks or blockages from leaves and other debris?',
  'Look for any signs of water leakage from gutters or pipes, and check for blockages caused by leaves or other debris.',
  6
),
(
  (SELECT id FROM public.checklist_categories WHERE slug = 'outside'),
  'Are manhole covers level with the surrounding surfaces – and do they fit properly?',
  'Check that manhole covers are flush with the surrounding ground and fit properly without rocking or moving when stepped on.',
  7
),

-- Garages
(
  (SELECT id FROM public.checklist_categories WHERE slug = 'outside'),
  'Do garage doors open and shut properly?',
  'Test the garage door to make sure it opens and closes smoothly without sticking or making unusual noises.',
  8
),
(
  (SELECT id FROM public.checklist_categories WHERE slug = 'outside'),
  'Has debris and builders'' rubbish been removed from inside the garage?',
  'Look inside the garage to ensure all construction debris and builders'' rubbish has been completely removed.',
  9
),

-- Gardens
(
  (SELECT id FROM public.checklist_categories WHERE slug = 'outside'),
  'Has debris and builders'' rubbish been removed?',
  'Check the garden area to make sure all construction debris and builders'' materials have been cleared away.',
  10
),
(
  (SELECT id FROM public.checklist_categories WHERE slug = 'outside'),
  'Where specified, has landscaping of the garden been carried out?',
  'If your contract included landscaping work, verify that it has been completed according to the specifications.',
  11
),

-- Walls, fences and gates
(
  (SELECT id FROM public.checklist_categories WHERE slug = 'outside'),
  'Are boundary walls complete?',
  'Check that all boundary walls are fully built and finished according to the plans.',
  12
),
(
  (SELECT id FROM public.checklist_categories WHERE slug = 'outside'),
  'Are fences secure?',
  'Test all fence panels and posts to ensure they are firmly fixed and don''t wobble or move easily.',
  13
),
(
  (SELECT id FROM public.checklist_categories WHERE slug = 'outside'),
  'Are outside gates in working order?',
  'Open and close all outside gates to check they operate properly, with functional latches and hinges.',
  14
),

-- The roof
(
  (SELECT id FROM public.checklist_categories WHERE slug = 'outside'),
  'Do any of the tiles look cracked or loose?',
  'Look at the roof tiles from ground level (do not climb on the roof) to check for any that appear cracked, loose, or out of place.',
  15
),

-- Drives and pathways
(
  (SELECT id FROM public.checklist_categories WHERE slug = 'outside'),
  'Are drives and pathways complete?',
  'Check that all driveways and paths are fully finished with no missing sections or incomplete areas.',
  16
),
(
  (SELECT id FROM public.checklist_categories WHERE slug = 'outside'),
  'Are the surfaces even?',
  'Walk along all paved surfaces to ensure they are even, without significant dips, bumps or trip hazards.',
  17
),
(
  (SELECT id FROM public.checklist_categories WHERE slug = 'outside'),
  'Does the gradient and access of the drive/path allow for clear access?',
  'Check that the slope of driveways and paths is appropriate and allows for easy access, particularly for those with mobility needs.',
  18
)
ON CONFLICT DO NOTHING;
