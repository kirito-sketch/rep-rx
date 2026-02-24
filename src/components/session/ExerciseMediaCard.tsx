import { useState } from 'react'
import Model, { type IExerciseData, type Muscle } from 'react-body-highlighter'
import { mapMuscle, muscleFromExerciseName, uniqueMuscles } from '../../lib/muscles'

interface Props {
  exerciseName: string
  gifUrl: string | null
  primaryMuscle: string | null
  secondaryMuscles: string[]
}

// Muscles that are visible on the posterior (back) view
const POSTERIOR_MUSCLES = new Set<Muscle>([
  'trapezius', 'upper-back', 'lower-back', 'back-deltoids',
  'gluteal', 'hamstring', 'calves',
])

export function ExerciseMediaCard({ exerciseName, gifUrl, primaryMuscle, secondaryMuscles }: Props) {
  const [gifFailed, setGifFailed] = useState(false)

  const primaryId = (primaryMuscle ? mapMuscle(primaryMuscle) : null) ?? muscleFromExerciseName(exerciseName)
  const secondaryIds = (secondaryMuscles ?? []).map(mapMuscle).filter((m): m is Muscle => m !== null)
  const allMuscles = uniqueMuscles([primaryId, ...secondaryIds])

  const muscleData: IExerciseData[] =
    allMuscles.length > 0 ? [{ name: exerciseName, muscles: allMuscles }] : []

  // Show GIF when available and not broken
  const showGif = !!gifUrl && !gifFailed

  // For PiP: show the view that will actually highlight (prefer posterior if primary muscle is back)
  const pipType = primaryId && POSTERIOR_MUSCLES.has(primaryId) ? 'posterior' : 'anterior'

  const displayLabel = primaryMuscle ?? (primaryId ? String(primaryId).replace(/-/g, ' ') : null)

  return (
    <div className="w-full h-[200px] rounded-xl overflow-hidden relative bg-bg-elevated shadow-card">
      {showGif ? (
        <>
          {/* GIF hero */}
          <div className="w-full h-full flex items-center justify-center bg-white px-4">
            <img
              src={gifUrl}
              alt={`${exerciseName} form`}
              className="h-full w-auto max-w-full object-contain"
              loading="eager"
              onError={() => setGifFailed(true)}
            />
          </div>

          {/* Body diagram PiP — shows the correct view for the primary muscle */}
          {muscleData.length > 0 && (
            <div className="absolute bottom-3 right-3 w-[68px] h-[84px] bg-white/95 rounded-xl p-1.5 shadow-lift">
              <Model
                data={muscleData}
                style={{ width: '100%', height: '100%' }}
                highlightedColors={['#EA580C', '#FB923C']}
                bodyColor="#D6CFBF"
                type={pipType}
                onClick={() => {}}
              />
            </div>
          )}

          {displayLabel && (
            <div className="absolute top-3 left-3">
              <span className="bg-accent text-white text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-full capitalize">
                {displayLabel}
              </span>
            </div>
          )}
        </>
      ) : (
        /* Dual-view anatomy diagram — always renders correctly */
        <div className="w-full h-full flex flex-col">
          <div className="flex-none flex items-center justify-between px-4 pt-3 pb-1">
            <span className={`text-[10px] font-bold uppercase tracking-widest capitalize ${displayLabel ? 'text-accent' : 'text-text-muted'}`}>
              {displayLabel ?? 'Muscle Groups'}
            </span>
            <span className="text-[9px] text-text-muted font-semibold uppercase tracking-wide">
              Front · Back
            </span>
          </div>

          <div className="flex-1 flex items-center justify-center px-5 gap-3 pb-2">
            {muscleData.length > 0 ? (
              <>
                <div className="flex-1 h-full flex items-center justify-center">
                  <Model
                    data={muscleData}
                    style={{ width: '100%', maxHeight: 150 }}
                    highlightedColors={['#EA580C', '#FB923C']}
                    bodyColor="#D6CFBF"
                    type="anterior"
                    onClick={() => {}}
                  />
                </div>
                <div className="w-px h-20 bg-border-subtle self-center" />
                <div className="flex-1 h-full flex items-center justify-center">
                  <Model
                    data={muscleData}
                    style={{ width: '100%', maxHeight: 150 }}
                    highlightedColors={['#EA580C', '#FB923C']}
                    bodyColor="#D6CFBF"
                    type="posterior"
                    onClick={() => {}}
                  />
                </div>
              </>
            ) : (
              <div className="text-center opacity-50">
                <div className="text-4xl mb-1">🏋️</div>
                <p className="text-text-muted text-xs">{exerciseName}</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
