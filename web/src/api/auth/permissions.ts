export const Permission = {
  AccessPanel: "access.panel",
  ClientsView: "clients.view",
  ClientsManage: "clients.manage",
  ProductsManage: "products.manage",
  ServicesManage: "services.manage",
  InvoicesManage: "invoices.manage",
  PaymentsRefund: "payments.refund",
  SettingsManage: "settings.manage",
} as const;

export type Permission = (typeof Permission)[keyof typeof Permission];
