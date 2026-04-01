import { ReactNode } from "react";

export function PageIntro({
  eyebrow,
  title,
  description,
  meta,
  variant = "topic"
}: {
  eyebrow: string;
  title: string;
  description: string;
  meta?: ReactNode;
  variant?: "topic" | "library" | "archive";
}) {
  const sectionClass = variant === "topic" ? "topic-hero" : variant === "archive" ? "archive-hero" : "lit-hero";
  const titleClass = variant === "topic" ? "topic-hero-title" : variant === "archive" ? "archive-hero-title" : "lit-hero-title";
  const metaClass = variant === "topic" ? "topic-hero-period" : variant === "archive" ? "archive-hero-subtitle" : "lit-hero-subtitle";

  return (
    <section className={sectionClass}>
      <div className="container-page">
        <div className={variant === "topic" ? "" : "mx-auto max-w-3xl"}>
          <p className="section-title">
            {eyebrow}
            {meta ? <span className="section-sub">{meta}</span> : null}
          </p>
          <h1 className={titleClass}>{title}</h1>
          <p className={metaClass}>{description}</p>
        </div>
      </div>
    </section>
  );
}
