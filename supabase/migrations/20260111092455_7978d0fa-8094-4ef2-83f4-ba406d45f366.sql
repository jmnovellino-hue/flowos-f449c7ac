-- Make audio-files bucket private
UPDATE storage.buckets SET public = false WHERE id = 'audio-files';

-- Drop the overly permissive public policy (keep the owner-only policy)
DROP POLICY IF EXISTS "Public can view audio files" ON storage.objects;