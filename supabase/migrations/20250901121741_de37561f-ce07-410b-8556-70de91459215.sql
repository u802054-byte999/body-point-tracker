-- Add needle removal tracking to acupuncture_sessions table
ALTER TABLE public.acupuncture_sessions 
ADD COLUMN needle_removal_time TIMESTAMP WITH TIME ZONE NULL;