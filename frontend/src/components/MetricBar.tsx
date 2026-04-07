type MetricBarProps = {
  label: string
  value: number
  hint?: string
}

export function MetricBar({ label, value, hint }: MetricBarProps) {
  const pct = Math.round(Math.min(1, Math.max(0, value)) * 100)
  return (
    <div className="metric-bar">
      <div className="metric-bar__head">
        <span className="metric-bar__label">{label}</span>
        <span className="metric-bar__value">{pct}%</span>
      </div>
      <div className="metric-bar__track" role="presentation">
        <div
          className="metric-bar__fill"
          style={{ width: `${pct}%` }}
        />
      </div>
      {hint ? <p className="metric-bar__hint">{hint}</p> : null}
    </div>
  )
}
