import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/client/security')({
  component: RouteComponent,
})

function RouteComponent() {
  return <h1 className="text-lg font-medium">Security</h1>
}
