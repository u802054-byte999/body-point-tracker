-- Add group field to patients table
ALTER TABLE public.patients 
ADD COLUMN patient_group TEXT DEFAULT '第一組';