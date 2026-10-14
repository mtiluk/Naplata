import { Link, Outlet, createFileRoute, redirect } from "@tanstack/react-router";
import { ArrowUUpLeft } from "@phosphor-icons/react/ArrowUUpLeft";
import { GearSix } from "@phosphor-icons/react/GearSix";
import { HardDrives } from "@phosphor-icons/react/HardDrives";
import { Package } from "@phosphor-icons/react/Package";
import { Receipt } from "@phosphor-icons/react/Receipt";
import { SignOut } from "@phosphor-icons/react/SignOut";
import { SquaresFour } from "@phosphor-icons/react/SquaresFour";
import { User } from "@phosphor-icons/react/User";
import { UsersThree } from "@phosphor-icons/react/UsersThree";

import { meQuery } from "@/api/auth/me";
import { Permission } from "@/api/auth/permissions";

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
    { label: "Overview", to: "/admin", icon: SquaresFour },
    { label: "Clients", to: "/admin/clients", icon: UsersThree, permission: Permission.ClientsView },
    { label: "Products", to: "/admin/products", icon: Package, permission: Permission.ProductsManage },
    { label: "Services", to: "/admin/services", icon: HardDrives, permission: Permission.ServicesManage },
    { label: "Invoices", to: "/admin/invoices", icon: Receipt, permission: Permission.InvoicesManage },
    { label: "Refunds", to: "/admin/refunds", icon: ArrowUUpLeft, permission: Permission.PaymentsRefund },
    { label: "Settings", to: "/admin/settings", icon: GearSix, permission: Permission.SettingsManage },
  ],
  [{ label: "Client area", to: "/client", icon: User }],
] as const;

function AdminLayout() {
  const { user } = Route.useRouteContext();
  const name = [user.given_name, user.family_name].filter(Boolean).join(" ");
  const initials = (user.given_name.charAt(0) + user.family_name.charAt(0)).toUpperCase();

  return (
    <div className="flex h-screen flex-col">
      <header className="flex h-12 shrink-0 items-center justify-between border-b border-border px-4">
        <div className="flex items-center gap-2">
          <Link to="/admin" className="text-sm font-semibold tracking-tight">
            Naplata
          </Link>
          <span className="bg-muted px-1.5 text-[10px] font-medium text-muted-foreground">Admin</span>
        </div>

        <div className="flex items-center gap-3">
          <div className="hidden text-right leading-tight sm:block">
            <p className="text-[13px] font-medium">{name}</p>
            <p className="text-[11px] text-muted-foreground">{user.email}</p>
          </div>
          <span className="grid size-8 place-items-center border border-border bg-muted text-xs font-medium">
            {initials}
          </span>
          <Link
            to="/logout"
            aria-label="Sign out"
            title="Sign out"
            className="grid size-8 place-items-center text-muted-foreground transition-colors hover:text-foreground"
          >
            <SignOut className="size-4" />
          </Link>
        </div>
      </header>

      <div className="flex min-h-0 flex-1">
        <nav aria-label="Admin" className="flex w-12 shrink-0 flex-col gap-2 border-r border-border py-2">
          {NAV_GROUPS.map((group, index) => (
            <div
              key={index}
              className="flex flex-col items-center gap-1 border-border not-first:border-t not-first:pt-2 last:mt-auto"
            >
              {group.filter((item) => !("permission" in item) || user.permissions.includes(item.permission)).map((item) => (
                <Link
                  key={item.to}
                  to={item.to}
                  activeOptions={{ exact: item.to === "/admin" }}
                  aria-label={item.label}
                  className="group relative grid size-8 place-items-center border border-transparent text-muted-foreground transition-colors hover:bg-muted hover:text-foreground data-[status=active]:border-border data-[status=active]:bg-muted data-[status=active]:text-foreground"
                >
                  <item.icon className="size-4" />
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

        <main className="min-w-0 flex-1 overflow-auto p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
