import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/client/services/')({
  component: RouteComponent,
})

function RouteComponent() {
  return <h1 className="text-lg font-medium">Services</h1>
}
