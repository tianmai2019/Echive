import Link from "next/link";
import {
  Archive,
  CheckSquare,
  Home,
  Inbox,
  Layers3,
  PenLine,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

const navigationItems = [
  { href: "/", label: "Home", icon: Home },
  { href: "/inbox", label: "Inbox", icon: Inbox },
  { href: "/projects", label: "Projects", icon: Layers3 },
  { href: "/tasks", label: "Tasks", icon: CheckSquare },
  { href: "/vault", label: "Vault", icon: Archive },
  { href: "/studio", label: "Studio", icon: PenLine },
];

interface AppShellProps {
  children: React.ReactNode;
}

export function AppShell({ children }: AppShellProps) {
  return (
    <div className="min-h-screen p-4 text-foreground md:p-6">
      <div className="mx-auto flex min-h-[calc(100vh-2rem)] max-w-7xl overflow-hidden rounded-[2rem] border border-white/70 bg-white/76 shadow-2xl shadow-slate-950/10 backdrop-blur md:min-h-[calc(100vh-3rem)]">
        <aside className="hidden w-72 shrink-0 border-r bg-slate-950 px-5 py-6 text-white lg:flex lg:flex-col">
          <Link href="/" className="group rounded-3xl border border-white/10 p-4">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-sm uppercase tracking-[0.3em] text-amber-200">
                  Echive
                </p>
                <h1 className="mt-2 text-2xl font-semibold tracking-tight">
                  AI 数字管家
                </h1>
              </div>
              <div className="flex size-11 items-center justify-center rounded-2xl bg-amber-200 text-slate-950 transition-transform group-hover:rotate-6">
                E
              </div>
            </div>
          </Link>

          <nav className="mt-8 flex flex-1 flex-col gap-2">
            {navigationItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="flex items-center gap-3 rounded-2xl px-4 py-3 text-sm text-slate-300 transition hover:bg-white/10 hover:text-white"
              >
                <item.icon className="size-4" />
                {item.label}
              </Link>
            ))}
          </nav>

          <div className="rounded-3xl bg-white/10 p-4">
            <Badge variant="secondary" className="bg-amber-200 text-slate-950">
              MVP Day 1
            </Badge>
            <p className="mt-3 text-sm leading-6 text-slate-300">
              当前聚焦 Foundation：项目脚手架、Prisma Schema、基础 UI 与验证链路。
            </p>
          </div>
        </aside>

        <main className="flex min-w-0 flex-1 flex-col">
          <header className="flex items-center justify-between border-b bg-white/70 px-5 py-4 lg:hidden">
            <Link href="/" className="font-semibold">
              Echive
            </Link>
            <Button size="sm" variant="outline">
              Quick Capture
            </Button>
          </header>
          {children}
        </main>
      </div>
    </div>
  );
}
