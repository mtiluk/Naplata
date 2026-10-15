import { useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import {
  createColumnHelper,
  functionalUpdate,
  rowPaginationFeature,
  rowSortingFeature,
  tableFeatures,
  useTable,
  type SortingState,
} from "@tanstack/react-table";

import { Permission } from "@/api/auth/permissions";
import { CLIENTS_PER_PAGE, clientsQuery, type Client, type ClientSort, type ClientStatus, type SortOrder } from "@/api/clients/clients";
import { Add01Icon, ArrowLeft01Icon, ArrowRight01Icon, HugeiconsIcon } from "@/components/icons";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { requirePermission } from "@/lib/require-permission";
import { cn } from "@/lib/utils";

type ClientsSearch = {
  q?: string;
  sort?: ClientSort;
  order?: SortOrder;
  page?: number;
};

export const Route = createFileRoute("/admin/clients")({
  staticData: { crumb: "Clients" },
  validateSearch: (search: Record<string, unknown>): ClientsSearch => {
    const page = Number(search.page);
    return {
      q: typeof search.q === "string" && search.q !== "" ? search.q : undefined,
      sort: search.sort === "name" || search.sort === "created_at" ? search.sort : undefined,
      order: search.order === "asc" || search.order === "desc" ? search.order : undefined,
      page: Number.isInteger(page) && page > 1 ? page : undefined,
    };
  },
  beforeLoad: requirePermission(Permission.ClientsView),
  component: ClientsPage,
});

const date = new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "short", year: "numeric" });

const STATUS_CLASS: Record<ClientStatus, string> = {
  active: "bg-emerald-300/10 text-emerald-200",
  suspended: "bg-amber-300/10 text-amber-200",
  closed: "bg-rose-300/10 text-rose-200",
};

const NO_CLIENTS: Client[] = [];

const features = tableFeatures({ rowPaginationFeature, rowSortingFeature });
const helper = createColumnHelper<typeof features, Client>();
const columns = helper.columns([
  helper.accessor((client) => `${client.given_name} ${client.family_name}`.trim(), {
    id: "name",
    header: "Client",
    cell: ({ row, getValue }) => (
      <>
        <p className="font-medium">{getValue()}</p>
        <p className="mt-0.5 text-[11px] text-muted-foreground">{row.original.email}</p>
      </>
    ),
  }),
  helper.accessor("company", {
    header: "Company",
    enableSorting: false,
    cell: ({ getValue }) => getValue() ?? <span className="text-muted-foreground">—</span>,
  }),
  helper.accessor("status", {
    header: "Status",
    enableSorting: false,
    cell: ({ getValue }) => (
      <span className={cn("inline-flex px-1.5 py-0.5 text-[11px] capitalize", STATUS_CLASS[getValue()])}>{getValue()}</span>
    ),
  }),
  helper.accessor("created_at", {
    header: "Created",
    sortDescFirst: true,
    cell: ({ getValue }) => <span className="text-muted-foreground">{date.format(new Date(getValue()))}</span>,
  }),
]);

