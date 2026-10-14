import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/client/store')({
  component: RouteComponent,
})

function RouteComponent() {
  return <h1 className="text-lg font-medium">Store</h1>
}
