import { createFileRoute, redirect } from '@tanstack/react-router'

import { Permission } from '@/api/auth/permissions'

export const Route = createFileRoute('/admin/refunds')({
  beforeLoad: ({ context }) => {
    if (!context.user.permissions.includes(Permission.PaymentsRefund)) {
      throw redirect({ to: '/admin' })
    }
  },
  component: RouteComponent,
})

function RouteComponent() {
  return <h1 className="text-lg font-medium">Refunds</h1>
}
