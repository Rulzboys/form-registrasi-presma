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