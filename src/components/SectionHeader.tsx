interface SectionHeaderProps {
  title: string
  description?: string
}

export default function SectionHeader({ title, description }: SectionHeaderProps) {
  return (
    <div className="mb-3">
      <h2 className="text-sm font-semibold text-slate-300 uppercase tracking-wider">{title}</h2>
      {description && <p className="text-xs text-slate-500 mt-0.5">{description}</p>}
    </div>
  )
}
