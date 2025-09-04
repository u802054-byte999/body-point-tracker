-- Add acupoints column to acupuncture_sessions table
ALTER TABLE public.acupuncture_sessions 
ADD COLUMN acupoints text;