import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/client/payment-methods')({
  component: RouteComponent,
})

function RouteComponent() {
  return <h1 className="text-lg font-medium">Payment methods</h1>
}
