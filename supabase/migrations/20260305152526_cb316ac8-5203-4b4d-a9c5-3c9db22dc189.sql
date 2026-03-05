
CREATE TABLE public.jobs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  department_id uuid NOT NULL REFERENCES public.departments(id) ON DELETE CASCADE,
  company_name text NOT NULL,
  description text,
  contact_info text,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.jobs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Jobs viewable by all authenticated" ON public.jobs FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admins can manage jobs" ON public.jobs FOR ALL TO authenticated USING (has_role(auth.uid(), 'admin'::app_role));
