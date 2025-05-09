-- Create storage bucket for snags if it doesn't exist
INSERT INTO storage.buckets (id, name, public)
VALUES ('snags', 'snags', true)
ON CONFLICT (id) DO UPDATE SET public = true;

-- Set up storage policy to allow authenticated users to upload files
CREATE POLICY "Allow authenticated users to upload files" ON storage.objects
    FOR INSERT TO authenticated
    WITH CHECK (bucket_id = 'snags' AND (storage.foldername(name))[1] = auth.uid()::text);

-- Set up storage policy to allow users to view their own files
CREATE POLICY "Allow users to view their own files" ON storage.objects
    FOR SELECT TO authenticated
    USING (bucket_id = 'snags' AND (storage.foldername(name))[1] = auth.uid()::text);

-- Set up storage policy to allow users to update their own files
CREATE POLICY "Allow users to update their own files" ON storage.objects
    FOR UPDATE TO authenticated
    USING (bucket_id = 'snags' AND (storage.foldername(name))[1] = auth.uid()::text);

-- Set up storage policy to allow users to delete their own files
CREATE POLICY "Allow users to delete their own files" ON storage.objects
    FOR DELETE TO authenticated
    USING (bucket_id = 'snags' AND (storage.foldername(name))[1] = auth.uid()::text);

-- Allow public access to files in the snags bucket
CREATE POLICY "Allow public access to snag files" ON storage.objects
    FOR SELECT
    USING (bucket_id = 'snags');
