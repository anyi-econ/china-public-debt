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

export interface AnnualMetricRegion {
  adCode: string;
  name: string;
  series: AnnualMetricSeries[];
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
  regions?: AnnualMetricRegion[];
  links: Array<{
    title: string;
    url: string;
    description: string;
  }>;
}

export type CelmaPolicyCategoryLevel1 = "债券市场动态" | "政策法规" | "政策解读";
export type CelmaPolicyCategoryLevel2 = "重大事项" | "预决算公开";

export type CelmaMajorEventTopic = "资金用途调整" | "跟踪评级" | "发行与披露" | "项目变更" | "偿还与置换" | "其他";

export interface CelmaPolicyAttachment {
  url: string;
  display_name: string;
  local_file_name: string | null;
  local_file_path: string | null;
  download_status: "success" | "failed";
  error: string | null;
}

export interface CelmaPolicyDynamicItem {
  id: string;
  title: string;
  url: string;
  date: string | null;
  source: string;
  category_level1: CelmaPolicyCategoryLevel1;
  category_level2: CelmaPolicyCategoryLevel2 | null;
  region: string | null;
  region_normalized: string | null;
  topic: CelmaMajorEventTopic | null;
  attachments: CelmaPolicyAttachment[];
  attachment_count: number;
  local_attachment_folder: string | null;
  summary?: string | null;
  snippet?: string | null;
}

export interface CelmaPolicyDynamicsDataset {
  updatedAt: string;
  source: {
    name: string;
    organization: string;
    url: string;
    note: string;
  };
  coverage: Array<{
    category_level1: CelmaPolicyCategoryLevel1;
    category_level2: CelmaPolicyCategoryLevel2 | null;
    path: string;
    totalPages: number;
    totalItems: number;
  }>;
  items: CelmaPolicyDynamicItem[];
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

/* ── 政府官网信息检索数据结构 ── */
export type ContentScope = "本地" | "上级" | "外地" | "全国";
export type GovDocType = "领导活动" | "政策文件" | "社会新闻" | "其他";
export type LeaderRole = "书记" | "市长" | "其他领导" | "无";
export type PolicySubType = "产业政策" | "财政金融" | "营商环境" | "数字经济" | "其他";

export interface GovSearchItem {
  id: string;
  title: string;
  /** 政府门户首页 URL */
  url: string;
  /** 具体信息页面 URL（文章/政策/公告等） */
  articleUrl: string;
  /** 发布网站名称 */
  siteName: string;
  /** 发布网站所属地区 */
  siteRegion: string;
  /** 内容所属地区 */
  contentRegion: string;
  /** 内容范围：本地 / 上级 / 外地 / 全国 */
  contentScope: ContentScope;
  /** 一级类型标签 */
  docType: GovDocType;
  /** 二级类型 —— 仅在 docType 为 "政策文件" 时有意义 */
  policySubType?: PolicySubType;
  /** 领导身份 —— 仅在 docType 为 "领导活动" 时有意义 */
  leaderRole: LeaderRole;
  /** 主题标签（多个） */
  topics: string[];
  /** 发布时间 YYYY-MM-DD */
  publishedAt: string;
  /** 摘要 */
  summary: string;
  /** 行政层级 province / city / county */
  adminLevel: "province" | "city" | "county";
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
