import { HighlightItem } from "@/lib/types";
import { formatDate } from "@/lib/utils";
import { Tag } from "@/components/ui/tag";

export function HighlightList({ items }: { items: HighlightItem[] }) {
  return (
    <div className="grid gap-4 lg:grid-cols-2">
      {items.map((item) => (
        <article key={item.id} className="rounded-2xl border border-line p-5">
          <div className="mb-3 flex flex-wrap gap-2">
            <Tag>{item.category}</Tag>
            <Tag>{formatDate(item.date)}</Tag>
          </div>
          <h3 className="text-lg font-medium text-ink">{item.title}</h3>
          <p className="mt-3 text-sm leading-6 text-slate-600">{item.summary}</p>
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
