import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/client/quotes')({
  component: RouteComponent,
})

function RouteComponent() {
  return <h1 className="text-lg font-medium">Quotes</h1>
}
