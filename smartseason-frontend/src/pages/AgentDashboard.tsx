import { useEffect, useState } from 'react'
import Navbar from '../components/Navbar'
import StatusBadge from '../components/StatusBadge'
import Modal from '../components/Modal'
import { getDashboard, updateField, getFieldUpdates } from '../api/endpoints'
import { computeStatusFE } from '../utils/status'

const STAGES = ['PLANTED', 'GROWING', 'READY', 'HARVESTED']
const STAGE_LABELS: Record<string, string> = {
  PLANTED: 'Planted', GROWING: 'Growing', READY: 'Ready', HARVESTED: 'Harvested'
}
const STAGE_COLORS: Record<string, string> = {
  PLANTED: 'bg-indigo-100 text-indigo-700',
  GROWING: 'bg-cyan-100 text-cyan-700',
  READY: 'bg-amber-100 text-amber-700',
  HARVESTED: 'bg-green-100 text-green-700',
}
const STAGE_DOT: Record<string, string> = {
  PLANTED: 'bg-indigo-500', GROWING: 'bg-cyan-500',
  READY: 'bg-amber-500', HARVESTED: 'bg-green-500',
}

function timeAgo(date: string) {
  const secs = Math.floor((Date.now() - new Date(date).getTime()) / 1000)
  if (secs < 60) return `${secs}s ago`
  const mins = Math.floor(secs / 60)
  if (mins < 60) return `${mins}m ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs}h ago`
  return `${Math.floor(hrs / 24)}d ago`
}

