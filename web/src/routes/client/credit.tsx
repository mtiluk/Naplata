import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/client/credit')({
  component: RouteComponent,
})

function RouteComponent() {
  return <h1 className="text-lg font-medium">Add funds</h1>
}
