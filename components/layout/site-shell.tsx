import Link from "next/link";
import type { Route } from "next";
import { ArrowUpRight, Landmark, LibraryBig, Newspaper, RefreshCcw, ScrollText, WalletCards } from "lucide-react";
import { ReactNode } from "react";
import { cn } from "@/lib/utils";

const navItems: Array<{ href: Route; label: string; icon: typeof Landmark }> = [
  { href: "/", label: "总览", icon: Landmark },
  { href: "/updates", label: "更新中心", icon: RefreshCcw },
  { href: "/policies", label: "政策制度", icon: ScrollText },
  { href: "/debt", label: "债务动态", icon: WalletCards },
  { href: "/news", label: "新闻讨论", icon: Newspaper },
  { href: "/papers", label: "文献研究", icon: LibraryBig }
];

export function SiteShell({ children, currentPath }: { children: ReactNode; currentPath: string }) {
  return (
    <div className="site-frame min-h-screen">
      <header className="border-b border-white/10 bg-[var(--navy)] text-white">
        <div className="container-page">
          <div className="flex min-h-[84px] items-center justify-between gap-6 py-4">
            <div className="min-w-0">
              <Link href="/" className="inline-flex items-center gap-3">
                <span className="display-serif text-2xl font-semibold tracking-[-0.05em]">CGDT</span>
                <span className="hidden text-sm text-white/70 sm:inline">China Government Debt Tracker</span>
              </Link>
            </div>
            <nav className="hidden flex-wrap items-center gap-2 lg:flex">
              {navItems.map(({ href, label, icon: Icon }) => {
                const active = currentPath === href;
                return (
                  <Link
                    key={href}
                    href={href}
                    className={cn(
                      "inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm text-white/72 transition hover:bg-white/8 hover:text-white",
                      active && "nav-link-active"
                    )}
                  >
                    <Icon className="h-4 w-4" />
                    {label}
                  </Link>
                );
              })}
            </nav>
          </div>

          <div className="grid gap-6 border-t border-white/10 py-7 lg:grid-cols-[minmax(0,1fr)_360px] lg:items-end">
            <div>
              <p className="issue-kicker">Research Edition · 已核验信源</p>
              <h1 className="display-serif mt-3 text-4xl font-semibold tracking-[-0.05em] text-white sm:text-5xl lg:text-[4.4rem]">
                中国政府债务追踪平台
              </h1>
              <p className="mt-4 max-w-3xl text-base leading-8 text-white/72 sm:text-lg">
                持续追踪中国政府债务的政策演变、发行动态、舆论讨论与学术研究。
              </p>
            </div>
            <div className="grid gap-3 text-sm text-white/70 sm:grid-cols-2 lg:grid-cols-1">
              <div className="rounded-[24px] border border-white/10 bg-white/5 px-5 py-4 leading-7">
                面向高校财税研究团队，优先保证来源可核验、结构可维护、页面可直接分享。
              </div>
              <Link
                href="/updates"
                className="inline-flex items-center justify-between rounded-[24px] border border-white/10 bg-white/5 px-5 py-4 text-white transition hover:bg-white/8"
              >
                <span>查看来源状态与更新说明</span>
                <ArrowUpRight className="h-4 w-4" />
              </Link>
            </div>
          </div>

          <nav className="flex gap-2 overflow-x-auto border-t border-white/10 py-3 lg:hidden">
            {navItems.map(({ href, label }) => {
              const active = currentPath === href;
              return (
                <Link
                  key={href}
                  href={href}
                  className={cn(
                    "whitespace-nowrap rounded-full px-4 py-2 text-sm text-white/70 transition hover:bg-white/8 hover:text-white",
                    active && "nav-link-active"
                  )}
                >
                  {label}
                </Link>
              );
            })}
          </nav>
        </div>
      </header>

      <main className="container-page py-10 sm:py-12">
        <div className="space-y-12">{children}</div>
      </main>
    </div>
  );
}
