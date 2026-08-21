export type Citation = {
  source_id: string;
  title: string;
  page?: number | null;
  section?: string | null;
  url?: string | null;
  score?: number;
};

export type RagResult = {
  answer: string;
  citations: Citation[];
  model?: string;
};
