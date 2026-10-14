import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/client/account')({
  component: RouteComponent,
})

function RouteComponent() {
  return <h1 className="text-lg font-medium">Account</h1>
}
