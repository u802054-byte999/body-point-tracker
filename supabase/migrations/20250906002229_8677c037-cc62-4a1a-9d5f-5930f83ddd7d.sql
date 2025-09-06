-- Create acupoint_settings table for storing acupoint configuration
CREATE TABLE public.acupoint_settings (
  id INTEGER PRIMARY KEY DEFAULT 1,
  count INTEGER NOT NULL DEFAULT 40,
  names TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.acupoint_settings ENABLE ROW LEVEL SECURITY;

-- Create policy to allow all operations (since this is configuration data)
CREATE POLICY "Allow all operations on acupoint_settings" 
ON public.acupoint_settings 
FOR ALL 
USING (true) 
WITH CHECK (true);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_acupoint_settings_updated_at
BEFORE UPDATE ON public.acupoint_settings
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Insert default settings
INSERT INTO public.acupoint_settings (id, count, names) 
VALUES (1, 40, ARRAY(SELECT (i)::TEXT FROM generate_series(1, 40) AS i));

-- Create function to initialize acupoint settings if not exists
CREATE OR REPLACE FUNCTION public.ensure_acupoint_settings()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO public.acupoint_settings (id, count, names)
  VALUES (1, 40, ARRAY(SELECT (i)::TEXT FROM generate_series(1, 40) AS i))
  ON CONFLICT (id) DO NOTHING;
END;
$$;