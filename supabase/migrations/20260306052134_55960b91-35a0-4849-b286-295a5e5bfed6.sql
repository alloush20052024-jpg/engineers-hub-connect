
-- Consultant applications table for verification
CREATE TABLE public.consultant_applications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL UNIQUE,
  union_id_url text,
  unified_card_url text,
  residence_card_url text,
  face_photo_url text,
  phone text NOT NULL,
  email text NOT NULL,
  status text NOT NULL DEFAULT 'pending',
  admin_notes text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.consultant_applications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can insert own application" ON public.consultant_applications FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can view own application" ON public.consultant_applications FOR SELECT TO authenticated USING (auth.uid() = user_id OR has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Admins can manage applications" ON public.consultant_applications FOR ALL TO authenticated USING (has_role(auth.uid(), 'admin'::app_role));

-- Company profiles table
CREATE TABLE public.company_profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL UNIQUE,
  company_name text NOT NULL,
  description text,
  logo_url text,
  contact_info text,
  status text NOT NULL DEFAULT 'active',
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.company_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can insert own company" ON public.company_profiles FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own company" ON public.company_profiles FOR UPDATE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Company profiles viewable by all authenticated" ON public.company_profiles FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admins can manage companies" ON public.company_profiles FOR ALL TO authenticated USING (has_role(auth.uid(), 'admin'::app_role));
