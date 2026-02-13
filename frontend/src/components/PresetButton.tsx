interface PresetButtonProps {
  value: number
  label: string
  selected: boolean
  onClick: (value: number) => void
}

export function PresetButton({ value, label, selected, onClick }: PresetButtonProps) {
  return (
    <button
      type="button"
      onClick={() => onClick(value)}
      className={`tap-highlight-none rounded-xl px-4 py-3 text-center font-semibold transition-all active:scale-95 ${
        selected
          ? 'bg-emerald-500 text-white shadow-md'
          : 'bg-white text-gray-700 shadow-sm border border-gray-200 hover:border-emerald-300'
      }`}
    >
      {label}
    </button>
  )
}
