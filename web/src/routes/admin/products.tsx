import { createFileRoute } from '@tanstack/react-router'

import { Permission } from '@/api/auth/permissions'
import { requirePermission } from '@/lib/require-permission'

export const Route = createFileRoute('/admin/products')({
  staticData: { crumb: 'Products' },
  beforeLoad: requirePermission(Permission.ProductsManage),
  component: RouteComponent,
})

function RouteComponent() {
  return <h1 className="text-lg font-medium">Products</h1>
}
