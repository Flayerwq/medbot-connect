
-- Add auth fields to doctors table
ALTER TABLE public.doctors ADD COLUMN IF NOT EXISTS user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE;
ALTER TABLE public.doctors ADD COLUMN IF NOT EXISTS experience text NOT NULL DEFAULT '';
ALTER TABLE public.doctors ADD COLUMN IF NOT EXISTS email text;

-- Allow doctors to insert their own record (signup)
CREATE POLICY "Doctors can insert own record" ON public.doctors FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

-- Allow doctors to update their own record
CREATE POLICY "Doctors can update own record" ON public.doctors FOR UPDATE TO authenticated USING (auth.uid() = user_id);

-- Allow doctors to view their own record (already have select for all authenticated, but this is fine)

-- Allow doctors to update appointments assigned to them
CREATE POLICY "Doctors can update assigned appointments" ON public.appointments FOR UPDATE TO authenticated USING (doctor_id IN (SELECT id FROM public.doctors WHERE user_id = auth.uid()));

-- Allow doctors to view appointments assigned to them
CREATE POLICY "Doctors can view assigned appointments" ON public.appointments FOR SELECT TO authenticated USING (doctor_id IN (SELECT id FROM public.doctors WHERE user_id = auth.uid()));
