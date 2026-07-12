import React from 'react'
import { ShieldCheck, Activity, Database, Server } from 'lucide-react'
import { Card, CardHeader, CardTitle, CardContent } from '@/shared/components/ui/card'

export default function StatusPage() {
  const systems = [
    { name: 'Web Application', status: 'operational', icon: Activity },
    { name: 'Firebase Authentication', status: 'operational', icon: ShieldCheck },
    { name: 'Firestore Database', status: 'operational', icon: Database },
    { name: 'Vercel Edge Network', status: 'operational', icon: Server },
  ]

  const incidents = [
    { date: 'No recent incidents.', message: 'All systems are operating normally.' },
  ]

  return (
    <div className="max-w-4xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
      <div className="text-center mb-12">
        <h1 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
          System Status
        </h1>
        <p className="mt-4 text-lg text-on-surface-variant">
          Current status and recent incident history.
        </p>
        <div className="mt-6 inline-flex items-center px-4 py-2 rounded-full bg-green-100 text-green-800 text-sm font-medium">
          <span className="w-2 h-2 rounded-full bg-green-500 mr-2 animate-pulse"></span>
          All Systems Operational
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2 mb-12">
        {systems.map((system) => {
          const Icon = system.icon
          return (
            <Card key={system.name}>
              <CardContent className="p-6 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="p-2 bg-gray-100 rounded-lg">
                    <Icon className="w-6 h-6 text-gray-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">{system.name}</h3>
                  </div>
                </div>
                <div className="text-green-600 font-medium capitalize text-sm bg-green-50 px-3 py-1 rounded-full">
                  {system.status}
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Incidents</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {incidents.map((incident, i) => (
              <div key={i} className="border-l-2 border-gray-200 pl-4 py-2">
                <p className="text-sm font-medium text-gray-900">{incident.date}</p>
                <p className="mt-1 text-sm text-on-surface-variant">{incident.message}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
