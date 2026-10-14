import { createFileRoute, notFound } from '@tanstack/react-router'

import { TEMP_SERVICES } from '@/api/services/services'

export const Route = createFileRoute('/client/services/$serviceId')({
  loader: ({ params }) => {
    const service = TEMP_SERVICES.find((s) => s.id === params.serviceId)
    if (!service) throw notFound()
    return service
  },
  component: RouteComponent,
})

function RouteComponent() {
  const service = Route.useLoaderData()
  return <h1 className="text-lg font-medium">{service.name}</h1>
}
