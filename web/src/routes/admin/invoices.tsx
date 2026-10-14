import { createFileRoute, redirect } from '@tanstack/react-router'

import { Permission } from '@/api/auth/permissions'

export const Route = createFileRoute('/admin/invoices')({
  beforeLoad: ({ context }) => {
    if (!context.user.permissions.includes(Permission.InvoicesManage)) {
      throw redirect({ to: '/admin' })
    }
  },
  component: RouteComponent,
})

function RouteComponent() {
  return <h1 className="text-lg font-medium">Invoices</h1>
}
