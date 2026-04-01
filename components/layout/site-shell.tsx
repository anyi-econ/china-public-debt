import Link from "next/link";
import type { Route } from "next";
import { ReactNode } from "react";
import { cn } from "@/lib/utils";

const navItems: Array<{ href: Route; label: string; dot?: string }> = [
  { href: "/" as Route, label: "总览", dot: "#8B0000" },
  { href: "/briefs" as Route, label: "简报", dot: "#8B0000" },
  { href: "/sources" as Route, label: "来源", dot: "#8B0000" },
  { href: "/policies" as Route, label: "政策", dot: "#8B0000" },
  { href: "/debt" as Route, label: "债务", dot: "#1B4965" },
  { href: "/news" as Route, label: "讨论", dot: "#2E7D32" },
  { href: "/papers" as Route, label: "文献", dot: "#5C6BC0" },
  { href: "/updates" as Route, label: "更新中心" }
];

export function SiteShell({ children, currentPath }: { children: ReactNode; currentPath: string }) {
  return (
    <div>
      <nav className="site-nav">
        <div className="container-page nav-inner">
          <div className="nav-brand-group">
            <Link href="/" className="nav-brand">
              CGDT
            </Link>
            <span className="nav-inst">中国政府债务研究追踪</span>
          </div>

          <div className="nav-links">
            {navItems.map((item, index) => (
              <div key={item.href} className="contents">
                {index === 5 ? <span className="nav-divider" /> : null}
                <Link href={item.href} className={cn("nav-link", currentPath === item.href && "active")}>
                  {item.dot ? <span className="nav-dot" style={{ background: item.dot }} /> : null}
                  {item.label}
                </Link>
              </div>
            ))}
          </div>
        </div>
      </nav>

      <main className="site-main">{children}</main>

      <footer className="site-footer">
        <div className="container-page footer-inner">
          <div className="footer-brand">
            <span className="footer-title">China Government Debt Tracker</span>
            <span className="footer-subtitle">中国政府债务追踪平台</span>
          </div>
          <div className="footer-meta">
            <p>高校财税研究团队内部使用 · GitHub Pages 发布版</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
