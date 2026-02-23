const DAYS = ['M', 'T', 'W', 'T', 'F', 'S', 'S']

export function WeekStrip() {
  const todayJs = new Date().getDay() // 0=Sun ... 6=Sat
  // Convert to 1=Mon ... 7=Sun
  const todayIndex = todayJs === 0 ? 6 : todayJs - 1

  return (
    <div className="flex gap-1.5">
      {DAYS.map((day, i) => (
        <div
          key={i}
          className={`flex-1 flex flex-col items-center py-2 rounded-md border transition-colors ${
            i === todayIndex
              ? 'border-accent bg-accent-dim'
              : 'border-border bg-bg-surface'
          }`}
        >
          <span
            className={`text-xs font-medium ${
              i === todayIndex ? 'text-accent-text' : 'text-text-muted'
            }`}
          >
            {day}
          </span>
        </div>
      ))}
    </div>
  )
}
