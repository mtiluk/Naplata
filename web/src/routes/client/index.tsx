import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/client/')({
  component: RouteComponent,
})

function RouteComponent() {
  const { user } = Route.useRouteContext()
  return <div>{user.email}</div>
}
