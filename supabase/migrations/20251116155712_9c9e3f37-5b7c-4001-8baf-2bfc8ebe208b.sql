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

CREATE POLICY "Only admin can delete kandidat photos"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'kandidat-foto' 
  AND auth.jwt() ->> 'role' = 'admin'
);

-- Create storage policies for kandidat-sertifikat bucket
CREATE POLICY "Anyone can upload kandidat certificates"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'kandidat-sertifikat');

CREATE POLICY "Anyone can view kandidat certificates"
ON storage.objects FOR SELECT
USING (bucket_id = 'kandidat-sertifikat');

CREATE POLICY "Only admin can delete kandidat certificates"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'kandidat-sertifikat' 
  AND auth.jwt() ->> 'role' = 'admin'
);

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

CREATE POLICY "Only admin can delete kandidat"
ON public.kandidat_senma FOR DELETE
USING (auth.jwt() ->> 'role' = 'admin');

-- Enable realtime for kandidat_senma table
ALTER PUBLICATION supabase_realtime ADD TABLE public.kandidat_senma;

-- Add status column to kandidat_senma table
ALTER TABLE public.kandidat_senma 
ADD COLUMN status text NOT NULL DEFAULT 'terkirim',
ADD COLUMN catatan_admin text;

-- Add check constraint for status values
ALTER TABLE public.kandidat_senma 
ADD CONSTRAINT status_check 
CHECK (status IN ('terkirim', 'diterima', 'disetujui', 'ditolak'));

-- Create index for faster status queries
CREATE INDEX idx_kandidat_status ON public.kandidat_senma(status);

-- Add RLS policy for updating status (anyone can update for now, you can restrict later)
CREATE POLICY "Anyone can update kandidat status" 
ON public.kandidat_senma 
FOR UPDATE 
USING (true);

-- Profil
CREATE TABLE profiles (
  id UUID REFERENCES auth.users PRIMARY KEY,
  role TEXT NOT NULL DEFAULT 'user',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Policy untuk admin bisa melihat semua profiles
CREATE POLICY "Admins can view all profiles" ON profiles
  FOR SELECT USING (
    role = 'admin'
  );

-- Policy untuk user bisa melihat profile sendiri
CREATE POLICY "Users can view own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);

  CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, role)
  VALUES (NEW.id, 'user');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();