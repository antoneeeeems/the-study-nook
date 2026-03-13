"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Receipt,
  GitBranch,
  Package,
  ShoppingCart,
  Tag,
  Workflow,
  Lightbulb,
  Scale,
} from "lucide-react";

const NAV_SECTIONS = [
  {
    label: "Analytics",
    items: [
      { href: "/", icon: LayoutDashboard, label: "Dashboard" },
      { href: "/transactions", icon: Receipt, label: "Transactions" },
      { href: "/rules", icon: GitBranch, label: "Rules" },
      { href: "/bundles", icon: Package, label: "Bundles" },
    ],
  },
  {
    label: "Shop",
    items: [
      { href: "/shop", icon: ShoppingCart, label: "Store" },
      { href: "/cart", icon: ShoppingCart, label: "Cart" },
      { href: "/promos", icon: Tag, label: "Promos" },
    ],
  },
  {
    label: "Intelligence",
    items: [
      { href: "/pipeline", icon: Workflow, label: "Pipeline" },
      { href: "/insights", icon: Lightbulb, label: "Insights" },
      { href: "/compare", icon: Scale, label: "Compare" },
    ],
  },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-60 shrink-0 flex flex-col bg-[color:var(--color-surface-2)] border-r border-[color:var(--color-border)]">
      {/* Logo */}
      <div className="px-5 py-6 border-b border-[color:var(--color-border)]">
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 overflow-hidden rounded-xl soft-chip">
            <Image
              src="/logo.png"
              alt="The Study Nook logo"
              width={36}
              height={36}
              className="h-full w-full object-cover"
              priority
            />
          </div>
          <div>
            <h1 className="text-sm font-bold tracking-wide text-[color:var(--color-text)]">The Study Nook</h1>
            <p className="text-[10px] text-[color:var(--color-text-muted)] tracking-widest uppercase font-medium">MBA Engine</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 px-3 py-5 space-y-6 overflow-y-auto" aria-label="Primary navigation">
        {NAV_SECTIONS.map((section) => (
          <section key={section.label} aria-label={section.label}>
            <p className="px-3 mb-2 text-[10px] font-semibold tracking-[0.15em] uppercase text-[color:var(--color-text-muted)]">
              {section.label}
            </p>
            <ul className="space-y-0.5">
              {section.items.map((item) => {
                const active = pathname === item.href;
                const Icon = item.icon;
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      aria-current={active ? "page" : undefined}
                      className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all duration-200 group relative ${
                        active
                          ? "soft-pressed text-[color:var(--color-text)] font-semibold"
                          : "text-[color:var(--color-text-muted)] hover:bg-[color:var(--color-surface-1)] hover:shadow-[var(--shadow-neu-raised)] hover:text-[color:var(--color-text)]"
                      }`}
                    >
                      {active && (
                        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-0.75 h-5 bg-[color:var(--color-text-muted)] rounded-r-full" />
                      )}
                      <Icon size={18} className={active ? "text-[color:var(--color-text)]" : "text-[color:var(--color-text-muted)] group-hover:text-[color:var(--color-text)]"} />
                      <span>{item.label}</span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </section>
        ))}
      </nav>

      <div className="px-5 py-4 border-t border-[color:var(--color-border)]">
        <div className="soft-chip rounded-xl px-3 py-2 flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-[color:var(--color-teal-500)] animate-pulse-glow" />
          <span className="text-[10px] text-[color:var(--color-text-muted)] font-medium">FP-Growth + Self-Learning</span>
        </div>
      </div>
    </aside>
  );
}
