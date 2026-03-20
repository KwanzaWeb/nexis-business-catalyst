
-- Fix overly permissive policies on analyses table
DROP POLICY IF EXISTS "Anyone can insert analyses" ON public.analyses;
DROP POLICY IF EXISTS "Anyone can view analyses" ON public.analyses;

-- Since we now have consultas with proper auth, drop the old analyses table
DROP TABLE IF EXISTS public.analyses;
