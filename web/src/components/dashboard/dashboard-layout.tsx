import { Link, type LinkProps } from "@tanstack/react-router";
import type { IconSvgElement } from "@hugeicons/react";
import type { ReactNode } from "react";

import type { User } from "@/api/auth/me";
import type { Permission } from "@/api/auth/permissions";
import { HugeiconsIcon, Logout03Icon } from "@/components/icons";

export type NavItem = {
  label: string;
  to: LinkProps["to"];
  icon: IconSvgElement;
  permission?: Permission;
};

type DashboardLayoutProps = {
  user: User;
  title: ReactNode;
  home: LinkProps["to"];
  navLabel: string;
  navGroups: readonly (readonly NavItem[])[];
  account?: LinkProps["to"];
  panel?: ReactNode;
  children: ReactNode;
};

export function DashboardLayout({ user, title, home, navLabel, navGroups, account, panel, children }: DashboardLayoutProps) {
  const name = [user.given_name, user.family_name].filter(Boolean).join(" ");
  const initials = (user.given_name.charAt(0) + user.family_name.charAt(0)).toUpperCase();

  const userInfo = (
    <>
      <div className="hidden text-right leading-tight sm:block">
        <p className="text-[13px] font-medium">{name}</p>
        <p className="text-[11px] text-muted-foreground transition-colors group-hover:text-foreground">{user.email}</p>
      </div>
      <span className="grid size-8 place-items-center border border-border bg-muted font-mono text-[11px] font-medium transition-colors group-hover:border-ring">
        {initials}
      </span>
    </>
  );

  return (
    <div className="flex h-screen flex-col">
      <header className="flex h-12 shrink-0 items-center justify-between border-b border-border px-4">
        {title}

        <div className="flex items-center gap-3">
          {account ? (
            <Link to={account} aria-label="Account settings" className="group flex items-center gap-3">
              {userInfo}
            </Link>
          ) : (
            <div className="flex items-center gap-3">{userInfo}</div>
          )}
          <Link
            to="/logout"
            aria-label="Sign out"
            title="Sign out"
            className="grid size-8 place-items-center text-muted-foreground transition-colors hover:text-foreground"
          >
            <HugeiconsIcon icon={Logout03Icon} className="size-4" />
          </Link>
        </div>
      </header>

      <div className="flex min-h-0 flex-1">
        <nav aria-label={navLabel} className="flex w-12 shrink-0 flex-col gap-2 border-r border-border py-2">
          {navGroups.map((group, index) => (
            <div
              key={index}
              className="flex flex-col items-center gap-1 border-border not-first:border-t not-first:pt-2 last:mt-auto"
            >
              {group
                .filter((item) => !item.permission || user.permissions.includes(item.permission))
                .map((item) => (
                  <Link
                    key={item.to}
                    to={item.to}
                    activeOptions={{ exact: item.to === home }}
                    aria-label={item.label}
                    className="group relative grid size-8 place-items-center text-muted-foreground transition-colors before:absolute before:top-1/2 before:-left-2 before:h-4 before:w-0.5 before:-translate-y-1/2 before:bg-primary before:opacity-0 hover:bg-muted hover:text-foreground data-[status=active]:bg-muted data-[status=active]:text-foreground data-[status=active]:before:opacity-100"
                  >
                    <HugeiconsIcon icon={item.icon} className="size-4" />
                    <span
                      aria-hidden="true"
                      className="label pointer-events-none absolute top-1/2 left-full z-50 ml-2.5 -translate-y-1/2 bg-foreground px-1.5 py-1 whitespace-nowrap text-background opacity-0 transition-opacity duration-300 group-hover:opacity-100 group-focus-visible:opacity-100"
                    >
                      {item.label}
                    </span>
                  </Link>
                ))}
            </div>
          ))}
        </nav>

        {panel}

        <main className="min-w-0 flex-1 overflow-auto p-6">{children}</main>
      </div>
    </div>
  );
}
