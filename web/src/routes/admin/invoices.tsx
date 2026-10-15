import { createFileRoute } from '@tanstack/react-router'

import { Permission } from '@/api/auth/permissions'
import { requirePermission } from '@/lib/require-permission'

export const Route = createFileRoute('/admin/invoices')({
  staticData: { crumb: 'Invoices' },
  beforeLoad: requirePermission(Permission.InvoicesManage),
  component: RouteComponent,
})

function RouteComponent() {
  return <h1 className="text-lg font-medium">Invoices</h1>
}
