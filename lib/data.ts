import bundle from "@/data/bundle.json";
import sourceCatalog from "@/data/source-catalog.json";
import reports from "@/data/reports.json";
import type {
  AppDataBundle,
  DebtDataItem,
  MonthlyBrief,
  NewsItem,
  PaperItem,
  PolicyItem,
  SourceCatalogItem,
  UpdateLogItem
} from "@/lib/types";
import { sortByDateDesc } from "@/lib/utils";

const appData = bundle as AppDataBundle;
const sourceRegistry = sourceCatalog as SourceCatalogItem[];
const briefArchive = reports as MonthlyBrief[];

export function getAppData() {
  return appData;
}

export function getPolicies(): PolicyItem[] {
  return sortByDateDesc(appData.policies);
}

export function getDebtData(): DebtDataItem[] {
  return sortByDateDesc(appData.debt);
}

export function getNews(): NewsItem[] {
  return sortByDateDesc(appData.news);
}

export function getPapers(): PaperItem[] {
  return [...appData.papers].sort((a, b) => (b.date ?? `${b.year}-01-01`).localeCompare(a.date ?? `${a.year}-01-01`));
}

export function getRecentUpdates(): UpdateLogItem[] {
  return sortByDateDesc(appData.updates);
}

export function getBriefs(): MonthlyBrief[] {
  return [...briefArchive].sort((a, b) => b.month.localeCompare(a.month));
}

export function getLatestBrief() {
  return getBriefs()[0] ?? null;
}

export function getBriefByMonth(month: string) {
  return getBriefs().find((item) => item.month === month) ?? null;
}

export function getSourceRegistry() {
  return sourceRegistry;
}

export function getSourceRegistryByCategory() {
  return {
    policy: sourceRegistry.filter((item) => item.category === "policy"),
    debt: sourceRegistry.filter((item) => item.category === "debt"),
    news: sourceRegistry.filter((item) => item.category === "news"),
    paper: sourceRegistry.filter((item) => item.category === "paper")
  };
}

export function getDashboardStats() {
  const policies = sortByDateDesc(appData.policies);
  const debt = sortByDateDesc(appData.debt);
  const news = sortByDateDesc(appData.news);
  const papers = getPapers();
  const briefs = getBriefs();

  return {
    lastUpdated: appData.metadata.lastUpdated,
    latestPolicyDate: policies[0]?.date ?? appData.metadata.lastUpdated,
    latestDebtDate: debt[0]?.date ?? appData.metadata.lastUpdated,
    totalPolicies: appData.policies.length,
    totalDebt: appData.debt.length,
    totalNews: appData.news.length,
    totalPapers: appData.papers.length,
    totalBriefs: briefs.length,
    latestBriefMonth: briefs[0]?.month ?? "",
    activeSources: sourceRegistry.length,
    officialSources: sourceRegistry.filter((item) => item.authority === "official").length
  };
}
