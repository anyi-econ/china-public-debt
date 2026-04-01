import { ReactNode } from "react";

export function SectionCard({ title, description, children, actions }: { title: string; description?: string; children: ReactNode; actions?: ReactNode }) {
  return (
    <section className="editorial-surface px-5 py-6 sm:px-7 sm:py-7">
      <div className="mb-6 flex flex-col gap-3 border-b border-line/80 pb-5 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="mb-3 h-px w-16 bg-slateBlue/80" />
          <h2 className="section-title">{title}</h2>
          {description ? <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-500">{description}</p> : null}
        </div>
        {actions}
      </div>
      {children}
    </section>
  );
}
