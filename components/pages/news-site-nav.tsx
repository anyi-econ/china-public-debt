"use client";

import { NEWS_SITE_REGIONS } from "@/data/news-site-links";
import { RegionLinkNav } from "./region-link-nav";

export function NewsSiteNav() {
  return (
    <RegionLinkNav
      regions={NEWS_SITE_REGIONS}
      title="地区要闻导航"
      parentLinkLabel={(name) => `📰 ${name} 本地要闻栏目`}
    />
  );
}
