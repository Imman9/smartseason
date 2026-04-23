import { useEffect, useState } from 'react'
import type { FormEvent } from 'react'
import Navbar from '../components/Navbar'
import StatusBadge from '../components/StatusBadge'
import Modal from '../components/Modal'
import { getFields, createField, assignField, getAgents } from '../api/endpoints'
import { computeStatusFE } from '../utils/status'

const STAGE_LABELS: Record<string, string> = {
  PLANTED: 'Planted', GROWING: 'Growing', READY: 'Ready', HARVESTED: 'Harvested'
}

export default function AdminFields() {
  const [fields, setFields] = useState<any[]>([])
  const [agents, setAgents] = useState<any[]>([])
  const [showModal, setShowModal] = useState(false)
  const [creating, setCreating] = useState(false)
  const [form, setForm] = useState({
    name: '', cropType: '', plantingDate: new Date().toISOString().slice(0, 10), assignedAgentId: ''
  })
  const [error, setError] = useState('')

  const navLinks = [
    { label: 'Dashboard', to: '/dashboard' },
    { label: 'Fields', to: '/fields' },
    { label: 'Agents', to: '/agents' },
  ]

  const reload = async () => {
    const [fieldsRes, agentsRes] = await Promise.all([getFields(), getAgents()])
    setFields(fieldsRes.data)
    setAgents(agentsRes.data)
  }

  useEffect(() => { reload() }, [])

  const handleCreate = async (e: FormEvent) => {
    e.preventDefault()
    setCreating(true)
    setError('')
    try {
      await createField({
        name: form.name,
        cropType: form.cropType,
        plantingDate: form.plantingDate,
        assignedAgentId: form.assignedAgentId ? Number(form.assignedAgentId) : null,
      })
      setShowModal(false)
      setForm({ name: '', cropType: '', plantingDate: new Date().toISOString().slice(0, 10), assignedAgentId: '' })
      reload()
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to create field')
    } finally {
      setCreating(false)
    }
  }

  const handleAssign = async (fieldId: number, agentId: string) => {
    await assignField(fieldId, agentId ? Number(agentId) : null)
    reload()
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar links={navLinks} />

      <main className="max-w-7xl mx-auto px-6 py-8">
        <div className="flex items-start justify-between mb-6">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">Fields</h1>
            <p className="text-sm text-gray-500 mt-0.5">Create fields and assign them to agents.</p>
          </div>
          <button
            onClick={() => setShowModal(true)}
            className="bg-gray-900 hover:bg-gray-800 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
          >
            New field
          </button>
        </div>

        {/* Table */}
        <div className="bg-white rounded-xl border border-gray-200">
          <div className="px-5 py-4 border-b border-gray-100">
            <h2 className="text-sm font-semibold text-gray-900">All fields</h2>
          </div>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100">
                {['Name', 'Crop', 'Planted', 'Stage', 'Status', 'Agent', ''].map(h => (
                  <th key={h} className="text-left text-xs font-medium text-gray-400 uppercase tracking-wide px-5 py-3">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {fields.length === 0 && (
                <tr><td colSpan={7} className="text-center text-gray-400 py-10">No fields yet. Create one!</td></tr>
              )}
              {fields.map(f => {
                const status = f.status || computeStatusFE(f)
                return (
                  <tr key={f.id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                    <td className="px-5 py-3 font-medium text-gray-900">{f.name}</td>
                    <td className="px-5 py-3 text-gray-600">{f.cropType}</td>
                    <td className="px-5 py-3 text-gray-500">
                      {new Date(f.plantingDate).toLocaleDateString()}
                    </td>
                    <td className="px-5 py-3 text-gray-600">{STAGE_LABELS[f.currentStage] || f.currentStage}</td>
                    <td className="px-5 py-3"><StatusBadge status={status} /></td>
                    <td className="px-5 py-3">
                      <select
                        className="text-sm border border-gray-200 rounded-lg px-2 py-1 focus:outline-none focus:ring-2 focus:ring-gray-900 bg-white"
                        value={f.assignedAgentId ?? ''}
                        onChange={e => handleAssign(f.id, e.target.value)}
                      >
                        <option value="">Unassigned</option>
                        {agents.map(a => (
                          <option key={a.id} value={a.id}>{a.name}</option>
                        ))}
                      </select>
                    </td>
                    <td className="px-5 py-3">
                      {/* Detail view not implemented yet */}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </main>

      {/* Create Field Modal */}
      {showModal && (
        <Modal title="Create field" onClose={() => setShowModal(false)}>
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">{error}</div>
          )}
          <form onSubmit={handleCreate} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Name</label>
              <input
                type="text"
                value={form.name}
                onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                required
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Crop type</label>
              <input
                type="text"
                value={form.cropType}
                onChange={e => setForm(f => ({ ...f, cropType: e.target.value }))}
                required
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Planting date</label>
              <input
                type="date"
                value={form.plantingDate}
                onChange={e => setForm(f => ({ ...f, plantingDate: e.target.value }))}
                required
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Assign agent</label>
              <select
                value={form.assignedAgentId}
                onChange={e => setForm(f => ({ ...f, assignedAgentId: e.target.value }))}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 bg-white"
              >
                <option value="">Unassigned</option>
                {agents.map(a => (
                  <option key={a.id} value={a.id}>{a.name}</option>
                ))}
              </select>
            </div>
            <button
              type="submit"
              disabled={creating}
              className="w-full bg-gray-900 hover:bg-gray-800 text-white text-sm font-medium py-2.5 rounded-lg transition-colors disabled:opacity-60"
            >
              {creating ? 'Creating…' : 'Create field'}
            </button>
          </form>
        </Modal>
      )}
    </div>
  )
}
