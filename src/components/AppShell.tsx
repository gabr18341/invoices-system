"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useMemo, useState } from "react";
import { cn } from "@/lib/utils";
import { Home, FileText, Users, Settings, Menu, X } from "lucide-react";

type NavItem = {
  href: string;
  label: string;
  Icon: React.ComponentType<{ className?: string }>;
};

export default function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  const items = useMemo<NavItem[]>(
    () => [
      { href: "/", label: "لوحة التحكم", Icon: Home },
      { href: "/invoices", label: "الفواتير", Icon: FileText },
      { href: "/clients", label: "العملاء", Icon: Users },
      { href: "/settings", label: "الإعدادات", Icon: Settings },
    ],
    []
  );

  const isActive = (href: string) => {
    if (href === "/") return pathname === "/";
    return pathname?.startsWith(href);
  };

  const NavLinks = ({ onNavigate }: { onNavigate?: () => void }) => (
    <nav className="p-3 space-y-1">
      {items.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          onClick={onNavigate}
          className={cn(
            "flex items-center gap-3 px-3 py-2 rounded-lg transition-colors",
            isActive(item.href)
              ? "bg-blue-50 text-blue-900"
              : "text-gray-700 hover:bg-blue-50 hover:text-blue-900"
          )}
        >
          <item.Icon className="w-4 h-4 shrink-0" />
          <span className="text-sm font-semibold">{item.label}</span>
        </Link>
      ))}
    </nav>
  );

  return (
    <div className="min-h-screen md:h-screen md:overflow-hidden flex print:block">
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="md:hidden print:hidden absolute top-4 left-4 z-40 p-3 rounded-full bg-white shadow-lg border border-gray-200 hover:bg-gray-50 transition-colors"
        aria-label="فتح القائمة"
      >
        <Menu className="w-5 h-5 text-gray-800" />
      </button>

      <aside className="hidden md:flex w-64 bg-white border-l border-gray-200 flex-col print:hidden">
        <div className="p-6 text-2xl font-bold text-blue-900 border-b border-gray-200">
          نظام الفواتير
        </div>
        <div className="flex-1 overflow-y-auto">
          <NavLinks />
        </div>
      </aside>

      {open && (
        <div className="md:hidden print:hidden fixed inset-0 z-50">
          <button
            type="button"
            onClick={() => setOpen(false)}
            className="absolute inset-0 bg-black/45"
            aria-label="إغلاق"
          />
          <aside className="absolute inset-y-0 right-0 w-[82%] max-w-xs bg-white shadow-xl border-l border-gray-200 flex flex-col">
            <div className="h-14 px-4 flex items-center justify-between border-b border-gray-200">
              <div className="text-sm font-bold text-blue-900">القائمة</div>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
                aria-label="إغلاق"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto">
              <NavLinks onNavigate={() => setOpen(false)} />
            </div>
          </aside>
        </div>
      )}

      <main className="flex-1 md:overflow-y-auto p-4 sm:p-6 md:p-8 print:p-0">
        {children}
      </main>
    </div>
  );
}
