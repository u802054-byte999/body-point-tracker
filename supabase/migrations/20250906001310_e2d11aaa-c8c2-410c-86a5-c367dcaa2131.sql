-- Add bed_number column to patients table
ALTER TABLE public.patients 
ADD COLUMN bed_number text;