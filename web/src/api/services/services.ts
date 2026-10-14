export type ServiceStatus = "active" | "pending" | "suspended";

export type Service = {
  id: string;
  name: string;
  detail: string;
  status: ServiceStatus;
};

export const TEMP_SERVICES: Service[] = [
  { id: "web-01", name: "web-01", detail: "VPS 2G · 2 vCPU · 2 GB", status: "active" },
  { id: "api-01", name: "api-01", detail: "VPS 4G · 2 vCPU · 4 GB", status: "active" },
  { id: "postgres", name: "postgres", detail: "VPS 8G · 4 vCPU · 8 GB", status: "active" },
  { id: "acme-hosting", name: "acme.com", detail: "Web Hosting · Starter", status: "pending" },
  { id: "staging", name: "staging", detail: "VPS 2G · 2 vCPU · 2 GB", status: "suspended" },
];
