import { createFileRoute } from '@tanstack/react-router'

import { Permission } from '@/api/auth/permissions'
import { requirePermission } from '@/lib/require-permission'

export const Route = createFileRoute('/admin/settings')({
  staticData: { crumb: 'Settings' },
  beforeLoad: requirePermission(Permission.SettingsManage),
  component: RouteComponent,
})

function RouteComponent() {
  return <h1 className="text-lg font-medium">Settings</h1>
}
