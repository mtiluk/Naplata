import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/client/')({
  component: RouteComponent,
})

function RouteComponent() {
  const { user } = Route.useRouteContext()
  return <main className="px-6 py-8">{user.email}</main>
}
