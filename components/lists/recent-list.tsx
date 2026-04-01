import { UpdateLogItem } from "@/lib/types";
import { formatDate } from "@/lib/utils";
import { Tag } from "@/components/ui/tag";

export function RecentList({ items }: { items: UpdateLogItem[] }) {
  return (
    <div className="space-y-4">
      {items.map((item) => (
        <div key={item.id} className="rounded-2xl border border-line p-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <div className="mb-2 flex flex-wrap gap-2">
                <Tag>{item.type}</Tag>
                <Tag>{item.status}</Tag>
                <Tag>{item.source}</Tag>
              </div>
              <h3 className="text-base font-medium text-ink">{item.title}</h3>
              <p className="mt-2 text-sm leading-6 text-slate-500">{item.note}</p>
            </div>
            <div className="text-sm text-slate-500">{formatDate(item.date)}</div>
          </div>
        </div>
      ))}
    </div>
  );
}
