-- ROLES
CREATE TYPE public.app_role AS ENUM ('owner','manager','expert','viewer');

CREATE TABLE public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name text,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "profiles readable by authenticated" ON public.profiles FOR SELECT TO authenticated USING (true);
CREATE POLICY "own profile update" ON public.profiles FOR UPDATE TO authenticated USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

CREATE TABLE public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.app_role NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);
GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role);
$$;

CREATE OR REPLACE FUNCTION public.is_staff(_user_id uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role IN ('owner','manager'));
$$;

CREATE OR REPLACE FUNCTION public.can_contribute(_user_id uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role IN ('owner','manager','expert'));
$$;

CREATE POLICY "roles readable by authenticated" ON public.user_roles FOR SELECT TO authenticated USING (true);
CREATE POLICY "owner manages roles" ON public.user_roles FOR ALL TO authenticated
  USING (public.has_role(auth.uid(),'owner')) WITH CHECK (public.has_role(auth.uid(),'owner'));

-- signup trigger: profile + first user becomes owner, others viewer
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE user_count int;
BEGIN
  INSERT INTO public.profiles (id, display_name)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'display_name', NEW.raw_user_meta_data->>'full_name', split_part(NEW.email,'@',1)))
  ON CONFLICT (id) DO NOTHING;

  SELECT count(*) INTO user_count FROM public.user_roles;
  IF user_count = 0 THEN
    INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'owner') ON CONFLICT DO NOTHING;
  ELSE
    INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'viewer') ON CONFLICT DO NOTHING;
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS trigger LANGUAGE plpgsql SET search_path = public AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END; $$;

-- REGISTRY
CREATE TYPE public.doc_type AS ENUM ('قانون','بخشنامه','دستورالعمل','آیین‌نامه','رأی دیوان','ابلاغیه','سایر');
CREATE TYPE public.index_status AS ENUM ('شناسایی‌شده','دریافت‌شده','در حال ایندکس','ایندکس‌شده','رد‌شده');

CREATE TABLE public.registry_documents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  doc_code text NOT NULL UNIQUE,
  doc_type public.doc_type NOT NULL DEFAULT 'بخشنامه',
  doc_number text,
  doc_date text,
  title text NOT NULL,
  source_url text,
  drive_path text,
  law_category text,
  index_status public.index_status NOT NULL DEFAULT 'شناسایی‌شده',
  notes text,
  body_text text,
  created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.registry_documents TO authenticated;
GRANT ALL ON public.registry_documents TO service_role;
ALTER TABLE public.registry_documents ENABLE ROW LEVEL SECURITY;
CREATE POLICY "registry readable by authenticated" ON public.registry_documents FOR SELECT TO authenticated USING (true);
CREATE POLICY "contributors insert registry" ON public.registry_documents FOR INSERT TO authenticated
  WITH CHECK (public.can_contribute(auth.uid()) AND created_by = auth.uid());
CREATE POLICY "staff update registry" ON public.registry_documents FOR UPDATE TO authenticated
  USING (public.is_staff(auth.uid())) WITH CHECK (public.is_staff(auth.uid()));
CREATE POLICY "staff delete registry" ON public.registry_documents FOR DELETE TO authenticated
  USING (public.is_staff(auth.uid()));

CREATE TRIGGER registry_updated_at BEFORE UPDATE ON public.registry_documents
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE INDEX registry_title_idx ON public.registry_documents USING gin (to_tsvector('simple', coalesce(title,'') || ' ' || coalesce(notes,'') || ' ' || coalesce(body_text,'')));

-- QUERIES LOG
CREATE TABLE public.rag_queries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  question text NOT NULL,
  answer text,
  citations jsonb NOT NULL DEFAULT '[]'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT ON public.rag_queries TO authenticated;
GRANT ALL ON public.rag_queries TO service_role;
ALTER TABLE public.rag_queries ENABLE ROW LEVEL SECURITY;
CREATE POLICY "queries readable by authenticated" ON public.rag_queries FOR SELECT TO authenticated USING (true);
CREATE POLICY "own query insert" ON public.rag_queries FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);