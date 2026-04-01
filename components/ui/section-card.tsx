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
    <section className="border-t border-[var(--line-strong)] pt-7">
      <div className="mb-7 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div className="max-w-3xl">
          <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.28em] text-[var(--accent)]">Section</p>
          <h2 className="section-title text-[var(--ink)]">{title}</h2>
          {description ? <p className="mt-3 text-sm leading-7 text-[var(--ink-soft)]">{description}</p> : null}
        </div>
        {actions}
      </div>
      {children}
    </section>
  );
}
