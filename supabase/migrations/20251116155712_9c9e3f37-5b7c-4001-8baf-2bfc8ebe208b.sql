-- Create storage buckets for kandidat photos and certificates
INSERT INTO storage.buckets (id, name, public)
VALUES 
  ('kandidat-foto', 'kandidat-foto', true),
  ('kandidat-sertifikat', 'kandidat-sertifikat', true);

-- Create storage policies for kandidat-foto bucket
CREATE POLICY "Anyone can upload kandidat photos"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'kandidat-foto');

CREATE POLICY "Anyone can view kandidat photos"
ON storage.objects FOR SELECT
USING (bucket_id = 'kandidat-foto');

CREATE POLICY "Anyone can delete kandidat photos"
ON storage.objects FOR DELETE
USING (bucket_id = 'kandidat-foto');

-- Create storage policies for kandidat-sertifikat bucket
CREATE POLICY "Anyone can upload kandidat certificates"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'kandidat-sertifikat');

CREATE POLICY "Anyone can view kandidat certificates"
ON storage.objects FOR SELECT
USING (bucket_id = 'kandidat-sertifikat');

CREATE POLICY "Anyone can delete kandidat certificates"
ON storage.objects FOR DELETE
USING (bucket_id = 'kandidat-sertifikat');

-- Create kandidat_senma table
CREATE TABLE public.kandidat_senma (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
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
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.kandidat_senma ENABLE ROW LEVEL SECURITY;

-- Create policies for public access (no auth required)
CREATE POLICY "Anyone can view kandidat"
ON public.kandidat_senma FOR SELECT
USING (true);

CREATE POLICY "Anyone can insert kandidat"
ON public.kandidat_senma FOR INSERT
WITH CHECK (true);

CREATE POLICY "Anyone can delete kandidat"
ON public.kandidat_senma FOR DELETE
USING (true);

-- Enable realtime for kandidat_senma table
ALTER PUBLICATION supabase_realtime ADD TABLE public.kandidat_senma;