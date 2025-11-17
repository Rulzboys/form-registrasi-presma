-- ===============================================
-- STORAGE BUCKETS
-- ===============================================
INSERT INTO storage.buckets (id, name, public)
VALUES 
  ('kandidat-foto', 'kandidat-foto', true),
  ('kandidat-sertifikat', 'kandidat-sertifikat', true)
ON CONFLICT (id) DO NOTHING;

-- ===============================================
-- STORAGE POLICIES FIXED
-- ===============================================

-- Hapus policy lama yang berbahaya
DROP POLICY IF EXISTS "Anyone can delete kandidat photos" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can delete kandidat certificates" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can upload kandidat photos" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can upload kandidat certificates" ON storage.objects;

-- Izinkan VIEW publik
CREATE POLICY "Public read foto"
ON storage.objects FOR SELECT
USING (bucket_id = 'kandidat-foto');

CREATE POLICY "Public read sertifikat"
ON storage.objects FOR SELECT
USING (bucket_id = 'kandidat-sertifikat');

-- Izinkan upload hanya authenticated
CREATE POLICY "Auth upload foto"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'kandidat-foto' AND auth.role() = 'authenticated');

CREATE POLICY "Auth upload sertifikat"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'kandidat-sertifikat' AND auth.role() = 'authenticated');

-- Blokir delete semuanya
CREATE POLICY "Deny delete foto"
ON storage.objects FOR DELETE
USING (false);

CREATE POLICY "Deny delete sertifikat"
ON storage.objects FOR DELETE
USING (false);

-- ===============================================
-- TABLE kandidat_senma
-- ===============================================
DROP TABLE IF EXISTS public.kandidat_senma CASCADE;

CREATE TABLE public.kandidat_senma (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nama text NOT NULL,
  nim text NOT NULL,
  semester integer NOT NULL,
  ipk numeric(3,2) NOT NULL,
  pengalaman text NOT NULL,
  visi_misi text NOT NULL,
  foto_url text NOT NULL,
  sertifikat_urls text[] NOT NULL DEFAULT '{}',
  nomor_wa text NOT NULL,
  email text NOT NULL,
  jenis_kelamin text NOT NULL CHECK (jenis_kelamin IN ('Laki-laki', 'Perempuan')),
  created_at timestamp with time zone DEFAULT now()
);

ALTER TABLE public.kandidat_senma ENABLE ROW LEVEL SECURITY;

-- Izinkan semua orang INSERT
CREATE POLICY "Public insert kandidat"
ON public.kandidat_senma FOR INSERT
WITH CHECK (true);

-- Izinkan semua orang VIEW
CREATE POLICY "Public view kandidat"
ON public.kandidat_senma FOR SELECT
USING (true);

-- Admin-only delete (opsional)
CREATE POLICY "Admin delete kandidat"
ON public.kandidat_senma FOR DELETE
USING (auth.role() = 'authenticated');

ALTER PUBLICATION supabase_realtime ADD TABLE public.kandidat_senma;
