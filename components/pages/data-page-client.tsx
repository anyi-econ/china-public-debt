"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import type { DebtDataItem, AnnualIssuanceDataset, AnnualBalanceDataset } from "@/lib/types";
import { DebtOverview } from "@/components/pages/debt-overview";
import { FiscalBudgetNav } from "@/components/pages/fiscal-budget-nav";
import { GovWebsiteNav } from "@/components/pages/gov-website-nav";

const subTabs = [
  { key: "debt", label: "债务数据可视化", dot: "#1B4965" },
  { key: "fiscal", label: "财政数据导航", dot: "#8B6914" },
  { key: "gov", label: "政府官网导航", dot: "#2E7D32" },
] as const;

type TabKey = (typeof subTabs)[number]["key"];

export function DataPageClient({
  items,
  annualIssuance,
  annualBalance,
}: {
  items: DebtDataItem[];
  annualIssuance: AnnualIssuanceDataset;
  annualBalance: AnnualBalanceDataset;
}) {
  const [activeTab, setActiveTab] = useState<TabKey>("debt");

  return (
    <>
      {/* 子菜单栏 */}
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
        {activeTab === "debt" && <DebtOverview items={items} annualIssuance={annualIssuance} annualBalance={annualBalance} />}
        {activeTab === "fiscal" && <FiscalBudgetNav />}
        {activeTab === "gov" && <GovWebsiteNav />}
      </div>
    </>
  );
}
