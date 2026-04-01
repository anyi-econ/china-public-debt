import type { ReactNode } from "react";

export function Tag({
  children,
  tone = "default"
}: {
  children: ReactNode;
  tone?: "default" | "accent" | "success" | "muted";
}) {
  const className = {
    default: "tag-pill",
    accent: "tag-pill accent",
    success: "tag-pill success",
    muted: "tag-pill"
  }[tone];

  return <span className={className}>{children}</span>;
}
