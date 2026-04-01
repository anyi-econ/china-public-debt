import { clsx } from "clsx";

export function cn(...inputs: Array<string | false | null | undefined>) {
  return clsx(inputs);
}

export function formatDate(input: string) {
  const date = new Date(input);
  if (Number.isNaN(date.getTime())) {
    return input;
  }
  return new Intl.DateTimeFormat("zh-CN", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit"
  }).format(date);
}

export function sortByDateDesc<T extends { date: string }>(items: T[]) {
  return [...items].sort((a, b) => +new Date(b.date) - +new Date(a.date));
}

export function uniqueValues(items: string[]) {
  return Array.from(new Set(items)).sort((a, b) => a.localeCompare(b, "zh-CN"));
}

export function normalizeText(text: string) {
  return text.replace(/\s+/g, " ").trim();
}

export function slugify(input: string) {
  return input
    .toLowerCase()
    .replace(/[^a-z0-9\u4e00-\u9fa5]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function isSameMonth(dateString: string, base: Date) {
  const date = new Date(dateString);
  return date.getFullYear() === base.getFullYear() && date.getMonth() === base.getMonth();
}
