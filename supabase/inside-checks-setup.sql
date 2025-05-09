-- Create inside checks category if it doesn't exist
INSERT INTO public.checklist_categories (name, slug, display_order)
VALUES ('Inside Checks', 'inside', 2)
ON CONFLICT (slug) DO UPDATE SET name = 'Inside Checks', display_order = 2;

-- Get the category ID for inside checks
DO $$
DECLARE
    inside_category_id INTEGER;
BEGIN
    SELECT id INTO inside_category_id FROM public.checklist_categories WHERE slug = 'inside';

    -- Delete any existing inside checklist items to avoid duplicates
    DELETE FROM public.checklist_items WHERE category_id = inside_category_id;

    -- Insert the 40 inside check prompts
    INSERT INTO public.checklist_items (category_id, original_text, friendly_text, display_order) VALUES
    (inside_category_id, 'Inspect walls and ceiling for surface imperfections, particularly in corners and at height.', 'Look at the walls and ceiling. Make sure there are no rough patches, especially in corners or high up.', 1),
    (inside_category_id, 'Examine plaster finishes around service penetrations, switches, and outlets.', 'Check around pipes, light switches, and sockets. Make sure the plaster edges are neat.', 2),
    (inside_category_id, 'Inspect painted wall surfaces for coverage and blemishes.', 'Walk around and look at all painted walls. Make sure the paint covers everything and has no marks.', 3),
    (inside_category_id, 'Check wall junctions for visible seams or cracks.', 'Check where two bits of wall meet. Make sure you can''t see any cracks or lines.', 4),
    (inside_category_id, 'Inspect walls and ceilings for any cracking.', 'Look on the walls and ceilings for any cracks. Make sure there are none.', 5),
    (inside_category_id, 'Examine tile work and grouting for neatness and cleanliness.', 'Look at any tiles and the lines (grout) between them. Make sure the grout is neat and the tiles are clean.', 6),
    (inside_category_id, 'Inspect window sills, including undersides, for paint finish.', 'Look at every window sill, including the bottom side. Make sure the paint is finished properly.', 7),
    (inside_category_id, 'Check window frames for damage.', 'Look at the window frame. Make sure it has no damage.', 8),
    (inside_category_id, 'Inspect window glass for defects, paint splashes, or cracks.', 'Look at the glass. Make sure it has no scratches, paint splashes, or cracks.', 9),
    (inside_category_id, 'Test window operation and ensure keys are provided for locking windows.', 'Open and close each window. Make sure it moves easily and that you have a key if it locks.', 10),
    (inside_category_id, 'Test door locks and security features.', 'Lock and unlock each door. Make sure the locks and bolts work properly.', 11),
    (inside_category_id, 'Check front door for visibility or viewing apparatus.', 'Check the front door. Make sure you can see outside or there is a peephole.', 12),
    (inside_category_id, 'Test door operation for smooth movement.', 'Open and close every door. Make sure they move easily and don''t stick.', 13),
    (inside_category_id, 'Inspect door frame paint finish on head and jambs.', 'Look at the top and sides of each door frame. Make sure the paint covers all parts neatly.', 14),
    (inside_category_id, 'Check door-to-frame gaps for consistency.', 'Look at the space between each door and its frame. Make sure the gap is even.', 15),
    (inside_category_id, 'Test stair handrails and balustrades for security.', 'Hold the banister and handrail. Make sure they are fixed on tight.', 16),
    (inside_category_id, 'Check stair treads for level installation and stability.', 'Stand on each step. Make sure they are level and not wobbly.', 17),
    (inside_category_id, 'Inspect floor tiles, particularly at transitions and thresholds.', 'Look at any floor tiles, especially near cupboards or doorways. Make sure they are all there and neat.', 18),
    (inside_category_id, 'Check sheet flooring for flat installation without defects.', 'Look at any vinyl or sheet floor. Make sure it lies flat with no curled edges or bubbles.', 19),
    (inside_category_id, 'Inspect all floors for cleanliness and debris.', 'Look at all floors. Make sure they are clean and free of dust or bits of plaster.', 20),
    (inside_category_id, 'Examine skirting boards for damage to timber and paint finish.', 'Look at the skirting boards. Make sure the wood and paint have no scratches or dents.', 21),
    (inside_category_id, 'Check internal pipework for secure fixing.', 'Check all pipes inside. Make sure they are fixed on tight and don''t wobble.', 22),
    (inside_category_id, 'Test radiators for secure fixing and absence of leaks.', 'Gently push each radiator. Make sure it is fixed to the wall and does not leak.', 23),
    (inside_category_id, 'Inspect radiator paint finish for completeness and absence of corrosion.', 'Look at each radiator. Make sure it is painted with no rust or marks.', 24),
    (inside_category_id, 'Check fireplace area for cleanliness and integrity.', 'Look at the fireplace area. Make sure it is clean and not damaged.', 25),
    (inside_category_id, 'Inspect sanitary ware for cleanliness and integrity.', 'Look at sinks, toilets, and baths. Make sure they are clean and not broken.', 26),
    (inside_category_id, 'Check taps and fittings for removal of temporary labels.', 'Look at taps and fittings. Make sure any stickers or labels are removed unless needed.', 27),
    (inside_category_id, 'Inspect bath panel for straight installation.', 'Look at the bath. Make sure the cover panel is fitted on straight.', 28),
    (inside_category_id, 'Test toilet flush mechanism for proper operation.', 'Flush the toilet. Make sure it flushes and refills correctly.', 29),
    (inside_category_id, 'Inspect kitchen units and worktops for damage.', 'Look at kitchen cupboards and worktops. Make sure they have no marks or chips.', 30),
    (inside_category_id, 'Test wall units for secure fixing and absence of paint splashes.', 'Gently pull each wall cupboard. Make sure it is fixed on tight and not splashed with paint.', 31),
    (inside_category_id, 'Check cupboard door alignment.', 'Open and close each cupboard door. Make sure it hangs straight.', 32),
    (inside_category_id, 'Test drawer operation for smooth movement.', 'Open and close each drawer. Make sure it slides easily.', 33),
    (inside_category_id, 'Inspect under-sink area for water tightness.', 'Look under the sink. Make sure there are no leaks or wet patches.', 34),
    (inside_category_id, 'Check built-in appliances for damage.', 'Look at all built-in appliances. Make sure none are broken or scratched.', 35),
    (inside_category_id, 'Verify presence of appliance documentation.', 'Check for manuals and guarantees. Make sure they are there and easy to find.', 36),
    (inside_category_id, 'Test extractor fans for operation and installation quality.', 'Turn on each extractor fan. Make sure it works and is fitted correctly.', 37),
    (inside_category_id, 'Inspect loft for correct insulation.', 'Go up to the loft. Check that it has the right insulation.', 38),
    (inside_category_id, 'Check loft pipework and tanks for insulation.', 'Check pipes and tanks in the loft. Make sure they are wrapped or insulated.', 39),
    (inside_category_id, 'Verify loft has safe access path or boarding.', 'Look in the loft. Make sure there is a safe path or boarding to walk on.', 40);
END $$;
