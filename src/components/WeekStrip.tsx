const DAY_LABELS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
const DAY_SHORT = ['M', 'T', 'W', 'T', 'F', 'S', 'S']

interface WeekStripProps {
  workoutDays?: number[] // 1=Mon ... 7=Sun — days with scheduled workouts
}

export function WeekStrip({ workoutDays = [] }: WeekStripProps) {
  const todayJs = new Date().getDay() // 0=Sun ... 6=Sat
  const todayIndex = todayJs === 0 ? 6 : todayJs - 1 // convert to 0=Mon ... 6=Sun

  return (
    <div className="flex gap-1.5">
      {DAY_LABELS.map((label, i) => {
        const isToday = i === todayIndex
        const hasWorkout = workoutDays.includes(i + 1) // 1-indexed
        const isPast = i < todayIndex

        return (
          <div
            key={i}
            title={label}
            className={`flex-1 flex flex-col items-center py-2.5 rounded-lg transition-all ${
              isToday
                ? 'bg-accent shadow-lift'
                : isPast && hasWorkout
                ? 'bg-bg-elevated'
                : 'bg-bg-surface border border-border'
            }`}
          >
            <span
              className={`text-[11px] font-semibold ${
                isToday ? 'text-white' : 'text-text-muted'
              }`}
            >
              {DAY_SHORT[i]}
            </span>

            {/* Workout indicator dot */}
            <div
              className={`mt-1.5 w-1.5 h-1.5 rounded-full transition-all ${
                isToday
                  ? 'bg-white/60'
                  : hasWorkout
                  ? isPast
                    ? 'bg-success'
                    : 'bg-accent/50'
                  : 'bg-transparent'
              }`}
            />
          </div>
        )
      })}
    </div>
  )
}
