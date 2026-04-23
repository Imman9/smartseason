import { useEffect, useState } from 'react'
import Navbar from '../components/Navbar'
import { getAgents, getFields } from '../api/endpoints'

export default function AdminAgents() {
  const [agents, setAgents] = useState<any[]>([])
  const [fields, setFields] = useState<any[]>([])

  const navLinks = [
    { label: 'Dashboard', to: '/dashboard' },
    { label: 'Fields', to: '/fields' },
    { label: 'Agents', to: '/agents' },
  ]

  useEffect(() => {
    Promise.all([getAgents(), getFields()]).then(([ar, fr]) => {
      setAgents(ar.data)
      setFields(fr.data)
    })
  }, [])

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar links={navLinks} />

      <main className="max-w-4xl mx-auto px-6 py-8">
        <div className="mb-6">
          <h1 className="text-2xl font-semibold text-gray-900">Agents</h1>
          <p className="text-sm text-gray-500 mt-0.5">All registered field agents and their assigned fields.</p>
        </div>

        <div className="bg-white rounded-xl border border-gray-200">
          <div className="px-5 py-4 border-b border-gray-100">
            <h2 className="text-sm font-semibold text-gray-900">{agents.length} field {agents.length === 1 ? 'agent' : 'agents'}</h2>
          </div>
          {agents.length === 0 ? (
            <div className="text-center text-gray-400 py-12">No agents registered yet.</div>
          ) : (
            <div className="divide-y divide-gray-50">
              {agents.map(agent => {
                const assigned = fields.filter(f => f.assignedAgentId === agent.id)
                return (
                  <div key={agent.id} className="px-5 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-gray-900 flex items-center justify-center text-white text-sm font-semibold">
                        {agent.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <div className="text-sm font-medium text-gray-900">{agent.name}</div>
                        <div className="text-xs text-gray-400">{agent.email}</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-semibold text-gray-900">{assigned.length}</div>
                      <div className="text-xs text-gray-400">{assigned.length === 1 ? 'field' : 'fields'} assigned</div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
