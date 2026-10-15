import { Link, Outlet, createFileRoute, redirect, useRouterState } from "@tanstack/react-router";

import { meQuery } from "@/api/auth/me";
import { Permission } from "@/api/auth/permissions";
import { TEMP_SERVICES, type ServiceStatus } from "@/api/services/services";
import { DashboardLayout, type NavItem } from "@/components/dashboard/dashboard-layout";
import {
  Activity01Icon,
  Add01Icon,
  ArrowDataTransferHorizontalIcon,
  BookOpen01Icon,
  CreditCardIcon,
  CustomerSupportIcon,
  DashboardSquare01Icon,
  FileEditIcon,
  HandshakeIcon,
  HugeiconsIcon,
  Invoice01Icon,
  Megaphone01Icon,
  SecurityCheckIcon,
  ServerStack01Icon,
  ShieldUserIcon,
  ShoppingCart01Icon,
  UserCircleIcon,
  Wallet01Icon,
} from "@/components/icons";
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
] satisfies NavItem[][];

const STATUS_CLASS: Record<ServiceStatus, string> = {
  active: "bg-success",
  pending: "bg-muted-foreground",
  suspended: "bg-destructive",
};

function ClientLayout() {
  const { user } = Route.useRouteContext();
  const pathname = useRouterState({ select: (state) => state.location.pathname });
  const inServices = pathname === "/client/services" || pathname.startsWith("/client/services/");

  return (
    <DashboardLayout
      user={user}
      home="/client"
      navLabel="Dashboard"
      navGroups={NAV_GROUPS}
      account="/client/account"
      title={
        <Link to="/client" className="text-sm font-semibold tracking-tight">
          Naplata
        </Link>
      }
      panel={
        inServices && (
          <nav aria-label="Services" className="hidden w-60 shrink-0 flex-col border-r border-border md:flex">
            <div className="flex h-10 shrink-0 items-center gap-2 border-b border-border pr-1.5 pl-3">
              <p className="label text-foreground">Services</p>
              <span className="bg-muted px-1.5 font-mono text-[10px] text-muted-foreground">{TEMP_SERVICES.length}</span>
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
                    className={cn("mt-1.5 size-1.5 shrink-0", STATUS_CLASS[service.status])}
                  />
                </Link>
              ))}
            </div>
          </nav>
        )
      }
    >
      <Outlet />
    </DashboardLayout>
  );
}
