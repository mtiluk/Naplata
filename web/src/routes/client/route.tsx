import { Link, Outlet, createFileRoute, redirect, useRouterState } from "@tanstack/react-router";

import { meQuery } from "@/api/auth/me";
import { Permission } from "@/api/auth/permissions";
import { TEMP_SERVICES, type ServiceStatus } from "@/api/services/services";
import { HugeiconsIcon, Activity01Icon, Add01Icon, ArrowDataTransferHorizontalIcon, BookOpen01Icon, CreditCardIcon, CustomerSupportIcon, DashboardSquare01Icon, FileEditIcon, HandshakeIcon, Invoice01Icon, Logout03Icon, Megaphone01Icon, SecurityCheckIcon, ServerStack01Icon, ShieldUserIcon, ShoppingCart01Icon, UserCircleIcon, Wallet01Icon } from "@/components/icons";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/client")({
  beforeLoad: async ({ context, location }) => {
    const user = await context.queryClient.query(meQuery);
    if (!user) {
      throw redirect({ to: "/login", search: { redirect: location.href } });
    }
    return { user };
  },
  component: ClientLayout,
});

const NAV_GROUPS = [
  [
    { label: "Overview", to: "/client", icon: DashboardSquare01Icon },
    { label: "Services", to: "/client/services", icon: ServerStack01Icon },
    { label: "Invoices", to: "/client/invoices", icon: Invoice01Icon },
    { label: "Store", to: "/client/store", icon: ShoppingCart01Icon },
    { label: "Support tickets", to: "/client/tickets", icon: CustomerSupportIcon },
  ],
  [
    { label: "Quotes", to: "/client/quotes", icon: FileEditIcon },
    { label: "Transactions", to: "/client/transactions", icon: ArrowDataTransferHorizontalIcon },
    { label: "Add funds", to: "/client/credit", icon: Wallet01Icon },
    { label: "Payment methods", to: "/client/payment-methods", icon: CreditCardIcon },
  ],
  [
    { label: "Announcements", to: "/client/announcements", icon: Megaphone01Icon },
    { label: "Knowledge base", to: "/client/knowledge-base", icon: BookOpen01Icon },
    { label: "Network status", to: "/client/network-status", icon: Activity01Icon },
    { label: "Affiliates", to: "/client/affiliates", icon: HandshakeIcon },
  ],
  [
    { label: "Admin area", to: "/admin", icon: ShieldUserIcon, permission: Permission.AccessPanel },
    { label: "Security", to: "/client/security", icon: SecurityCheckIcon },
    { label: "Account", to: "/client/account", icon: UserCircleIcon },
  ],
] as const;

const STATUS_CLASS: Record<ServiceStatus, string> = {
  active: "bg-success",
  pending: "bg-muted-foreground",
  suspended: "bg-destructive",
};

function ClientLayout() {
  const { user } = Route.useRouteContext();
  const name = [user.given_name, user.family_name].filter(Boolean).join(" ");
  const initials = (user.given_name.charAt(0) + user.family_name.charAt(0)).toUpperCase();
  const pathname = useRouterState({ select: (state) => state.location.pathname });
  const inServices = pathname === "/client/services" || pathname.startsWith("/client/services/");

  return (
    <div className="flex h-screen flex-col">
      <header className="flex h-12 shrink-0 items-center justify-between border-b border-border px-4">
        <Link to="/client" className="text-sm font-semibold tracking-tight">
          Naplata
        </Link>

        <div className="flex items-center gap-3">
          <Link to="/client/account" aria-label="Account settings" className="group flex items-center gap-3">
            <div className="hidden text-right leading-tight sm:block">
              <p className="text-[13px] font-medium">{name}</p>
              <p className="text-[11px] text-muted-foreground transition-colors group-hover:text-foreground">{user.email}</p>
            </div>
            <span className="grid size-8 place-items-center border border-border bg-muted text-xs font-medium transition-colors group-hover:border-ring">
              {initials}
            </span>
          </Link>
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
        <nav aria-label="Dashboard" className="flex w-12 shrink-0 flex-col gap-2 border-r border-border py-2">
          {NAV_GROUPS.map((group, index) => (
            <div
              key={index}
              className="flex flex-col items-center gap-1 border-border not-first:border-t not-first:pt-2 last:mt-auto"
            >
              {group.filter((item) => !("permission" in item) || user.permissions.includes(item.permission)).map((item) => (
                <Link
                  key={item.to}
                  to={item.to}
                  activeOptions={{ exact: item.to === "/client" }}
                  aria-label={item.label}
                  className="group relative grid size-8 place-items-center border border-transparent text-muted-foreground transition-colors hover:bg-muted hover:text-foreground data-[status=active]:border-border data-[status=active]:bg-muted data-[status=active]:text-foreground"
                >
                  <HugeiconsIcon icon={item.icon} className="size-4" />
                  <span
                    aria-hidden="true"
                    className="pointer-events-none absolute top-1/2 left-full z-50 ml-2 -translate-y-1/2 bg-foreground px-2 py-1 text-xs font-medium whitespace-nowrap text-background opacity-0 shadow-md transition-opacity duration-300 group-hover:opacity-100 group-focus-visible:opacity-100"
                  >
                    {item.label}
                  </span>
                </Link>
              ))}
            </div>
          ))}
        </nav>

        {inServices && (
          <nav aria-label="Services" className="hidden w-60 shrink-0 flex-col border-r border-border md:flex">
            <div className="flex h-10 shrink-0 items-center gap-2 border-b border-border pr-1.5 pl-3">
              <p className="text-[13px] font-medium">Services</p>
              <span className="bg-muted px-1.5 text-[11px] text-muted-foreground tabular-nums">{TEMP_SERVICES.length}</span>
              <Link
                to="/client/store"
                aria-label="Order a service"
                title="Order a service"
                className="ml-auto grid size-7 place-items-center text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              >
                <HugeiconsIcon icon={Add01Icon} className="size-4" />
              </Link>
            </div>
            <div className="flex flex-col overflow-y-auto">
              {TEMP_SERVICES.map((service) => (
                <Link
                  key={service.id}
                  to="/client/services/$serviceId"
                  params={{ serviceId: service.id }}
                  className="flex items-start gap-2 border-b border-border px-3 py-2.5 transition-colors hover:bg-muted/50 data-[status=active]:bg-muted"
                >
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[13px] font-medium">{service.name}</p>
                    <p className="truncate text-[11px] text-muted-foreground">{service.detail}</p>
                  </div>
                  <span
                    role="img"
                    aria-label={service.status}
                    className={cn("mt-1.5 size-1.5 shrink-0 rounded-full", STATUS_CLASS[service.status])}
                  />
                </Link>
              ))}
            </div>
          </nav>
        )}

        <main className="min-w-0 flex-1 overflow-auto p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
