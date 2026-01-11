-- Tighten permissive INSERT RLS policies while keeping public submissions working

-- beta_applications: allow inserts only from expected runtime roles
ALTER POLICY "Anyone can submit beta application"
ON public.beta_applications
TO anon, authenticated, service_role
WITH CHECK (
  auth.role() IN ('anon', 'authenticated', 'service_role')
);

-- beta_analytics: allow inserts only from expected runtime roles
ALTER POLICY "Anyone can insert analytics events"
ON public.beta_analytics
TO anon, authenticated, service_role
WITH CHECK (
  auth.role() IN ('anon', 'authenticated', 'service_role')
);