function ClientsPage() {
  const { user } = Route.useRouteContext();
  const canManage = user.permissions.includes(Permission.ClientsManage);
  const navigate = Route.useNavigate();
  const { q, sort = "created_at", order = sort === "created_at" ? "desc" : "asc", page = 1 } = Route.useSearch();

  const clients = useQuery(clientsQuery({ q, sort, order, page }));
  const total = clients.data?.total ?? 0;
  const sorting: SortingState = [{ id: sort, desc: order === "desc" }];

  const table = useTable({
    features,
    columns,
    data: clients.data?.clients ?? NO_CLIENTS,
    manualPagination: true,
    manualSorting: true,
    enableSortingRemoval: false,
    rowCount: total,
    state: {
      pagination: { pageIndex: page - 1, pageSize: CLIENTS_PER_PAGE },
      sorting,
    },
    onSortingChange: (updater) => {
      const [next] = functionalUpdate(updater, sorting);
      if (!next) return;
      navigate({
        search: (prev) => ({ ...prev, sort: next.id as ClientSort, order: next.desc ? "desc" : "asc", page: undefined }),
      });
    },
    onPaginationChange: (updater) => {
      const next = functionalUpdate(updater, { pageIndex: page - 1, pageSize: CLIENTS_PER_PAGE });
      navigate({ search: (prev) => ({ ...prev, page: next.pageIndex > 0 ? next.pageIndex + 1 : undefined }) });
    },
  });
  const rows = table.getRowModel().rows;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-2">
        <h1 className="text-lg font-medium">Clients</h1>
        {clients.data && <span className="bg-muted px-1.5 font-mono text-[11px] text-muted-foreground">{total}</span>}
        {canManage && (
          <Button className="ml-auto">
            <HugeiconsIcon icon={Add01Icon} className="size-4" />
            New client
          </Button>
        )}
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <Input
          type="search"
          placeholder="Search clients"
          value={q ?? ""}
          onChange={(event) =>
            navigate({ search: (prev) => ({ ...prev, q: event.target.value || undefined, page: undefined }), replace: true })
          }
          className="w-full sm:w-64"
        />

        {q && (
          <button
            type="button"
            onClick={() => navigate({ search: (prev) => ({ ...prev, q: undefined, page: undefined }) })}
            className="h-8 px-2 text-[13px] text-destructive transition-colors hover:text-destructive/70"
          >
            Reset
          </button>
        )}
      </div>

      <Table className={cn("transition-opacity", clients.isPlaceholderData && "opacity-60")}>
        <TableHeader>
          {table.getHeaderGroups().map((group) => (
            <TableRow key={group.id} className="hover:bg-transparent">
              {group.headers.map((header) => (
                <TableHead
                  key={header.id}
                  sort={header.column.getIsSorted()}
                  onSort={
                    header.column.getCanSort()
                      ? (event) => {
                          header.column.getToggleSortingHandler()?.(event);
                          table.setPageIndex(0);
                        }
                      : undefined
                  }
                >
                  {header.isPlaceholder ? null : <table.FlexRender header={header} />}
                </TableHead>
              ))}
            </TableRow>
          ))}
        </TableHeader>
        <TableBody>
          {rows.length === 0 && (
            <TableRow className="hover:bg-transparent">
              <TableCell colSpan={columns.length} className="h-24 text-center text-muted-foreground">
                {clients.isPending
                  ? "Loading clients…"
                  : clients.isError
                    ? "Couldn't load clients"
                    : q
                      ? `No clients match "${q}"`
                      : "No clients yet"}
              </TableCell>
            </TableRow>
          )}
          {rows.map((row) => (
            <TableRow key={row.id} className="cursor-pointer">
              {row.getAllCells().map((cell) => (
                <TableCell key={cell.id}>
                  <table.FlexRender cell={cell} />
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <div className="flex items-center justify-between text-xs text-muted-foreground tabular-nums">
        <p>
          {total === 0 ? 0 : (page - 1) * CLIENTS_PER_PAGE + 1}–{Math.min(total, page * CLIENTS_PER_PAGE)} of {total}
        </p>
        <div className="flex items-center gap-1.5">
          <span className="mr-3">
            Page {total === 0 ? 0 : page} of {table.getPageCount()}
          </span>
          <button
            type="button"
            aria-label="Previous page"
            disabled={!table.getCanPreviousPage()}
            onClick={() => table.previousPage()}
            className="grid size-6 place-items-center border border-border transition-colors hover:bg-muted hover:text-foreground disabled:pointer-events-none disabled:opacity-50"
          >
            <HugeiconsIcon icon={ArrowLeft01Icon} className="size-3" />
          </button>
          <button
            type="button"
            aria-label="Next page"
            disabled={!table.getCanNextPage()}
            onClick={() => table.nextPage()}
            className="grid size-6 place-items-center border border-border transition-colors hover:bg-muted hover:text-foreground disabled:pointer-events-none disabled:opacity-50"
          >
            <HugeiconsIcon icon={ArrowRight01Icon} className="size-3" />
          </button>
        </div>
      </div>
    </div>
  );
}
