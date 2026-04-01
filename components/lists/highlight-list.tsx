import { ArrowUpRight } from "lucide-react";
import { HighlightItem } from "@/lib/types";
import { formatDate } from "@/lib/utils";
import { Tag } from "@/components/ui/tag";

export function HighlightList({ items }: { items: HighlightItem[] }) {
  return (
    <div className="grid gap-8 lg:grid-cols-2">
      {items.map((item, index) => (
        <article key={item.id} className="list-row grid gap-5 py-6 first:pt-0 lg:grid-cols-[64px_minmax(0,1fr)]">
          <div className="display-serif text-3xl leading-none text-[var(--accent)]">0{index + 1}</div>
          <div>
            <div className="mb-3 flex flex-wrap gap-2">
              <Tag tone="accent">{item.category}</Tag>
              <Tag tone="muted">{formatDate(item.date)}</Tag>
            </div>
            <h3 className="display-serif max-w-2xl text-2xl font-semibold leading-9 tracking-[-0.03em] text-[var(--ink)]">
              {item.title}
            </h3>
            <p className="mt-4 max-w-2xl text-sm leading-7 text-[var(--ink-soft)]">{item.summary}</p>
            {item.url ? (
              <a href={item.url} className="mt-4 inline-flex items-center gap-2 text-sm font-medium text-[var(--accent)]" target="_blank" rel="noreferrer">
                查看来源
                <ArrowUpRight className="h-4 w-4" />
              </a>
            ) : null}
          </div>
        </article>
      ))}
    </div>
  );
}
