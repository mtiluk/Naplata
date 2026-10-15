import { keepPreviousData, queryOptions } from "@tanstack/react-query";

export type Client = {
  id: string;
  email: string;
  given_name: string;
  family_name: string;
  created_at: string;
};

export type ClientSort = "name" | "created_at";
export type SortOrder = "asc" | "desc";

export type ClientsParams = {
  q?: string;
  sort?: ClientSort;
  order?: SortOrder;
  page?: number;
};

export type ClientsResponse = {
  clients: Client[];
  total: number;
};

export const CLIENTS_PER_PAGE = 10;

export function clientsQuery({ q, sort, order, page }: ClientsParams) {
  return queryOptions({
    queryKey: ["admin", "clients", { q, sort, order, page }],
    queryFn: async (): Promise<ClientsResponse> => {
      const params = new URLSearchParams({ per_page: String(CLIENTS_PER_PAGE) });
      if (q) params.set("q", q);
      if (sort) params.set("sort", sort);
      if (order) params.set("order", order);
      if (page) params.set("page", String(page));

      const res = await fetch(`/api/v1/admin/clients?${params}`);
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw { status: res.status, ...data };
      return data;
    },
    placeholderData: keepPreviousData,
  });
}
