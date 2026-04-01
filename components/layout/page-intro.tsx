import { ReactNode } from "react";

export function PageIntro({
  eyebrow,
  title,
  description,
  meta,
  aside
}: {
  eyebrow: string;
  title: string;
  description: string;
  meta?: ReactNode;
  aside?: ReactNode;
}) {
  return (
    <section className="grid gap-8 border-b border-[var(--line)] pb-8 lg:grid-cols-[minmax(0,1fr)_320px] lg:items-end">
      <div>
        <p className="mb-4 text-[11px] font-semibold uppercase tracking-[0.28em] text-[var(--accent)]">{eyebrow}</p>
        <h1 className="display-serif max-w-5xl text-4xl font-semibold leading-tight tracking-[-0.04em] text-[var(--ink)] sm:text-5xl lg:text-[3.6rem]">
          {title}
        </h1>
        <p className="mt-5 max-w-3xl text-base leading-8 text-[var(--ink-soft)]">{description}</p>
        {meta ? <div className="mt-6 flex flex-wrap gap-5 text-sm text-[var(--ink-soft)]">{meta}</div> : null}
      </div>
      {aside ? (
        <div className="paper-card rounded-[28px] p-6 text-sm leading-7 text-[var(--ink-soft)]">
          {aside}
        </div>
      ) : null}
    </section>
  );
}
