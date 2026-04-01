import { HighlightItem } from "@/lib/types";
import { formatDate } from "@/lib/utils";
import { Tag } from "@/components/ui/tag";

export function HighlightList({ items }: { items: HighlightItem[] }) {
  return (
    <div className="grid gap-8 lg:grid-cols-2">
      {items.map((item) => (
        <article key={item.id} className="border-b border-line/80 pb-6 last:border-b-0 last:pb-0">
          <div className="mb-3 flex flex-wrap gap-2">
            <Tag tone="accent">{item.category}</Tag>
            <Tag tone="muted">{formatDate(item.date)}</Tag>
          </div>
          <h3 className="max-w-xl text-xl font-semibold leading-8 text-ink">{item.title}</h3>
          <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-600">{item.summary}</p>
          {item.url ? (
            <a href={item.url} className="mt-4 inline-flex text-sm font-medium" target="_blank" rel="noreferrer">
              查看来源
            </a>
          ) : null}
        </article>
      ))}
    </div>
  );
}
