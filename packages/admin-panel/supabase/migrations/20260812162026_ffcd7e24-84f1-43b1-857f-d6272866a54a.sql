CREATE TABLE public.document_citations (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  document_id uuid NOT NULL REFERENCES public.registry_documents(id) ON DELETE CASCADE,
  source_title text NOT NULL,
  page text,
  section text,
  snippet text NOT NULL,
  approved boolean NOT NULL DEFAULT false,
  created_by uuid REFERENCES auth.users(id),
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.document_citations TO authenticated;
GRANT ALL ON public.document_citations TO service_role;

ALTER TABLE public.document_citations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "citations readable by authenticated"
ON public.document_citations FOR SELECT TO authenticated USING (true);

CREATE POLICY "contributors insert citations"
ON public.document_citations FOR INSERT TO authenticated
WITH CHECK (public.can_contribute(auth.uid()) AND created_by = auth.uid());

CREATE POLICY "staff update citations"
ON public.document_citations FOR UPDATE TO authenticated
USING (public.is_staff(auth.uid())) WITH CHECK (public.is_staff(auth.uid()));

CREATE POLICY "staff delete citations"
ON public.document_citations FOR DELETE TO authenticated
USING (public.is_staff(auth.uid()));

CREATE INDEX document_citations_document_id_idx ON public.document_citations(document_id);

CREATE TRIGGER document_citations_set_updated_at
BEFORE UPDATE ON public.document_citations
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();