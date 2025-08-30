-- Create patients table
CREATE TABLE public.patients (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  medical_record_number TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  gender TEXT NOT NULL CHECK (gender IN ('男', '女')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create acupuncture sessions table
CREATE TABLE public.acupuncture_sessions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  patient_id UUID NOT NULL REFERENCES public.patients(id) ON DELETE CASCADE,
  head_count INTEGER NOT NULL DEFAULT 0,
  trunk_count INTEGER NOT NULL DEFAULT 0,
  left_arm_count INTEGER NOT NULL DEFAULT 0,
  right_arm_count INTEGER NOT NULL DEFAULT 0,
  left_leg_count INTEGER NOT NULL DEFAULT 0,
  right_leg_count INTEGER NOT NULL DEFAULT 0,
  total_needles INTEGER NOT NULL DEFAULT 0,
  session_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  notes TEXT
);

-- Enable Row Level Security
ALTER TABLE public.patients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.acupuncture_sessions ENABLE ROW LEVEL SECURITY;

-- Create policies for public access (since this is a medical app that might not need user auth initially)
CREATE POLICY "Allow all operations on patients" 
ON public.patients 
FOR ALL 
USING (true) 
WITH CHECK (true);

CREATE POLICY "Allow all operations on acupuncture_sessions" 
ON public.acupuncture_sessions 
FOR ALL 
USING (true) 
WITH CHECK (true);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_patients_updated_at
  BEFORE UPDATE ON public.patients
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Create index for better performance
CREATE INDEX idx_patients_medical_record_number ON public.patients(medical_record_number);
CREATE INDEX idx_acupuncture_sessions_patient_id ON public.acupuncture_sessions(patient_id);
CREATE INDEX idx_acupuncture_sessions_date ON public.acupuncture_sessions(session_date);