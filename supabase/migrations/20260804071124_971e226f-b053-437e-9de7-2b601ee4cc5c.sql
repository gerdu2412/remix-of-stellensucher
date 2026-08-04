ALTER TABLE public.master_cvs
  ADD COLUMN IF NOT EXISTS file_path text,
  ADD COLUMN IF NOT EXISTS file_type text,
  ADD COLUMN IF NOT EXISTS file_size integer;

CREATE POLICY "Users can read own cv files" ON storage.objects FOR SELECT TO authenticated
  USING (bucket_id = 'cv-uploads' AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "Users can upload own cv files" ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'cv-uploads' AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "Users can update own cv files" ON storage.objects FOR UPDATE TO authenticated
  USING (bucket_id = 'cv-uploads' AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "Users can delete own cv files" ON storage.objects FOR DELETE TO authenticated
  USING (bucket_id = 'cv-uploads' AND auth.uid()::text = (storage.foldername(name))[1]);