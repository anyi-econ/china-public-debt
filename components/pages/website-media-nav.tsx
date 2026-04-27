"use client";

import { MEDIA_SITE_REGIONS } from "@/data/website-media";
import { RegionLinkNav } from "./website-region-nav";

export function MediaSiteNav() {
  return (
    <RegionLinkNav
      regions={MEDIA_SITE_REGIONS}
      title="地区官媒导航"
      parentLinkLabel={(name) => `🗞️ ${name} 党报数字版/官媒入口`}
      coverageNote="当前优先收录省级党报数字版，市县级官媒入口后续补充。"
    />
  );
}