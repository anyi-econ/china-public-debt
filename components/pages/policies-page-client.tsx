"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import type { CelmaBondIssuanceItem, CelmaPolicyDynamicItem, GovSearchItem } from "@/lib/types";
import { PoliciesClient } from "@/components/pages/policies-client";
import { GovSearch } from "@/components/pages/gov-search";
import { BondIssuanceClient } from "@/components/pages/bond-issuance-client";
import { LocalPolicyNav } from "@/components/pages/local-policy-nav";
import { ProBusinessPolicyNav } from "@/components/pages/pro-business-policy-nav";

const subTabs = [
  { key: "bond-policy", label: "债券政策动态", dot: "#8B0000" },
  { key: "bond-issuance", label: "债券发行动态", dot: "#1B4965" },
  { key: "gov-search", label: "政府官网信息检索接口", dot: "#2E7D32" },
  { key: "local-policy", label: "地区政策导航", dot: "#8B6914" },
  { key: "pro-business", label: "惠企政策导航", dot: "#4B0082" },
] as const;

type TabKey = (typeof subTabs)[number]["key"];

export function PoliciesPageClient({
  policyItems,
  govSearchItems,
  bondIssuanceItems,
}: {
  policyItems: CelmaPolicyDynamicItem[];
  govSearchItems: GovSearchItem[];
  bondIssuanceItems: CelmaBondIssuanceItem[];
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
          <PoliciesClient items={policyItems} />
        )}
        {activeTab === "bond-issuance" && (
          <BondIssuanceClient items={bondIssuanceItems} />
        )}
        {activeTab === "gov-search" && (
          <GovSearch items={govSearchItems} />
        )}
        {activeTab === "local-policy" && <LocalPolicyNav />}
        {activeTab === "pro-business" && <ProBusinessPolicyNav />}
      </div>
    </>
  );
}
