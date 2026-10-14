import { createFileRoute, redirect } from '@tanstack/react-router'

import { Permission } from '@/api/auth/permissions'

export const Route = createFileRoute('/admin/settings')({
  beforeLoad: ({ context }) => {
    if (!context.user.permissions.includes(Permission.SettingsManage)) {
      throw redirect({ to: '/admin' })
    }
  },
  component: RouteComponent,
})

function RouteComponent() {
  return <h1 className="text-lg font-medium">Settings</h1>
}
