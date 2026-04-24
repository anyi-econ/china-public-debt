"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import type { NewsItem } from "@/lib/types";
import { NewsClient } from "@/components/pages/news-client";
import { NewsSiteNav } from "@/components/pages/website-news-nav";
import { SectionCard } from "@/components/ui/section-card";

const subTabs = [
  { key: "news-list", label: "权威解读与发布稿", dot: "#1B4965" },
  { key: "region-news", label: "地区要闻导航", dot: "#8B6914" },
] as const;

type TabKey = (typeof subTabs)[number]["key"];

export function NewsPageClient({ items }: { items: NewsItem[] }) {
  const [activeTab, setActiveTab] = useState<TabKey>("news-list");

  return (
    <>
      <nav className="data-sub-nav">
        <div className="container-page data-sub-nav-inner">
          {subTabs.map((tab) => (
            <button
              key={tab.key}
              type="button"
              className={cn("nav-link", activeTab === tab.key && "active")}
              onClick={() => setActiveTab(tab.key)}
            >
              <span className="nav-dot" style={{ background: tab.dot }} />
              {tab.label}
            </button>
          ))}
        </div>
      </nav>

      <div className="container-page topic-body">
        {activeTab === "news-list" && (
          <SectionCard title="权威解读与发布稿" description="支持按关键词和来源筛选">
            <NewsClient items={items} />
          </SectionCard>
        )}
        {activeTab === "region-news" && <NewsSiteNav />}
      </div>
    </>
  );
}
