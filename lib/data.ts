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
import { isSameMonth, sortByDateDesc } from "@/lib/utils";

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
  const currentMonthBase = new Date(appData.metadata.lastUpdated);
  return {
    lastUpdated: appData.metadata.lastUpdated,
    newPolicies: appData.policies.filter((item) => isSameMonth(item.date, currentMonthBase)).length,
    newDebt: appData.debt.filter((item) => isSameMonth(item.date, currentMonthBase)).length,
    newNews: appData.news.filter((item) => isSameMonth(item.date, currentMonthBase)).length,
    newPapers: appData.papers.filter((item) => item.year === currentMonthBase.getFullYear()).length,
    activeSources: sourceRegistry.length,
    officialSources: sourceRegistry.filter((item) => item.authority === "official").length
  };
}

export function getSourceRegistry() {
  return sourceRegistry;
}
