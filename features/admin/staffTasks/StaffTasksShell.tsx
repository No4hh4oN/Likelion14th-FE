"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

type StaffTasksShellProps = {
  title: string;
  description: string;
  actions?: ReactNode;
  children: ReactNode;
};

const NAV_ITEMS = [
  { href: "/admin/staff-tasks", label: "업무 개요" },
  { href: "/admin/staff-tasks/calendar", label: "일정 관리" },
  { href: "/admin/staff-tasks/notices", label: "공지사항 관리" },
  { href: "/admin/users", label: "사용자 관리" },
];

function isActive(pathname: string, href: string): boolean {
  if (href === "/admin/staff-tasks") {
    return pathname === href;
  }
  return pathname.startsWith(href);
}

export default function StaffTasksShell({
  title,
  description,
  actions,
  children,
}: StaffTasksShellProps) {
  const pathname = usePathname();

  return (
    <section className="bg-background px-4 pb-10 pt-24 text-white lg:px-8 lg:pb-14 lg:pt-28">
      <div className="mx-auto grid max-w-[1280px] gap-5 xl:grid-cols-[240px_1fr]">
        <aside className="self-start rounded-2xl border border-[#3a3d45] bg-[#26282d] p-4 xl:sticky xl:top-24">
          <p className="text-xs font-semibold tracking-[0.1em] text-gray-4">STAFF TASKS</p>
          <h2 className="mt-2 text-xl font-bold">운영진 주요업무</h2>
          <nav className="mt-6 space-y-2">
            {NAV_ITEMS.map((item) => {
              const active = isActive(pathname, item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`block rounded-lg px-3 py-2 text-sm transition ${
                    active
                      ? "border-l-2 border-main-1 bg-[#2f323a] text-white"
                      : "text-gray-4 hover:bg-[#2f323a] hover:text-white"
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </aside>

        <div className="rounded-2xl border border-[#3a3d45] bg-[#2d3037] p-5 lg:p-7">
          <div className="flex flex-wrap items-start justify-between gap-3 border-b border-[#434957] pb-4">
            <div>
              <h1 className="text-[30px] font-bold tracking-[-0.02em] lg:text-[34px]">{title}</h1>
              <p className="mt-2 text-sm text-gray-4">{description}</p>
            </div>
            {actions}
          </div>
          <div className="mt-5">{children}</div>
        </div>
      </div>
    </section>
  );
}

