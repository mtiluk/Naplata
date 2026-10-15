import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/admin/')({
  staticData: { crumb: 'Overview' },
  component: RouteComponent,
})

function RouteComponent() {
  return <h1 className="text-lg font-medium">Overview</h1>
}
