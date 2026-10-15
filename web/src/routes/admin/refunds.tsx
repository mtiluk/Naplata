import { createFileRoute } from '@tanstack/react-router'

import { Permission } from '@/api/auth/permissions'
import { requirePermission } from '@/lib/require-permission'

export const Route = createFileRoute('/admin/refunds')({
  staticData: { crumb: 'Refunds' },
  beforeLoad: requirePermission(Permission.PaymentsRefund),
  component: RouteComponent,
})

function RouteComponent() {
  return <h1 className="text-lg font-medium">Refunds</h1>
}
