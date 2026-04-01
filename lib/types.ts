export type ContentType = "policy" | "debt" | "news" | "paper";

export interface PolicyItem {
  id: string;
  title: string;
  date: string;
  source: string;
  category: string;
  tags: string[];
  summary: string;
  url: string;
  fullText?: string;
}

export interface DebtDataItem {
  id: string;
  date: string;
  level: "central" | "local";
  bondType: string;
  metricType: string;
  value: number;
  unit: string;
  source: string;
  notes?: string;
  url?: string;
}

export interface NewsItem {
  id: string;
  title: string;
  date: string;
  source: string;
  tags: string[];
  summary: string;
  url: string;
}

export interface PaperItem {
  id: string;
  title: string;
  authors: string[];
  year: number;
  venue: string;
  abstract: string;
  keywords: string[];
  url: string;
  source: string;
}

export interface UpdateLogItem {
  id: string;
  date: string;
  type: ContentType;
  title: string;
  source: string;
  status: "新增" | "更新" | "导入";
  note: string;
}

export interface HighlightItem {
  id: string;
  title: string;
  date: string;
  category: string;
  summary: string;
  url?: string;
}

export interface MonthlyObservation {
  month: string;
  title: string;
  summary: string;
  bullets: string[];
}

export interface Metadata {
  lastUpdated: string;
  updateMode: "weekly" | "monthly" | "manual";
  sourceStatus: Array<{
    name: string;
    category: ContentType | "mixed";
    status: "success" | "fallback" | "error";
    message: string;
    updatedAt: string;
  }>;
}

export interface SourceCatalogItem {
  key: string;
  name: string;
  category: "policy" | "debt" | "news" | "paper";
  authority: "official" | "state-media" | "research" | "open-data";
  cadence: "weekly" | "monthly" | "manual";
  reliability: "high" | "medium";
  method: "html" | "api" | "manual";
  url: string;
  description: string;
  selectors?: {
    list: string;
    title: string;
    link?: string;
    date?: string;
  };
  tags?: string[];
  categoryName?: string;
  fallback: Array<{
    title: string;
    date: string;
    source: string;
    url: string;
    summary?: string;
    tags?: string[];
    category?: string;
  }>;
}

export interface AppDataBundle {
  policies: PolicyItem[];
  debt: DebtDataItem[];
  news: NewsItem[];
  papers: PaperItem[];
  updates: UpdateLogItem[];
  highlights: HighlightItem[];
  observation: MonthlyObservation;
  metadata: Metadata;
}
