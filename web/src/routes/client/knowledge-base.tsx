import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/client/knowledge-base')({
  component: RouteComponent,
})

function RouteComponent() {
  return <h1 className="text-lg font-medium">Knowledge base</h1>
}