export default function AgentDashboard() {
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [selectedField, setSelectedField] = useState<any>(null)
  const [updates, setUpdates] = useState<any[]>([])
  const [form, setForm] = useState({ stage: '', notes: '' })
  const [submitting, setSubmitting] = useState(false)

  const navLinks = [{ label: 'My Fields', to: '/my-fields' }]

  const reload = () => getDashboard().then(r => setData(r.data)).finally(() => setLoading(false))

  useEffect(() => { reload() }, [])

  const openField = async (field: any) => {
    setSelectedField(field)
    setForm({ stage: field.currentStage, notes: '' })
    const res = await getFieldUpdates(field.id)
    setUpdates(res.data)
  }

  const handleUpdate = async () => {
    if (!selectedField) return
    setSubmitting(true)
    try {
      await updateField(selectedField.id, { stage: form.stage, notes: form.notes })
      setSelectedField(null)
      reload()
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center text-gray-400">Loading…</div>
  )

  const stats = data?.stats ?? { total: 0, active: 0, atRisk: 0, completed: 0 }
  const fields: any[] = data?.fields ?? []

  const stageCounts = STAGES.reduce((acc, s) => {
    acc[s] = fields.filter(f => f.currentStage === s).length
    return acc
  }, {} as Record<string, number>)

  const total = stats.total || 1
  const activeW = Math.round((stats.active / total) * 100)
  const riskW = Math.round((stats.atRisk / total) * 100)
  const completedW = 100 - activeW - riskW

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar links={navLinks} />

      <main className="max-w-5xl mx-auto px-6 py-8">
        <div className="mb-6">
          <h1 className="text-2xl font-semibold text-gray-900">My fields</h1>
          <p className="text-sm text-gray-500 mt-0.5">Fields assigned to you. Click one to update.</p>
        </div>

        {/* Stage Pipeline */}
        <div className="bg-white rounded-xl border border-gray-200 p-5 mb-5">
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-4">Crop Stage Pipeline</h2>
          <div className="flex items-center">
            {STAGES.map((stage, i) => (
              <div key={stage} className="flex items-center flex-1">
                <div className={`flex-1 rounded-xl p-4 ${STAGE_COLORS[stage]}`}>
                  <div className="flex items-center gap-2 mb-1">
                    <div className={`w-2 h-2 rounded-full ${STAGE_DOT[stage]}`} />
                    <span className="text-xs font-semibold uppercase tracking-wide opacity-70">{STAGE_LABELS[stage]}</span>
                  </div>
                  <div className="text-2xl font-bold">{stageCounts[stage]}</div>
                  <div className="text-xs opacity-60 mt-0.5">{stageCounts[stage] === 1 ? 'field' : 'fields'}</div>
                </div>
                {i < STAGES.length - 1 && (
                  <div className="px-1">
                    <svg className="w-4 h-4 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Status Bar */}
        <div className="bg-white rounded-xl border border-gray-200 p-5 mb-6">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide">Status Breakdown</h2>
            <span className="text-sm text-gray-400">{stats.total} assigned field{stats.total !== 1 ? 's' : ''}</span>
          </div>
          <div className="w-full h-4 rounded-full overflow-hidden bg-gray-100 flex">
            {stats.active > 0 && <div className="h-full bg-blue-500" style={{ width: `${activeW}%` }} />}
            {stats.atRisk > 0 && <div className="h-full bg-amber-400" style={{ width: `${riskW}%` }} />}
            {stats.completed > 0 && <div className="h-full bg-green-500" style={{ width: `${completedW}%` }} />}
            {stats.total === 0 && <div className="h-full w-full bg-gray-200" />}
          </div>
          <div className="flex items-center gap-6 mt-3">
            <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded-full bg-blue-500" /><span className="text-xs text-gray-600">Active <strong>{stats.active}</strong></span></div>
            <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded-full bg-amber-400" /><span className="text-xs text-gray-600">At Risk <strong>{stats.atRisk}</strong></span></div>
            <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded-full bg-green-500" /><span className="text-xs text-gray-600">Completed <strong>{stats.completed}</strong></span></div>
          </div>
        </div>

        {/* Fields table */}
        <div className="bg-white rounded-xl border border-gray-200">
          <div className="px-5 py-4 border-b border-gray-100">
            <h2 className="text-sm font-semibold text-gray-900">Assigned fields</h2>
          </div>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100">
                {['Name', 'Crop', 'Stage', 'Status', 'Last update'].map(h => (
                  <th key={h} className="text-left text-xs font-medium text-gray-400 uppercase tracking-wide px-5 py-3">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {fields.length === 0 && (
                <tr><td colSpan={5} className="text-center text-gray-400 py-12">No fields assigned to you yet.</td></tr>
              )}
              {fields.map(f => {
                const status = f.status || computeStatusFE(f)
                return (
                  <tr
                    key={f.id}
                    className="border-b border-gray-50 hover:bg-gray-50 cursor-pointer transition-colors"
                    onClick={() => openField(f)}
                  >
                    <td className="px-5 py-3 font-medium text-gray-900">{f.name}</td>
                    <td className="px-5 py-3 text-gray-600">{f.cropType}</td>
                    <td className="px-5 py-3 text-gray-600">{STAGE_LABELS[f.currentStage] || f.currentStage}</td>
                    <td className="px-5 py-3"><StatusBadge status={status} /></td>
                    <td className="px-5 py-3 text-gray-400">{timeAgo(f.updatedAt)}</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </main>

      {/* Update Modal */}
      {selectedField && (
        <Modal title={`Update: ${selectedField.name}`} onClose={() => setSelectedField(null)}>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Crop stage</label>
              <select
                value={form.stage}
                onChange={e => setForm(f => ({ ...f, stage: e.target.value }))}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 bg-white"
              >
                {STAGES.map(s => <option key={s} value={s}>{STAGE_LABELS[s]}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Notes / observations</label>
              <textarea
                value={form.notes}
                onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
                rows={3}
                placeholder="Add any observations about this field…"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 resize-none"
              />
            </div>

            {/* Previous updates */}
            {updates.length > 0 && (
              <div className="mt-2">
                <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">Update history</h3>
                <div className="space-y-2 max-h-36 overflow-y-auto">
                  {updates.map((u: any) => (
                    <div key={u.id} className="text-xs text-gray-500 border-l-2 border-gray-200 pl-3">
                      <span className="font-medium text-gray-700">{STAGE_LABELS[u.stage] || u.stage}</span>
                      {' · '}{timeAgo(u.createdAt)}
                      {u.notes && <div className="italic text-gray-400">{u.notes}</div>}
                    </div>
                  ))}
                </div>
              </div>
            )}

            <button
              onClick={handleUpdate}
              disabled={submitting}
              className="w-full bg-gray-900 hover:bg-gray-800 text-white text-sm font-medium py-2.5 rounded-lg transition-colors disabled:opacity-60"
            >
              {submitting ? 'Saving…' : 'Save update'}
            </button>
          </div>
        </Modal>
      )}
    </div>
  )
}
