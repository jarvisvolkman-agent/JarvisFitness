interface MetricCardProps {
  label: string
  value: string
  accent?: 'warm' | 'cool' | 'neutral'
}

export default function MetricCard({ label, value, accent = 'neutral' }: MetricCardProps) {
  return (
    <article className={`metric-card metric-card--${accent}`}>
      <p>{label}</p>
      <strong>{value}</strong>
    </article>
  )
}
