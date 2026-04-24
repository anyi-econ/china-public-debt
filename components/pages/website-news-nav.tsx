"use client";

import { NEWS_SITE_REGIONS } from "@/data/website-news";
import { RegionLinkNav } from "./website-region-nav";

export function NewsSiteNav() {
  return (
    <RegionLinkNav
      regions={NEWS_SITE_REGIONS}
      title="地区要闻导航"
      parentLinkLabel={(name) => `📰 ${name} 本地要闻栏目`}
    />
  );
}
