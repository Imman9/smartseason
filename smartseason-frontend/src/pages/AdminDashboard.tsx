import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import Navbar from '../components/Navbar'
import StatusBadge from '../components/StatusBadge'
import { getDashboard } from '../api/endpoints'

const STAGES = ['PLANTED', 'GROWING', 'READY', 'HARVESTED'] as const
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
  PLANTED: 'bg-indigo-500',
  GROWING: 'bg-cyan-500',
  READY: 'bg-amber-500',
  HARVESTED: 'bg-green-500',
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

export default function AdminDashboard() {
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getDashboard().then(r => setData(r.data)).finally(() => setLoading(false))
  }, [])

  const navLinks = [
    { label: 'Dashboard', to: '/dashboard' },
    { label: 'Fields', to: '/fields' },
    { label: 'Agents', to: '/agents' },
  ]

  if (loading) return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center text-gray-400">Loading…</div>
  )

  const stats = data?.stats ?? { total: 0, active: 0, atRisk: 0, completed: 0 }
  const fields: any[] = data?.fields ?? []
  const updates: any[] = data?.recentUpdates ?? []

  // Stage pipeline counts
  const stageCounts = STAGES.reduce((acc, s) => {
    acc[s] = fields.filter(f => f.currentStage === s).length
    return acc
  }, {} as Record<string, number>)

  // Status bar widths
  const total = stats.total || 1
  const activeW = Math.round((stats.active / total) * 100)
  const riskW = Math.round((stats.atRisk / total) * 100)
  const completedW = 100 - activeW - riskW

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar links={navLinks} />

      <main className="max-w-7xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="flex items-start justify-between mb-8">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">Coordinator dashboard</h1>
            <p className="text-sm text-gray-500 mt-0.5">Overview of all fields and recent agent activity.</p>
          </div>
          <Link
            to="/fields"
            className="bg-gray-900 hover:bg-gray-800 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
          >
            Manage fields
          </Link>
        </div>

        {/* Stage Pipeline */}
        <div className="bg-white rounded-xl border border-gray-200 p-5 mb-5">
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-4">Crop Stage Pipeline</h2>
          <div className="flex items-center gap-0">
            {STAGES.map((stage, i) => (
              <div key={stage} className="flex items-center flex-1">
                <div className={`flex-1 rounded-xl p-4 ${STAGE_COLORS[stage]}`}>
                  <div className="flex items-center gap-2 mb-1">
                    <div className={`w-2 h-2 rounded-full ${STAGE_DOT[stage]}`} />
                    <span className="text-xs font-semibold uppercase tracking-wide opacity-70">{STAGE_LABELS[stage]}</span>
                  </div>
                  <div className="text-3xl font-bold">{stageCounts[stage]}</div>
                  <div className="text-xs opacity-60 mt-0.5">{stageCounts[stage] === 1 ? 'field' : 'fields'}</div>
                </div>
                {i < STAGES.length - 1 && (
                  <div className="flex items-center px-1">
                    <svg className="w-5 h-5 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Status Breakdown Bar */}
        <div className="bg-white rounded-xl border border-gray-200 p-5 mb-6">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide">Status Breakdown</h2>
            <span className="text-sm text-gray-400">{stats.total} total fields</span>
          </div>
          <div className="w-full h-4 rounded-full overflow-hidden bg-gray-100 flex">
            {stats.active > 0 && (
              <div
                className="h-full bg-blue-500 transition-all"
                style={{ width: `${activeW}%` }}
                title={`Active: ${stats.active}`}
              />
            )}
            {stats.atRisk > 0 && (
              <div
                className="h-full bg-amber-400 transition-all"
                style={{ width: `${riskW}%` }}
                title={`At Risk: ${stats.atRisk}`}
              />
            )}
            {stats.completed > 0 && (
              <div
                className="h-full bg-green-500 transition-all"
                style={{ width: `${completedW}%` }}
                title={`Completed: ${stats.completed}`}
              />
            )}
            {stats.total === 0 && <div className="h-full w-full bg-gray-200 rounded-full" />}
          </div>
          <div className="flex items-center gap-6 mt-3">
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded-full bg-blue-500" />
              <span className="text-xs text-gray-600">Active <strong>{stats.active}</strong></span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded-full bg-amber-400" />
              <span className="text-xs text-gray-600">At Risk <strong>{stats.atRisk}</strong></span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded-full bg-green-500" />
              <span className="text-xs text-gray-600">Completed <strong>{stats.completed}</strong></span>
            </div>
          </div>
        </div>

        {/* Main grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          {/* Fields table */}
          <div className="lg:col-span-2 bg-white rounded-xl border border-gray-200">
            <div className="px-5 py-4 border-b border-gray-100">
              <h2 className="text-sm font-semibold text-gray-900">All fields</h2>
            </div>
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100">
                  {['Name', 'Crop', 'Stage', 'Agent', 'Status'].map(h => (
                    <th key={h} className="text-left text-xs font-medium text-gray-400 uppercase tracking-wide px-5 py-3">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {fields.length === 0 && (
                  <tr><td colSpan={5} className="text-center text-gray-400 py-10">No fields yet.</td></tr>
                )}
                {fields.map(f => (
                  <tr key={f.id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                    <td className="px-5 py-3 font-medium text-gray-900">{f.name}</td>
                    <td className="px-5 py-3 text-gray-600">{f.cropType}</td>
                    <td className="px-5 py-3 text-gray-600">{STAGE_LABELS[f.currentStage] || f.currentStage}</td>
                    <td className="px-5 py-3 text-gray-600">{f.agent?.name ?? '—'}</td>
                    <td className="px-5 py-3"><StatusBadge status={f.status} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Recent updates */}
          <div className="bg-white rounded-xl border border-gray-200">
            <div className="px-5 py-4 border-b border-gray-100">
              <h2 className="text-sm font-semibold text-gray-900">Recent updates</h2>
            </div>
            <div className="p-4 space-y-4">
              {updates.length === 0 && (
                <p className="text-sm text-gray-400 text-center py-6">No updates yet.</p>
              )}
              {updates.map((u: any) => (
                <div key={u.id} className="border-b border-gray-50 pb-4 last:border-0 last:pb-0">
                  <div className="text-sm font-medium text-gray-900">
                    {u.field?.name ?? 'Field'} → {STAGE_LABELS[u.stage] || u.stage}
                  </div>
                  <div className="text-xs text-gray-400 mt-0.5">
                    {u.agent?.name ?? 'Agent'} · {timeAgo(u.createdAt)}
                  </div>
                  {u.notes && (
                    <div className="text-xs text-gray-600 mt-1 italic">{u.notes}</div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
