import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/client/affiliates')({
  component: RouteComponent,
})

function RouteComponent() {
  return <h1 className="text-lg font-medium">Affiliates</h1>
}
