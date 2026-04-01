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
    <div className="min-h-screen">
      <header className="border-b border-line bg-[#eef3f8]">
        <div className="container-page py-6">
          <div className="overflow-hidden rounded-[28px] border border-[#22364f] bg-[#102033] px-6 py-7 text-white shadow-soft">
            <div className="pointer-events-none absolute hidden" />
            <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
              <div>
                <p className="mb-2 text-sm font-medium uppercase tracking-[0.3em] text-slate-300">China Government Debt Tracker</p>
                <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">中国政府债务追踪平台</h1>
                <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-300 sm:text-base">
                  持续追踪中国政府债务的政策演变、发行动态、舆论讨论与学术研究
                </p>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-slate-300">
                  面向高校财税研究团队的内部研究型信息聚合网页
                </div>
                <div className="rounded-2xl border border-white/10 bg-white/10 px-4 py-3 text-sm text-white">
                  聚焦政策制度、债券动态、讨论与文献的持续更新
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="container-page grid gap-6 lg:grid-cols-[240px_minmax(0,1fr)]">
        <aside className="card h-fit p-3 lg:sticky lg:top-6">
          <nav className="space-y-1">
            {navItems.map(({ href, label, icon: Icon }) => {
              const active = currentPath === href;
              return (
                <Link
                  key={href}
                  href={href}
                  className={cn(
                    "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition-colors",
                    active ? "bg-ink text-white" : "text-slate-600 hover:bg-mist hover:text-ink"
                  )}
                >
                  <Icon className="h-4 w-4" />
                  {label}
                </Link>
              );
            })}
          </nav>
          <div className="mt-5 rounded-2xl bg-mist p-4 text-sm text-slate-600">
            <p className="font-medium text-ink">使用建议</p>
            <p className="mt-2 leading-6">先看更新中心和来源状态，再按政策、债务、新闻、文献四条线展开阅读。</p>
            <Link href="/updates" className="mt-3 inline-flex items-center gap-2 font-medium">
              查看来源状态
              <ArrowUpRight className="h-4 w-4" />
            </Link>
          </div>
        </aside>
        <main className="space-y-6">{children}</main>
      </div>
    </div>
  );
}
