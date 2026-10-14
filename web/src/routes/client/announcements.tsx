import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/client/announcements')({
  component: RouteComponent,
})

function RouteComponent() {
  return <h1 className="text-lg font-medium">Announcements</h1>
}
