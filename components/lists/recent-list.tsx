import { UpdateLogItem } from "@/lib/types";
import { formatDate } from "@/lib/utils";

export function RecentList({ items }: { items: UpdateLogItem[] }) {
  return (
    <div className="flex flex-col gap-3">
      {items.map((item) => (
        <article key={item.id} className="info-card p-4">
          <div className="sidebar-paper-meta">
            {formatDate(item.date)} · {item.type} · {item.source}
          </div>
          <h3 className="sidebar-paper-title-text">{item.title}</h3>
          <p className="sidebar-paper-note">{item.note}</p>
        </article>
      ))}
    </div>
  );
}
