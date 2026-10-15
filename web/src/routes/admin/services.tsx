import { createFileRoute } from '@tanstack/react-router'

import { Permission } from '@/api/auth/permissions'
import { requirePermission } from '@/lib/require-permission'

export const Route = createFileRoute('/admin/services')({
  staticData: { crumb: 'Services' },
  beforeLoad: requirePermission(Permission.ServicesManage),
  component: RouteComponent,
})

function RouteComponent() {
  return <h1 className="text-lg font-medium">Services</h1>
}
