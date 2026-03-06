
-- Add user_id to jobs so companies can own their jobs
ALTER TABLE public.jobs ADD COLUMN user_id uuid;

-- Allow company users to insert their own jobs
CREATE POLICY "Companies can insert own jobs" ON public.jobs FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

-- Allow company users to update their own jobs
CREATE POLICY "Companies can update own jobs" ON public.jobs FOR UPDATE TO authenticated USING (auth.uid() = user_id);

-- Allow company users to delete their own jobs
CREATE POLICY "Companies can delete own jobs" ON public.jobs FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- Also allow companies to manage their own shop items
ALTER TABLE public.shop_items ADD COLUMN user_id uuid;

CREATE POLICY "Companies can insert own shop items" ON public.shop_items FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Companies can update own shop items" ON public.shop_items FOR UPDATE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Companies can delete own shop items" ON public.shop_items FOR DELETE TO authenticated USING (auth.uid() = user_id);
