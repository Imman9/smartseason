type Status = 'ACTIVE' | 'AT_RISK' | 'COMPLETED' | string

const config: Record<string, { label: string; className: string }> = {
  ACTIVE:    { label: 'Active',    className: 'bg-blue-100 text-blue-700' },
  AT_RISK:   { label: 'At Risk',   className: 'bg-amber-100 text-amber-700' },
  COMPLETED: { label: 'Completed', className: 'bg-green-100 text-green-700' },
}

export default function StatusBadge({ status }: { status: Status }) {
  const cfg = config[status] ?? { label: status, className: 'bg-gray-100 text-gray-700' }
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${cfg.className}`}>
      {cfg.label}
    </span>
  )
}
