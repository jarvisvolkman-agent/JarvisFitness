interface MetricCardProps {
  label: string
  value: string
  accent?: 'warm' | 'cool' | 'neutral'
}

export default function MetricCard({ label, value, accent = 'neutral' }: MetricCardProps) {
  return (
    <article className={`metric-card metric-card-${accent}`}>
      <p className="metric-label">{label}</p>
      <strong className="metric-value">{value}</strong>
    </article>
  )
}
