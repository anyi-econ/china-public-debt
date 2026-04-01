import { ReactNode } from "react";

export function SectionCard({
  title,
  description,
  children,
  actions
}: {
  title: string;
  description?: string;
  children: ReactNode;
  actions?: ReactNode;
}) {
  return (
    <section>
      <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
        <div className="min-w-0 flex-1">
          <h2 className="section-title">
            {title}
            {description ? <span className="section-sub">{description}</span> : null}
          </h2>
        </div>
        {actions}
      </div>
      {children}
    </section>
  );
}
