import bundle from "@/data/bundle.json";
import sourceCatalog from "@/data/source-catalog.json";
import type {
  AppDataBundle,
  DebtDataItem,
  NewsItem,
  PaperItem,
  PolicyItem,
  SourceCatalogItem,
  UpdateLogItem
} from "@/lib/types";
import { sortByDateDesc } from "@/lib/utils";

const appData = bundle as AppDataBundle;
const sourceRegistry = sourceCatalog as SourceCatalogItem[];

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
  return [...appData.papers].sort((a, b) => b.year - a.year);
}

export function getRecentUpdates(): UpdateLogItem[] {
  return sortByDateDesc(appData.updates);
}

export function getDashboardStats() {
  const policies = sortByDateDesc(appData.policies);
  const debt = sortByDateDesc(appData.debt);
  const news = sortByDateDesc(appData.news);
  const papers = [...appData.papers].sort((a, b) => b.year - a.year);

  return {
    lastUpdated: appData.metadata.lastUpdated,
    latestPolicyDate: policies[0]?.date ?? appData.metadata.lastUpdated,
    latestDebtDate: debt[0]?.date ?? appData.metadata.lastUpdated,
    totalPolicies: appData.policies.length,
    totalDebt: appData.debt.length,
    totalNews: appData.news.length,
    totalPapers: appData.papers.length,
    activeSources: sourceRegistry.length,
    officialSources: sourceRegistry.filter((item) => item.authority === "official").length
  };
}

export function getSourceRegistry() {
  return sourceRegistry;
}
