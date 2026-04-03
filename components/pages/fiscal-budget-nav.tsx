"use client";

import { useState } from "react";
import { FISCAL_REGIONS, type FiscalRegionNode } from "@/data/fiscal-budget-links";

/** 根据导航路径获取当前层级的标题和列表 */
function resolveLevel(path: number[]): {
  label: string;
  items: FiscalRegionNode[];
  parent: FiscalRegionNode | null;
} {
  if (path.length === 0) {
    return { label: "省级地区", items: FISCAL_REGIONS, parent: null };
  }

  let current: FiscalRegionNode[] = FISCAL_REGIONS;
  let node: FiscalRegionNode | null = null;

  for (const idx of path) {
    node = current[idx];
    current = node?.children ?? [];
  }

  if (!node) {
    return { label: "省级地区", items: FISCAL_REGIONS, parent: null };
  }

  const levelName =
    path.length === 1 ? "地级市 / 州" : path.length === 2 ? "区 / 县 / 市" : "下级地区";

  return {
    label: `${node.name} · ${levelName}`,
    items: node.children ?? [],
    parent: node,
  };
}

function RegionItem({
  node,
  index,
  hasChildren,
  onDrill,
}: {
  node: FiscalRegionNode;
  index: number;
  hasChildren: boolean;
  onDrill: (index: number) => void;
}) {
  const hasUrl = node.url.length > 0;

  if (hasChildren) {
    // 可下钻的地区按钮
    return (
      <button
        type="button"
        className={
          "rounded border bg-[var(--color-surface)] px-2 py-3 text-center text-[0.9rem] font-semibold leading-tight transition " +
          (hasUrl
            ? "border-[var(--color-border)] hover:border-[var(--color-link)] hover:text-[var(--color-link)]"
            : "border-dashed border-[var(--color-border)] text-[var(--color-muted)]")
        }
        onClick={() => onDrill(index)}
      >
        {node.name}
      </button>
    );
  }

  if (hasUrl) {
    // 叶子节点有链接
    return (
      <a
        href={node.url}
        target="_blank"
        rel="noreferrer"
        className="block rounded border border-[var(--color-border)] bg-[var(--color-surface)] px-2 py-3 text-center text-[0.9rem] font-semibold leading-tight transition hover:border-[var(--color-link)] hover:text-[var(--color-link)]"
      >
        {node.name}
      </a>
    );
  }

  // 叶子节点无链接，灰色显示
  return (
    <span className="block rounded border border-dashed border-[var(--color-border)] bg-[var(--color-surface)] px-2 py-3 text-center text-[0.9rem] leading-tight text-[var(--color-muted)]">
      {node.name}
    </span>
  );
}

export function FiscalBudgetNav() {
  // 导航路径：空数组 = 省列表，[0] = 第0个省的地市列表，[0, 2] = 第0省第2市的区县列表
  const [path, setPath] = useState<number[]>([]);

  const { label, items, parent } = resolveLevel(path);

  const drillDown = (index: number) => setPath((prev) => [...prev, index]);
  const goBack = () => setPath((prev) => prev.slice(0, -1));

  return (
    <article className="info-card p-4">
      {/* 标题行 */}
      <div className="mb-4 flex items-center justify-between gap-3">
        <h3 className="section-title mb-0 border-b-0 pb-0">
          财政预决算导航
          <span className="section-sub">{label}</span>
        </h3>
        {path.length > 0 && (
          <button
            type="button"
            className="rounded border border-[var(--color-border)] px-3 py-1 text-[0.82rem] text-[var(--color-link)] hover:bg-[var(--color-surface)]"
            onClick={goBack}
          >
            ← 返回上级
          </button>
        )}
      </div>

      {/* 当前层级父节点链接 */}
      {parent && parent.url && (
        <a
          href={parent.url}
          target="_blank"
          rel="noreferrer"
          className="mb-3 block rounded border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2 text-[0.9rem] font-semibold hover:border-[var(--color-link)] hover:text-[var(--color-link)]"
        >
          📄 {parent.name} 预决算公开页
        </a>
      )}

      {/* 地区网格 */}
      {items.length > 0 ? (
        <div className="grid grid-cols-5 gap-2">
          {items.map((node, i) => (
            <RegionItem
              key={node.name}
              node={node}
              index={i}
              hasChildren={(node.children?.length ?? 0) > 0}
              onDrill={drillDown}
            />
          ))}
        </div>
      ) : (
        <div className="rounded border border-dashed border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-6 text-center text-[0.86rem] text-[var(--color-muted)]">
          暂无下级地区数据
        </div>
      )}
    </article>
  );
}
