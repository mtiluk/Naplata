import { Link, Outlet, createFileRoute, redirect, useMatches } from "@tanstack/react-router";

import { meQuery } from "@/api/auth/me";
import { Permission } from "@/api/auth/permissions";
import { DashboardLayout, type NavItem } from "@/components/dashboard/dashboard-layout";
import {
  DashboardSquare01Icon,
  Invoice01Icon,
  PackageIcon,
  ReturnRequestIcon,
  ServerStack01Icon,
  Settings01Icon,
  UserGroupIcon,
  UserIcon,
} from "@/components/icons";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/admin")({
  beforeLoad: async ({ context, location }) => {
    const user = await context.queryClient.query(meQuery);
    if (!user) {
      throw redirect({ to: "/login", search: { redirect: location.href } });
    }
    if (!user.permissions.includes(Permission.AccessPanel)) {
      throw redirect({ to: "/client" });
    }
    return { user };
  },
  component: AdminLayout,
});

const NAV_GROUPS = [
  [
    { label: "Overview", to: "/admin", icon: DashboardSquare01Icon },
    { label: "Clients", to: "/admin/clients", icon: UserGroupIcon, permission: Permission.ClientsView },
    { label: "Products", to: "/admin/products", icon: PackageIcon, permission: Permission.ProductsManage },
    { label: "Services", to: "/admin/services", icon: ServerStack01Icon, permission: Permission.ServicesManage },
    { label: "Invoices", to: "/admin/invoices", icon: Invoice01Icon, permission: Permission.InvoicesManage },
    { label: "Refunds", to: "/admin/refunds", icon: ReturnRequestIcon, permission: Permission.PaymentsRefund },
    { label: "Settings", to: "/admin/settings", icon: Settings01Icon, permission: Permission.SettingsManage },
  ],
  [{ label: "Client area", to: "/client", icon: UserIcon }],
] satisfies NavItem[][];

function AdminLayout() {
  const { user } = Route.useRouteContext();
  const crumbs = useMatches().flatMap((match) => (match.staticData.crumb ? [match.staticData.crumb] : []));

  return (
    <DashboardLayout
      user={user}
      home="/admin"
      navLabel="Admin"
      navGroups={NAV_GROUPS}
      title={
        <nav aria-label="Breadcrumb" className="flex min-w-0 items-center gap-2 text-[13px]">
          <Link to="/admin" className="font-semibold tracking-tight">
            Naplata
          </Link>
          {crumbs.map((crumb, index) => (
            <span key={crumb} className="contents">
              <span aria-hidden="true" className="text-muted-foreground/50">/</span>
              <span
                aria-current={index === crumbs.length - 1 ? "page" : undefined}
                className={cn("truncate", index === crumbs.length - 1 ? "text-foreground" : "text-muted-foreground")}
              >
                {crumb}
              </span>
            </span>
          ))}
        </nav>
      }
    >
      <Outlet />
    </DashboardLayout>
  );
}
