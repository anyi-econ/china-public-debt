"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import type { PolicyItem, GovSearchItem } from "@/lib/types";
import { PoliciesClient } from "@/components/pages/policies-client";
import { GovSearch } from "@/components/pages/gov-search";
import { SectionCard } from "@/components/ui/section-card";

const subTabs = [
  { key: "bond-policy", label: "债券政策动态", dot: "#8B0000" },
  { key: "gov-search", label: "政府官网信息检索接口", dot: "#2E7D32" },
] as const;

type TabKey = (typeof subTabs)[number]["key"];

export function PoliciesPageClient({
  policyItems,
  govSearchItems,
}: {
  policyItems: PolicyItem[];
  govSearchItems: GovSearchItem[];
}) {
  const [activeTab, setActiveTab] = useState<TabKey>("bond-policy");

  return (
    <>
      {/* 子菜单栏 — 复用 data-sub-nav 样式 */}
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

      {/* 内容区域 */}
      <div className="container-page topic-body">
        {activeTab === "bond-policy" && (
          <SectionCard title="政策样本库" description="按关键词和分类检索">
            <PoliciesClient items={policyItems} />
          </SectionCard>
        )}
        {activeTab === "gov-search" && (
          <GovSearch items={govSearchItems} />
        )}
      </div>
    </>
  );
}
