import { createFileRoute, redirect } from '@tanstack/react-router'

import { Permission } from '@/api/auth/permissions'

export const Route = createFileRoute('/admin/clients')({
  beforeLoad: ({ context }) => {
    if (!context.user.permissions.includes(Permission.ClientsView)) {
      throw redirect({ to: '/admin' })
    }
  },
  component: RouteComponent,
})

function RouteComponent() {
  return <h1 className="text-lg font-medium">Clients</h1>
}
