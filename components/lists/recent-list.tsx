import { UpdateLogItem } from "@/lib/types";
import { formatDate } from "@/lib/utils";
import { Tag } from "@/components/ui/tag";

export function RecentList({ items }: { items: UpdateLogItem[] }) {
  return (
    <div>
      {items.map((item) => (
        <div key={item.id} className="list-row first:pt-0 last:border-b-0 last:pb-0">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <div className="mb-2 flex flex-wrap gap-2">
                <Tag tone="accent">{item.type}</Tag>
                <Tag tone="muted">{item.status}</Tag>
                <Tag tone="muted">{item.source}</Tag>
              </div>
              <h3 className="text-base font-medium leading-7 text-ink">{item.title}</h3>
              <p className="mt-2 max-w-3xl text-sm leading-7 text-slate-500">{item.note}</p>
            </div>
            <div className="whitespace-nowrap text-sm text-slate-500">{formatDate(item.date)}</div>
          </div>
        </div>
      ))}
    </div>
  );
}
