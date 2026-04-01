import { UpdateLogItem } from "@/lib/types";
import { formatDate } from "@/lib/utils";
import { Tag } from "@/components/ui/tag";

export function RecentList({ items }: { items: UpdateLogItem[] }) {
  return (
    <div>
      {items.map((item) => (
        <article key={item.id} className="list-row grid gap-4 py-5 first:pt-0 lg:grid-cols-[148px_minmax(0,1fr)]">
          <div className="text-sm text-[var(--ink-soft)]">{formatDate(item.date)}</div>
          <div>
            <div className="mb-2 flex flex-wrap gap-2">
              <Tag tone="accent">{item.type}</Tag>
              <Tag tone="muted">{item.status}</Tag>
              <Tag tone="muted">{item.source}</Tag>
            </div>
            <h3 className="text-lg font-medium leading-8 text-[var(--ink)]">{item.title}</h3>
            <p className="mt-2 max-w-3xl text-sm leading-7 text-[var(--ink-soft)]">{item.note}</p>
          </div>
        </article>
      ))}
    </div>
  );
}
