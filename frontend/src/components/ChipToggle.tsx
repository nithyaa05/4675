type ChipToggleProps = {
  label: string
  selected: boolean
  onToggle: () => void
}

export function ChipToggle({ label, selected, onToggle }: ChipToggleProps) {
  return (
    <button
      type="button"
      className={`chip${selected ? ' chip--on' : ''}`}
      onClick={onToggle}
      aria-pressed={selected}
    >
      {label}
    </button>
  )
}
