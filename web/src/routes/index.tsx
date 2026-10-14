import { useQuery } from "@tanstack/react-query";
import { Link, createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { ArrowRight } from "@phosphor-icons/react/ArrowRight";
import { List } from "@phosphor-icons/react/List";
import { X } from "@phosphor-icons/react/X";

import { meQuery } from "@/api/auth/me";

export const Route = createFileRoute("/")({
  component: Index,
});

const NAV_LINKS = [
  { label: "Pricing", href: "/pricing" },
  { label: "About", href: "/about" },
  { label: "Docs", href: "/docs" },
];

function Index() {
  const { data: user } = useQuery(meQuery);
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div className="font-display">
      <header className="sticky top-0 z-40 border-b border-border bg-background/80 backdrop-blur-md supports-backdrop-filter:bg-background/70">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
          <div className="flex items-center gap-8">
            <Link to="/" className="text-sm font-semibold tracking-tight">
              Naplata
            </Link>

            <nav aria-label="Primary" className="hidden items-center gap-1 sm:flex">
              {NAV_LINKS.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  className="px-2.5 py-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
                >
                  {link.label}
                </a>
              ))}
            </nav>
          </div>

          <div className="flex items-center gap-2">
            <Link
              to={user ? "/client" : "/login"}
              className="inline-flex h-8 items-center gap-2 border border-primary/45 bg-primary/12 pr-2.5 pl-3 text-[13px] font-medium transition-all hover:border-primary/70 hover:bg-primary/22 active:translate-y-px"
            >
              {user ? "Dashboard" : "Sign in"}
              <ArrowRight className="size-4" />
            </Link>

            <button
              type="button"
              aria-controls="mobile-nav"
              aria-expanded={menuOpen}
              aria-label={menuOpen ? "Close menu" : "Open menu"}
              onClick={() => setMenuOpen((prev) => !prev)}
              className="-mr-2 flex size-10 items-center justify-center text-muted-foreground transition-colors hover:text-foreground sm:hidden"
            >
              {menuOpen ? <X className="size-5" /> : <List className="size-5" />}
            </button>
          </div>
        </div>

        <nav id="mobile-nav" aria-label="Primary" hidden={!menuOpen} className="absolute inset-x-0 top-full border-y border-border bg-background sm:hidden">
          <div className="mx-auto flex max-w-6xl flex-col px-6 py-2">
            {NAV_LINKS.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="py-3 text-base text-muted-foreground transition-colors hover:text-foreground"
              >
                {link.label}
              </a>
            ))}
          </div>
        </nav>
      </header>

      <main className="mx-auto max-w-6xl px-6 py-8">
        <h1 className="text-[40px]/[1.08] font-semibold tracking-[-0.028em] text-balance sm:text-5xl/[1.06] lg:text-[64px]/[67px]">
          Naplata
        </h1>
      </main>
    </div>
  );
}
