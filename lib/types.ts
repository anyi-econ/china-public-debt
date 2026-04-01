export type ContentType = "policy" | "debt" | "news" | "paper";
export type SourceAuthority = "official" | "state-media" | "research" | "open-data" | "commercial";
export type SourceMethod = "html" | "api" | "manual";

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

export interface AnnualMetricPoint {
  year: number;
  value: number;
}

export interface AnnualMetricSeries {
  key: string;
  metricId: string;
  label: string;
  unit: string;
  values: AnnualMetricPoint[];
}

export interface AnnualIssuanceDataset {
  updatedAt: string;
  source: {
    name: string;
    organization: string;
    url: string;
    note: string;
  };
  series: AnnualMetricSeries[];
  links: Array<{
    title: string;
    url: string;
    description: string;
  }>;
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
  date?: string;
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

export interface BriefSection {
  title: string;
  summary: string;
  bullets: string[];
}

export interface MonthlyBrief {
  id: string;
  month: string;
  title: string;
  generatedAt: string;
  mode: "monthly" | "manual" | "weekly";
  sourceCounts: Record<ContentType, number>;
  highlights: string[];
  sections: {
    policy: BriefSection;
    data: BriefSection;
    news: BriefSection;
    papers: BriefSection;
    analysis: BriefSection;
  };
  relatedIds: Record<ContentType, string[]>;
  relatedLinks: Array<{
    title: string;
    url: string;
    source: string;
    category: ContentType;
  }>;
  notes?: string[];
}

export interface CrawlIndexEntry {
  key: string;
  url: string;
  title: string;
  date: string;
  month: string;
  source: string;
  category: ContentType;
  fingerprint?: string;
  lastSeenAt: string;
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

export interface SourceFallbackItem {
  title: string;
  date: string;
  source: string;
  url: string;
  summary?: string;
  tags?: string[];
  category?: string;
  authors?: string[];
  venue?: string;
  level?: "central" | "local";
  bondType?: string;
  metricType?: string;
  value?: number;
  unit?: string;
  notes?: string;
}

export interface SourceCatalogItem {
  key: string;
  name: string;
  category: ContentType;
  authority: SourceAuthority;
  cadence: "weekly" | "monthly" | "manual";
  reliability: "high" | "medium";
  method: SourceMethod;
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
  navigationOnly?: boolean;
  automation?: "auto" | "manual-only" | "disabled";
  notes?: string;
  fallback: SourceFallbackItem[];
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
