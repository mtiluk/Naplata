import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/client/tickets')({
  component: RouteComponent,
})

function RouteComponent() {
  return <h1 className="text-lg font-medium">Support tickets</h1>
}
